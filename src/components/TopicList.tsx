import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Topic } from '../stores/topicStore';
import TopicView from './TopicView';

export interface TopicListProps {
  topics: Topic[];
  compact?: boolean;
}

export default function TopicList({ topics, compact }: TopicListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div tw="flex flex-col gap-4">
      {topics.map((topic) => (
        <TopicView
          key={topic.id}
          topic={topic}
          expanded={!compact || topic.id === expandedId}
          onChangeExpanded={
            !compact
              ? undefined
              : (expanded) => {
                  setExpandedId(expanded ? topic.id : undefined);
                  if (expanded) {
                    setSearchParams({ topic: topic.id });
                  } else {
                    searchParams.delete('topic');
                    setSearchParams(searchParams);
                  }
                }
          }
        />
      ))}
    </div>
  );
}
