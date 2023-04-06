import { useAuth0 } from '@auth0/auth0-react';
// import { FaGithub, FaGoogle, FaTwitter } from 'react-icons/fa';
// import styled, { keyframes } from 'styled-components';
import { useEffect } from 'react';
import tw from 'twin.macro';
import astronautLogo from '../assets/astronaut.svg';
import nfidLogo from '../assets/nfid.svg';
import { useIdentityStore } from '../stores/identityStore';
import { handleError } from '../utils/handlers';
import Tooltip from './Tooltip';

// const pulseAnimation = keyframes`
//   0% {
//     transform: scale(1)
//   }
//   50% {
//     transform:scale(1.1)
//   }
// `;

// const PulsingImage = styled.img`
//   animation: ${pulseAnimation} 2s ease-in-out infinite;
// `;

export const LoginAreaButton = tw.div`p-3 border-2 text-xl rounded-full cursor-pointer bg-[#fff8] hover:bg-gray-100`;

export interface LoginAreaProps {
  label?: boolean;
}

export default function LoginArea({ label }: LoginAreaProps) {
  // TODO: refactor Auth0 logic into `identityStore`
  const { user: auth0User } = useAuth0();
  const loginII = useIdentityStore((state) => state.loginInternetIdentity);
  const loginNFID = useIdentityStore((state) => state.loginNFID);

  useEffect(() => {
    if (auth0User) {
      console.log(auth0User); //

      useIdentityStore.setState({ user: { type: 'auth0', auth0: auth0User } });
    }
  });

  const onLoginError = (err: any) => {
    handleError(err, 'Error while logging in!');
  };

  return (
    <div tw="flex gap-1 items-center">
      <span tw="mr-3 font-semibold opacity-70 select-none">Sign in:</span>
      <Tooltip content="Internet Identity">
        <LoginAreaButton
          onClick={() => loginII().catch(onLoginError)}
          tw="p-1 flex items-center justify-center w-[48px] h-[48px]"
        >
          {/* <PulsingImage src={astronautLogo} alt="Internet Identity" /> */}
          <img src={astronautLogo} alt="Internet Identity" />
        </LoginAreaButton>
      </Tooltip>
      <Tooltip content="Social Login">
        <LoginAreaButton
          tw="flex gap-1 items-center justify-center w-[80px] h-[48px]"
          onClick={() => loginNFID().catch(onLoginError)}
        >
          <img src={nfidLogo} alt="NFID" />
        </LoginAreaButton>
      </Tooltip>
      {/* <Tooltip
        content="Social Login"
      >
        <LoginAreaButton
          tw="flex gap-1 items-center"
          onClick={() => loginWithRedirect().catch(handleError)}
        >
          <FaGoogle />
          <FaGithub />
          <FaTwitter />
        </LoginAreaButton>
      </Tooltip> */}
    </div>
  );
}
