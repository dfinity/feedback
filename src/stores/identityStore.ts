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
  loginInternetIdentity(): Promise<AuthClient>;
  logout(): Promise<void>;
}

export const useIdentityStore = create<IdentityState>((set, get) => {
  AuthClient.create().then(async (client) => {
    if (await client.isAuthenticated()) {
      set({ user: { type: 'ii', client } });
    }
  });

  return {
    user: null,
    async loginInternetIdentity() {
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
