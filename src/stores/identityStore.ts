import { type User as Auth0User } from '@auth0/auth0-react';
import { AuthClient, AuthClientLoginOptions } from '@dfinity/auth-client';
import { create } from 'zustand';
import { useTopicStore } from './topicStore';

export type User =
  | {
      type: 'ic';
      client: AuthClient;
    }
  | {
      type: 'auth0';
      auth0: Auth0User;
    };

export interface IdentityState {
  user: User | null;
  loginInternetIdentity(): Promise<AuthClient>;
  loginNFID(): Promise<AuthClient>;
  logout(): Promise<void>;
}

export const useIdentityStore = create<IdentityState>((set, get) => {
  if (window.indexedDB) {
    AuthClient.create().then(async (client) => {
      if (await client.isAuthenticated()) {
        set({ user: { type: 'ic', client } });
      }

      // Fetch topics after authenticating
      useTopicStore.getState().fetch();
      // handlePromise(
      //    useTopicStore.getState().fetch(),
      //   'Fetching...',
      //   'Error while fetching topics!',
      // );
    });
  }

  const loginIC = async (
    options?: Omit<Omit<AuthClientLoginOptions, 'onSuccess'>, 'onError'>,
  ) => {
    const { user } = get();
    if (user?.type === 'ic') {
      return user.client;
    } else {
      const client = await AuthClient.create();
      set({
        user: {
          type: 'ic',
          client,
        },
      });
      if (!(await client.isAuthenticated())) {
        await new Promise((onSuccess: any, onError) =>
          client.login({
            maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
            ...(options || {}),
            onSuccess,
            onError,
          }),
        );
      }
      return client;
    }
  };

  return {
    user: null,
    async loginInternetIdentity() {
      return loginIC();
    },
    async loginNFID() {
      return loginIC({
        identityProvider:
          'https://nprnb-waaaa-aaaaj-qax4a-cai.icp0.io/#authorize',
        windowOpenerFeatures:
          `left=${window.screen.width / 2 - 525 / 2},` +
          `top=${window.screen.height / 2 - 705 / 2},` +
          'toolbar=0,location=0,menubar=0,width=525,height=705',
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
