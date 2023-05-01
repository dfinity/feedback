import { useSearchParams } from 'react-router-dom';
import 'twin.macro';
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
      color={isSelected ? 'rgb(191,219,254)' : color}
      {...rest}
      onClick={onClick}
    >
      {tag}
    </Tag>
  );
}
