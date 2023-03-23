import LoginArea from '../LoginArea';

export default function LoginPage() {
  return (
    <>
      <div tw="flex flex-col items-center mt-10">
        {/* <LoginButton onClick={() => loginWithRedirect()}>Login</LoginButton> */}
        <LoginArea />
      </div>
    </>
  );
}
