import { ReactNode } from 'react';
import 'twin.macro';

export interface TagProps {
  children: ReactNode;
}

export default function Tag({ children }: TagProps) {
  return (
    <div tw="px-3 py-1 rounded-full font-bold text-sm bg-[#d7cbf1] whitespace-nowrap">
      {children}
    </div>
  );
}
