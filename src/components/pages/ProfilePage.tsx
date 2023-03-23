import { useIdentityStore } from '../../stores/identityStore';

export default function ProfilePage() {
  const user = useIdentityStore((state) => state.user);

  return (
    <>
      <div tw="flex flex-col items-center mt-10">
        <pre>{user ? `Logged in (${user.type})` : 'Logged out'}</pre>
      </div>
    </>
  );
}
