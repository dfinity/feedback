import LoginArea from '../LoginArea';
import { useIdentityStore } from '../../stores/identityStore';

export default function ProfilePage() {
  const user = useIdentityStore((state) => state.user);

  return (
    <>
      <div tw="flex flex-col items-center p-10 bg-white rounded-xl">
        {/* <LoginButton onClick={() => loginWithRedirect()}>Login</LoginButton> */}
        {user ? (
          <div>
            Logged in: <span tw="font-bold">[ {user.type} ]</span>
          </div>
        ) : (
          <LoginArea />
        )}
      </div>
    </>
  );
}
