import { ReactNode } from 'react';
import 'twin.macro';

export interface TagProps {
  color?: string;
  children: ReactNode;
}

export default function Tag({ color, children }: TagProps) {
  return (
    <div
      tw="px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap lowercase"
      css={{ background: color || '#d7cbf1' }}
    >
      {children}
    </div>
  );
}
