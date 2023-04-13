import { ReactNode } from 'react';
import 'twin.macro';

export interface TagProps {
  color?: string;
  children: ReactNode;
}

export default function Tag({ color, children }: TagProps) {
  return (
    <div
      tw="px-2 py-0.5 rounded-full font-bold text-sm whitespace-nowrap lowercase"
      css={{ background: color || '#e1dceb' }}
    >
      {children}
    </div>
  );
}
