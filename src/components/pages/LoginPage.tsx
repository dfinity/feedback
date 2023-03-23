import { useAuth0 } from '@auth0/auth0-react';
import tw from 'twin.macro';

const LoginButton = tw.div`p-3 border-2 text-xl rounded-xl cursor-pointer`;

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <>
      <div tw="flex flex-col items-center mt-10">
        <LoginButton onClick={() => loginWithRedirect()}>Login</LoginButton>
      </div>
    </>
  );
}
