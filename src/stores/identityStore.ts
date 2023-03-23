import { AuthClient } from '@dfinity/auth-client';
import { create } from 'zustand';

export interface BackendState {
  clientPromise: Promise<AuthClient>;
  // actor
  login(): Promise<void>;
  logout(): Promise<void>;
}

export const useIdentityStore = create<BackendState>((set, get) => {
  return {
    clientPromise: AuthClient.create()
      // .then((client) => set({ ...get(), client }))
      .catch((err) => {
        // TODO: handle error
        throw err;
      }),
    async login() {
      const client = await get().clientPromise;
      await client.login();
    },
    async logout() {
      const client = await get().clientPromise;
      await client.logout();
    },
  };
});
