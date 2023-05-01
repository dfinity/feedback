import { ReactNode } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

const TagDiv = styled.div<TagProps>((p) => [
  tw`px-2 py-0.5 rounded-full font-bold text-sm whitespace-nowrap lowercase`,
  { background: p.color || defaultTagColor },
]);

export const defaultTagColor = '#e1dceb';

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  children: ReactNode;
}

export default function Tag({ color, children, ...rest }: TagProps) {
  return (
    <TagDiv color={color} {...rest}>
      {children}
    </TagDiv>
  );
}
