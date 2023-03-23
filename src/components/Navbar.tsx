import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
// @ts-ignore
import icpLogo from '../assets/icp.png?webp&height=48';
import LoginArea from './LoginArea';

interface NavItemProps {
  to: string;
  children?: ReactNode;
}

function NavItem({ to, children }: NavItemProps) {
  return (
    <Link to={to}>
      <div tw="inline-block px-4 py-5 text-lg h-full hover:bg-gray-200">
        {children}
      </div>
    </Link>
  );
}

export default function Navbar() {
  return (
    <div tw="w-full flex gap-3 items-center bg-gray-100 text-gray-800 px-5">
      <a
        tw="block"
        href="https://internetcomputer.org"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={icpLogo}
          alt="Internet Computer"
          tw="h-[24px] hover:scale-105"
        />
      </a>
      <div tw="flex-1 flex items-center">
        <NavItem to="/">Feedback</NavItem>
        <NavItem to="/history">History</NavItem>
      </div>
      {isMobile ? <NavItem to="/login">Login</NavItem> : <LoginArea />}
    </div>
  );
}
