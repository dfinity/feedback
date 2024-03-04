import tw from 'twin.macro';
import astronautLogo from '../assets/astronaut.svg';
import nfidLogo from '../assets/nfid.svg';
import { useIdentityStore } from '../stores/identityStore';
import { handlePromise } from '../utils/handlers';
import Tooltip from './Tooltip';

export const LoginAreaButton = tw.div`p-3 border-2 text-xl rounded-full cursor-pointer bg-[#fff8] hover:bg-gray-100`;

export interface LoginAreaProps {
  label?: boolean;
}

export default function LoginArea({ label }: LoginAreaProps) {
  const loginII = useIdentityStore((state) => state.loginInternetIdentity);
  const loginNFID = useIdentityStore((state) => state.loginNFID);

  const wrapLogin = (promise: Promise<any>) => {
    return handlePromise(
      promise,
      // 'Signing in...',
      undefined,
      'Error while signing in!',
    );
  };

  return (
    <div tw="flex gap-1 items-center">
      <span tw="mr-3 font-semibold opacity-70 text-lg cursor-default">
        Sign in:
      </span>
      <Tooltip content="Internet Identity">
        <LoginAreaButton
          onClick={() => wrapLogin(loginII())}
          tw="p-1 flex items-center justify-center w-[48px] h-[48px]"
        >
          <img src={astronautLogo} alt="Internet Identity" />
        </LoginAreaButton>
      </Tooltip>
      <Tooltip content="NFID Login">
        <LoginAreaButton
          tw="flex gap-1 items-center justify-center w-[80px] h-[48px]"
          onClick={() => wrapLogin(loginNFID())}
        >
          <img src={nfidLogo} alt="NFID" />
        </LoginAreaButton>
      </Tooltip>
    </div>
  );
}
