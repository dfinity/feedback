import { FaSignOutAlt } from 'react-icons/fa';
import 'twin.macro';
import useIdentity from '../../hooks/useIdentity';
import { useIdentityStore, User } from '../../stores/identityStore';
import LoginArea, { LoginAreaButton } from '../LoginArea';
import Tooltip from '../Tooltip';

const userTypeLookup: Record<User['type'], string> = {
  ic: 'Internet Identity',
  auth0: 'Auth0',
};

export default function ProfilePage() {
  const user = useIdentity();
  const logoutII = useIdentityStore((state) => state.logout);
  // const { logout } = useAuth0();

  const onLogoutError = (err: any) => {
    // TODO: handle errors
    throw err;
  };

  return (
    <>
      <div tw="flex flex-col md:flex-row items-center p-10 bg-gray-100 rounded-xl">
        {/* <LoginButton onClick={() => loginWithRedirect()}>Login</LoginButton> */}
        {user ? (
          <>
            <div tw="flex-1 pb-4 text-xl text-gray-600">
              {user.type === 'auth0' && user.auth0 ? (
                <>
                  Signed in as{' '}
                  <span tw="font-bold mt-1">
                    {user.auth0.given_name ||
                      user.auth0.nickname ||
                      user.auth0.name}
                  </span>
                </>
              ) : user.type === 'ic' ? (
                <>
                  Signed in with principal:
                  <span tw="block text-sm font-bold mt-1">
                    {user.client.getIdentity().getPrincipal().toString()}
                  </span>
                </>
              ) : (
                <>
                  Logged in with{' '}
                  <span tw="font-bold mt-1">
                    {userTypeLookup[user.type] ?? user.type}
                  </span>
                </>
              )}
            </div>
            <div>
              <Tooltip content="Sign out">
                <LoginAreaButton
                  tw="flex gap-1 items-center"
                  onClick={() =>
                    Promise.all([/* logout(), */ logoutII()]).catch(
                      onLogoutError,
                    )
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
