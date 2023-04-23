import { ReactNode } from 'react';
import { FaRegUserCircle, FaUserCircle } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import tw from 'twin.macro';
// @ts-ignore
import icpLogo from '../assets/icp.png?webp&height=48';
import { useBreakpoint } from '../hooks/useBreakpoint';
import useIdentity from '../hooks/useIdentity';
import LoginArea, { LoginAreaButton } from './LoginArea';
import Tooltip from './Tooltip';

interface NavItemProps {
  to: string;
  children?: ReactNode;
}

function NavItem({ to, children }: NavItemProps) {
  const location = useLocation();

  return (
    <Link to={to} tw="block">
      <div
        tw="px-4 py-3 text-lg box-border hover:bg-gray-200 [border: 4px solid transparent]"
        css={[location.pathname === to && tw`border-b-background`]}
      >
        {children}
      </div>
    </Link>
  );
}

export default function Navbar() {
  const user = useIdentity();
  const breakpoint = useBreakpoint();

  const isMobile = breakpoint === 'xs';

  return (
    <>
      <div tw="h-[60px]" />
      <div tw="fixed top-0 left-0 right-0 z-50 bg-gray-100 text-gray-800">
        <div tw="flex gap-3 px-5 items-stretch max-w-[800px] mx-auto">
          {(!isMobile || !user?.detail.isModerator) && (
            <Tooltip
              content={
                <div tw="text-center">
                  Powered by the
                  <br />
                  <span tw="text-green-300">Internet Computer</span>
                </div>
              }
            >
              <a
                tw="flex items-center hover:scale-105"
                href="https://internetcomputer.org"
                target="_blank"
                rel="noreferrer"
              >
                <img src={icpLogo} alt="Internet Computer" tw="h-[24px]" />
              </a>
            </Tooltip>
          )}
          <div tw="flex-1 flex items-center">
            <NavItem to="/">Browse</NavItem>
            <NavItem to="/submit">Submit</NavItem>
            {!!user?.detail.isModerator && <NavItem to="/queue">Queue</NavItem>}
          </div>
          {isMobile || user ? (
            <Tooltip content="Profile">
              <Link to="/profile" tw="flex items-center">
                <LoginAreaButton>
                  {user ? (
                    // user.type === 'auth0' && user.auth0.picture ? (
                    //   <div
                    //     tw="w-[20px] h-[20px] rounded-full bg-cover"
                    //     css={{
                    //       backgroundImage: `url(${user.auth0.picture})`,
                    //     }}
                    //   />
                    // ) : (
                    <FaUserCircle />
                  ) : (
                    // )
                    <FaRegUserCircle />
                  )}
                </LoginAreaButton>
              </Link>
            </Tooltip>
          ) : (
            <LoginArea />
          )}
        </div>
      </div>
    </>
  );
}
