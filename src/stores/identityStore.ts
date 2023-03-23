import { AuthClient } from '@dfinity/auth-client';
import { create } from 'zustand';

export interface BackendState {
  client: AuthClient | null;
  // actor
  login(): Promise<AuthClient>;
  logout(): Promise<void>;
}

export const useIdentityStore = create<BackendState>((set, get) => {
  return {
    // clientPromise: AuthClient.create()
    // // .then((client) => set({ ...get(), client }))
    // .catch((err) => {
    //   // TODO: handle error
    //   throw err;
    // })
    client: null,
    async login() {
      // const client = await get().clientPromise;
      const { client } = get();
      if (client) {
        return client;
      } else {
        const client = await AuthClient.create();
        set({ client });
        await client.login();
        return client;
      }
    },
    async logout() {
      const { client } = get();
      if (client) {
        await client.logout();
        set({ client: null });
      }
    },
  };
});
