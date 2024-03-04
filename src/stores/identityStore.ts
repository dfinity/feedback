import { HttpAgent } from '@dfinity/agent';
import {
  AuthClient,
  AuthClientLoginOptions,
  ERROR_USER_INTERRUPT,
} from '@dfinity/auth-client';
import { create } from 'zustand';
import { backend } from '../declarations/backend';
import { handleError } from '../utils/handlers';
import { unwrap } from '../utils/unwrap';
import { useTopicStore } from './topicStore';
import { applicationName } from '../setupApp';
import { isLocalNetwork } from '../utils/network';

// Refresh moderator queue on focus browser tab
window.addEventListener('focus', () => {
  const user = useIdentityStore.getState().user;
  if (user?.detail.isModerator) {
    useTopicStore.getState().fetchModQueue();
  }
});

export interface UserDetail {
  id: string;
  isModerator: boolean;
}

export type User = {
  type: 'ic';
  client: AuthClient;
  detail: UserDetail;
};

const localIdentityProvider = `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:4943`;

export interface IdentityState {
  user: User | null | undefined;
  loginInternetIdentity(): Promise<AuthClient | undefined>;
  loginNFID(): Promise<AuthClient | undefined>;
  logout(): Promise<void>;
}

export const useIdentityStore = create<IdentityState>((set, get) => {
  const clientPromise = window.indexedDB
    ? AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true,
        },
      })
    : Promise.resolve(undefined);

  const loginIC = async (
    options?: Omit<Omit<AuthClientLoginOptions, 'onSuccess'>, 'onError'>,
  ) => {
    const client = await clientPromise;
    if (client) {
      try {
        await new Promise((onSuccess: any, onError) =>
          client.login({
            maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1e9),
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
      await finishLoginIC(client);
    }
    return client;
  };

  const finishLoginIC = async (client: AuthClient) => {
    const agent = (backend as any)[Symbol.for('ic-agent-metadata')].config
      .agent as HttpAgent;
    agent.replaceIdentity(client.getIdentity());

    const detail = await getUserDetail();
    console.log('User:', detail);
    set({
      user: {
        type: 'ic',
        client,
        detail,
      },
    });

    // TODO: refactor
    const topicState = useTopicStore.getState();
    await Promise.all([
      topicState.search(),
      detail.isModerator && topicState.fetchModQueue(),
    ]);
  };

  const getUserDetail = async (): Promise<UserDetail> => {
    const loginPromise = backend.login();
    let [view] = await backend.fastLogin();
    if (view === undefined) {
      view = unwrap(await loginPromise);
    }
    return {
      ...view,
      id: String(view.id),
    };
  };

  if (window.indexedDB) {
    (async () => {
      try {
        const client = await clientPromise;
        if (client && (await client.isAuthenticated())) {
          await finishLoginIC(client);
        } else {
          set({ user: null });
        }
      } catch (err) {
        handleError(err, 'Error while fetching user info!');
        window.indexedDB.deleteDatabase('auth-client-db'); // Clear login cache
        set({ user: null });
        return;
      }

      // Fetch topics after authenticating
      useTopicStore
        .getState()
        .search()
        .catch((err) => handleError(err, 'Error while fetching topics!'));
    })();
  } else {
    set({ user: null });
  }

  return {
    user: undefined,
    async loginInternetIdentity() {
      return loginIC({
        identityProvider: isLocalNetwork() ? localIdentityProvider : undefined,
      });
    },
    async loginNFID() {
      return loginIC({
        identityProvider: `https://nfid.one/authenticate/?applicationName=${encodeURIComponent(
          applicationName,
        )}`,
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
