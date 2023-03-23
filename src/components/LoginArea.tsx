import { useAuth0 } from '@auth0/auth0-react';
import { FaGithub, FaGoogle, FaTwitter } from 'react-icons/fa';
import tw from 'twin.macro';
import { useIdentityStore } from '../stores/identityStore';

const LoginButton = tw.div`p-3 border-2 text-xl rounded-full cursor-pointer`;

export default function LoginArea() {
  const { loginWithRedirect } = useAuth0();
  const login = useIdentityStore((state) => state.login);

  const onLoginError = (err: any) => {
    // TODO: error banner UI
    throw err;
  };

  return (
    <div tw="flex gap-1 items-center">
      <LoginButton onClick={() => login().catch(onLoginError)}>
        Identity
      </LoginButton>
      <LoginButton
        tw="flex gap-1 items-center"
        onClick={() => loginWithRedirect().catch(onLoginError)}
      >
        <FaGoogle />
        <FaGithub />
        <FaTwitter />
      </LoginButton>
    </div>
  );
}
