import { useAuth0 } from '@auth0/auth0-react';
import { FaGithub, FaGoogle, FaTwitter } from 'react-icons/fa';
import tw from 'twin.macro';
import styled, { keyframes } from 'styled-components';
// @ts-ignore
import astronautLogo from '../assets/astronaut.svg';
import { useIdentityStore } from '../stores/identityStore';

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
      <LoginButton
        onClick={() => login().catch(onLoginError)}
        tw="p-1 flex items-center justify-center w-[48px] h-[48px]"
      >
        <PulsingImage src={astronautLogo} alt="Internet Identity" />
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
