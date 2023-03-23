import { useAuth0 } from '@auth0/auth0-react';
import { FaGithub, FaGoogle, FaPersonBooth, FaTwitter } from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';
import tw from 'twin.macro';
// @ts-ignore
import astronautLogo from '../assets/astronaut.svg';
import { useIdentityStore } from '../stores/identityStore';
import { useUserStore } from '../stores/userStore';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1)
  }
  50% {
    transform:scale(1.1)
  }
`;

const PulsingImage = styled.img`
  animation: ${pulseAnimation} 2s ease-in-out infinite;
`;

const LoginAreaButton = tw.div`p-3 border-2 text-xl rounded-full cursor-pointer`;

export default function LoginArea() {
  const { loginWithRedirect, logout } = useAuth0();
  const user = useUserStore((state) => state.user);
  const loginII = useIdentityStore((state) => state.login);
  const logoutII = useIdentityStore((state) => state.logout);

  const onLoginError = (err: any) => {
    // TODO: error banner UI
    throw err;
  };

  console.log(user); ////

  return (
    <div tw="flex gap-1 items-center">
      {user ? (
        <>
          <LoginAreaButton
            tw="flex gap-1 items-center"
            onClick={() =>
              Promise.all([logout(), logoutII()]).catch(onLoginError)
            }
          >
            <FaPersonBooth />
          </LoginAreaButton>
        </>
      ) : (
        <>
          <LoginAreaButton
            onClick={() => loginII().catch(onLoginError)}
            tw="p-1 flex items-center justify-center w-[48px] h-[48px]"
          >
            <PulsingImage src={astronautLogo} alt="Internet Identity" />
          </LoginAreaButton>
          <LoginAreaButton
            tw="flex gap-1 items-center"
            onClick={() => loginWithRedirect().catch(onLoginError)}
          >
            <FaGoogle />
            <FaGithub />
            <FaTwitter />
          </LoginAreaButton>
        </>
      )}
    </div>
  );
}
