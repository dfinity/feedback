import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Topic } from '../stores/topicStore';
import TopicView from './TopicView';

export interface TopicListProps {
  topics: Topic[];
}

export default function TopicList({ topics }: TopicListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortedTopics = [...topics].sort((a, b) => b.createTime - a.createTime);

  return (
    <div tw="flex flex-col gap-4">
      {sortedTopics.map((topic) => (
        <TopicView
          key={topic.id}
          topic={topic}
          expanded={topic.id === expandedId}
          onChangeExpanded={(expanded) => {
            setExpandedId(expanded ? topic.id : undefined);
            if (expanded) {
              setSearchParams({ topic: topic.id });
            } else {
              searchParams.delete('topic');
              setSearchParams(searchParams);
            }
          }}
        />
      ))}
    </div>
  );
}
