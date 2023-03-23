import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import icpLogo from '../assets/icp.png?webp&height=48';

interface NavItemProps {
  to: string;
  children?: ReactNode;
}

function NavItem({ to, children }: NavItemProps) {
  return (
    <Link to={to}>
      <div tw="inline-block p-5 text-lg h-full">{children}</div>
    </Link>
  );
}

export default function Navbar() {
  return (
    <div tw="w-full flex items-center bg-gray-100 text-gray-800">
      <div tw="w-full flex items-center">
        <a
          tw="h-full px-5"
          href="https://internetcomputer.org"
          target="_blank"
          rel="noreferrer"
        >
          <img src={icpLogo} alt="Internet Computer" tw="h-[24px]" />
        </a>
        <NavItem to="/">Feedback</NavItem>
        <NavItem to="/history">History</NavItem>
      </div>
      <NavItem to="/login">Login</NavItem>
    </div>
  );
}
