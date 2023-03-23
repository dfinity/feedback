import { AuthClient } from '@dfinity/auth-client';
import { create } from 'zustand';
import { Principal } from '@dfinity/principal';

export type User =
  | {
      type: 'ii';
      principal: Principal;
    }
  | {
      type: 'auth0';
    };

export interface UserState {
  user: User | null;
  // actor
  login(): Promise<AuthClient>;
  logout(): Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => {
  return {};
});
