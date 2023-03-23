import { useAuth0 } from '@auth0/auth0-react';
import {
  FaGithub,
  FaGoogle,
  FaSignOutAlt,
  FaTwitter,
  FaUserCircle,
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';
import tw from 'twin.macro';
// @ts-ignore
import { Link } from 'react-router-dom';
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

const LoginAreaButton = tw.div`p-3 border-2 text-xl rounded-full cursor-pointer`;

export default function LoginArea() {
  // TODO: refactor Auth0 logic into `identityStore`
  const { loginWithRedirect, logout } = useAuth0();
  const user = useIdentityStore((state) => state.user);
  const loginII = useIdentityStore((state) => state.loginInternetIdentity);
  const logoutII = useIdentityStore((state) => state.logout);

  const onLoginError = (err: any) => {
    // TODO: error banner UI
    throw err;
  };

  return (
    <div tw="flex gap-1 items-center">
      {user ? (
        <>
          <Link to="/profile">
            <LoginAreaButton tw="flex gap-1 items-center">
              <FaUserCircle />
            </LoginAreaButton>
          </Link>
          <LoginAreaButton
            tw="flex gap-1 items-center"
            onClick={() =>
              Promise.all([logout(), logoutII()]).catch(onLoginError)
            }
          >
            <FaSignOutAlt />
          </LoginAreaButton>
        </>
      ) : (
        <>
          <span tw="mr-3 uppercase font-bold opacity-60 select-none hidden sm:block">
            Login:
          </span>
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
