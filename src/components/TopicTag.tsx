import { useSearchParams } from 'react-router-dom';
import 'twin.macro';
import tw from 'twin.macro';
import Tag, { TagProps } from './Tag';

export interface TopicTagProps extends TagProps {
  children: string;
}

export default function TopicTag({ children: tag, ...rest }: TopicTagProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const onClick = () => {
    if (searchParams.get('tag') !== tag) {
      setSearchParams({ tag });
    } else {
      searchParams.delete('tag');
      setSearchParams(searchParams);
    }
  };

  return (
    <Tag
      tw="select-none cursor-pointer hover:scale-105"
      css={[searchParams.get('tag') === tag && tw`bg-blue-200`]}
      {...rest}
      onClick={onClick}
    >
      {tag}
    </Tag>
  );
}
