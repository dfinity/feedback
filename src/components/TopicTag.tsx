import { useSearchParams } from 'react-router-dom';
import tw from 'twin.macro';
import Tag, { TagProps } from './Tag';

export interface TopicTagProps extends TagProps {
  children: string;
}

export default function TopicTag({
  children: tag,
  color,
  ...rest
}: TopicTagProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const onClick = () => {
    if (searchParams.get('tag') !== tag) {
      setSearchParams({ tag });
    } else {
      searchParams.delete('tag');
      setSearchParams(searchParams);
    }
  };

  const isSelected = searchParams.get('tag') === tag;

  return (
    <Tag
      tw="select-none cursor-pointer hover:scale-105"
      css={[
        isSelected &&
          tw`scale-110 [box-shadow: 0 0 8px 2px rgba(83, 51, 152, .8)] z-10`,
      ]}
      {...rest}
      onClick={onClick}
    >
      {tag}
    </Tag>
  );
}
