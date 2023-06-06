import { User, useIdentityStore } from '../stores/identityStore';

export default function useIdentity(): User | null | undefined {
  return useIdentityStore((state) => state.user);
}
