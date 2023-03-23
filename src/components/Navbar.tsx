import { ReactNode } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation } from 'react-router-dom';
import { FaRegUserCircle, FaUserCircle } from 'react-icons/fa';
import tw from 'twin.macro';
// @ts-ignore
import icpLogo from '../assets/icp.png?webp&height=48';
import { useIdentityStore } from '../stores/identityStore';
import LoginArea, { LoginAreaButton } from './LoginArea';

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
  const user = useIdentityStore((state) => state.user);

  return (
    <div tw="bg-gray-100 text-gray-800">
      <div tw="flex gap-3 items-stretch px-5 max-w-[800px] mx-auto">
        <a
          tw="flex items-center hover:scale-105"
          href="https://internetcomputer.org"
          target="_blank"
          rel="noreferrer"
        >
          <img src={icpLogo} alt="Internet Computer" tw="h-[24px]" />
        </a>
        <div tw="flex-1 flex items-center">
          <NavItem to="/">Feedback</NavItem>
          <NavItem to="/history">History</NavItem>
        </div>
        {isMobile || user ? (
          <Link to="/profile" tw="flex items-center">
            <LoginAreaButton>
              {user ? <FaUserCircle /> : <FaRegUserCircle />}
            </LoginAreaButton>
          </Link>
        ) : (
          <LoginArea />
        )}
      </div>
    </div>
  );
}
