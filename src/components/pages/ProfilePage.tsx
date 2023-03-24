import { useAuth0 } from '@auth0/auth0-react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useIdentityStore } from '../../stores/identityStore';
import LoginArea, { LoginAreaButton } from '../LoginArea';
import Tooltip from '../Tooltip';

export default function ProfilePage() {
  const user = useIdentityStore((state) => state.user);
  const logoutII = useIdentityStore((state) => state.logout);
  const { logout } = useAuth0();

  const onLogoutError = (err: any) => {
    // TODO: handle errors
    throw err;
  };

  return (
    <>
      <div tw="flex flex-col items-center p-10 bg-white rounded-xl">
        {/* <LoginButton onClick={() => loginWithRedirect()}>Login</LoginButton> */}
        {user ? (
          <>
            <div tw="pb-3">
              Logged in: <span tw="font-bold">[ {user.type} ]</span>
            </div>
            <div>
              <Tooltip content="Sign out">
                <LoginAreaButton
                  tw="flex gap-1 items-center"
                  onClick={() =>
                    Promise.all([logout(), logoutII()]).catch(onLogoutError)
                  }
                >
                  <FaSignOutAlt />
                </LoginAreaButton>
              </Tooltip>
            </div>
          </>
        ) : (
          <LoginArea />
        )}
      </div>
    </>
  );
}
