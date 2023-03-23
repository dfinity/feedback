import { create } from 'zustand';
import {} from '@dfinity/identity';
import { AuthClient } from '@dfinity/auth-client';

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
      const client = await this.clientPromise;
      await client.login();
    },
    async logout() {
      const client = await this.clientPromise;
      await client.logout();
    },
  };
});
