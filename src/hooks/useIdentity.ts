import { User, useIdentityStore } from '../stores/identityStore';

export default function useIdentity(): User | null {
  return useIdentityStore((state) => state.user);
}
