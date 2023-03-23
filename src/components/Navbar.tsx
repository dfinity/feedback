import { ReactNode } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation } from 'react-router-dom';
// @ts-ignore
import icpLogo from '../assets/icp.png?webp&height=48';
import LoginArea from './LoginArea';
import tw from 'twin.macro';

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
  return (
    <div tw="w-full flex gap-3 items-stretch bg-gray-100 text-gray-800 px-5">
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
      {isMobile ? <NavItem to="/login">Login</NavItem> : <LoginArea />}
    </div>
  );
}
