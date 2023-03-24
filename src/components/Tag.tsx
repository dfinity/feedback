import { ReactNode } from 'react';

export interface TagProps {
  children: ReactNode;
}

export default function Tag({ children }: TagProps) {
  return (
    <div tw="px-3 py-1 rounded-full font-bold text-sm bg-[#d7cbf1]">
      {children}
    </div>
  );
}
