import { useAuth0 } from '@auth0/auth0-react';
import { FaGithub, FaGoogle, FaTwitter } from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';
import tw from 'twin.macro';
// @ts-ignore
import astronautLogo from '../assets/astronaut.svg';
import { useIdentityStore } from '../stores/identityStore';
import Tooltip from './Tooltip';

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

export const LoginAreaButton = tw.div`p-3 border-2 text-xl rounded-full cursor-pointer hover:bg-[rgba(0,0,0,.05)]`;

export interface LoginAreaProps {
  label?: boolean;
}

export default function LoginArea({ label }: LoginAreaProps) {
  // TODO: refactor Auth0 logic into `identityStore`
  const { loginWithRedirect } = useAuth0();
  // const user = useIdentityStore((state) => state.user);
  const loginII = useIdentityStore((state) => state.loginInternetIdentity);

  const onLoginError = (err: any) => {
    // TODO: error banner UI
    throw err;
  };

  return (
    <div tw="flex gap-1 items-center">
      <span tw="mr-3 uppercase font-bold opacity-60 select-none">Login:</span>
      <Tooltip
        content="Internet Identity"
        // position="bottom"
        // trigger="mouseenter"
        // animation="scale"
      >
        <LoginAreaButton
          onClick={() => loginII().catch(onLoginError)}
          tw="p-1 flex items-center justify-center w-[48px] h-[48px]"
        >
          <PulsingImage src={astronautLogo} alt="Internet Identity" />
        </LoginAreaButton>
      </Tooltip>
      <Tooltip
        content="Social Login"
        // position="bottom"
        // trigger="mouseenter"
        // animation="scale"
      >
        <LoginAreaButton
          tw="flex gap-1 items-center"
          onClick={() => loginWithRedirect().catch(onLoginError)}
        >
          <FaGoogle />
          <FaGithub />
          <FaTwitter />
        </LoginAreaButton>
      </Tooltip>
    </div>
  );
}
