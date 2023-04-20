import { type User as Auth0User } from '@auth0/auth0-react';
import { HttpAgent } from '@dfinity/agent';
import {
  AuthClient,
  AuthClientLoginOptions,
  ERROR_USER_INTERRUPT,
} from '@dfinity/auth-client';
import { create } from 'zustand';
import { UserView } from '../../.dfx/local/canisters/backend/backend.did';
import { backend } from '../declarations/backend';
import { handleError } from '../utils/handlers';
import { useTopicStore } from './topicStore';

export type User = (
  | {
      type: 'ic';
      client: AuthClient;
    }
  | {
      type: 'auth0';
      auth0: Auth0User;
    }
) & {
  view: UserView;
};

// TODO: refactor
const applicationName = 'IC Feedback';

const localIdentityProvider = `http://localhost:4943?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;

export interface IdentityState {
  user: User | null;
  loginInternetIdentity(): Promise<AuthClient | undefined>;
  loginNFID(): Promise<AuthClient | undefined>;
  logout(): Promise<void>;
}

export const useIdentityStore = create<IdentityState>((set, get) => {
  if (window.indexedDB) {
    AuthClient.create().then(async (client) => {
      try {
        if (await client.isAuthenticated()) {
          await updateIdentity(client);
          const view = await getUserView();
          if (import.meta.env.DEV) {
            console.log('User:', view);
          }
          set({
            user: {
              type: 'ic',
              client,
              view,
            },
          });
        }
      } catch (err) {
        handleError(err, 'Error while fetching user info!');
      }

      // Fetch topics after authenticating
      useTopicStore
        .getState()
        .search()
        .catch((err) => handleError(err, 'Error while fetching topics!'));
    });
  }

  const loginIC = async (
    options?: Omit<Omit<AuthClientLoginOptions, 'onSuccess'>, 'onError'>,
  ) => {
    const client = await AuthClient.create();
    if (!(await client.isAuthenticated())) {
      try {
        await new Promise((onSuccess: any, onError) =>
          client.login({
            maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
            ...(options || {}),
            onSuccess,
            onError,
          }),
        );
      } catch (err) {
        if (err === ERROR_USER_INTERRUPT) {
          return;
        }
        throw err;
      }

      await updateIdentity(client);
      // const userId = await handlePromise(
      //   fetchUser(),
      //   'Signing in...',
      //   'Error while signing in!',
      // );
      const view = await getUserView();
      if (import.meta.env.DEV) {
        console.log('User:', view);
      }
      set({
        user: {
          type: 'ic',
          client,
          view,
        },
      });
    }
    return client;
  };

  const updateIdentity = async (client: AuthClient) => {
    (
      (backend as any)[Symbol.for('ic-agent-metadata')].config
        .agent as HttpAgent
    ).replaceIdentity(client.getIdentity());
  };

  const getUserView = async () => {
    const [view] = await backend.fastLogin();
    if (view !== undefined) {
      return view;
    }
    return await backend.login();
  };

  return {
    user: null,
    async loginInternetIdentity() {
      return loginIC({
        identityProvider: import.meta.env.PROD
          ? undefined
          : localIdentityProvider,
      });
    },
    async loginNFID() {
      return loginIC({
        identityProvider: `https://nfid.one/authenticate/?applicationName=${encodeURIComponent(
          applicationName,
        )}`,
        // windowOpenerFeatures:
        //   `left=${window.screen.width / 2 - 525 / 2},` +
        //   `top=${window.screen.height / 2 - 705 / 2},` +
        //   'toolbar=0,location=0,menubar=0,width=525,height=705',
      });
    },
    async logout() {
      const { user } = get();
      if (user?.type === 'ic') {
        await user.client.logout();
      }
      set({ user: null });
    },
  };
});
