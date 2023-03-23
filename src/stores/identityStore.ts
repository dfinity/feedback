import { AuthClient } from '@dfinity/auth-client';
import { create } from 'zustand';

export type User =
  | {
      type: 'ii';
      client: AuthClient;
    }
  | {
      type: 'auth0';
    };

export interface IdentityState {
  user: User | null;
  // actor
  loginInternetIdentity(): Promise<AuthClient>;
  logout(): Promise<void>;
}

export const useIdentityStore = create<IdentityState>((set, get) => {
  return {
    // clientPromise: AuthClient.create()
    // // .then((client) => set({ ...get(), client }))
    // .catch((err) => {
    //   // TODO: handle error
    //   throw err;
    // })
    user: null,
    async loginInternetIdentity() {
      // const client = await get().clientPromise;
      const { user } = get();
      if (user?.type === 'ii') {
        return user.client;
      } else {
        const client = await AuthClient.create();
        set({
          user: {
            type: 'ii',
            client,
          },
        });
        await client.login();
        return client;
      }
    },
    async logout() {
      const { user } = get();
      if (user?.type === 'ii') {
        await user.client.logout();
      }
      set({ user: null });
    },
  };
});
