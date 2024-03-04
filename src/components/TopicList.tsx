import { useState } from 'react';
import { Topic } from '../stores/topicStore';
import TopicView from './TopicView';

export interface TopicListProps {
  topics: Topic[];
  compact?: boolean;
}

export default function TopicList({ topics, compact }: TopicListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>();

  return (
    <div tw="flex flex-col gap-4">
      {topics.map((topic) => (
        <TopicView
          key={topic.id}
          topic={topic}
          expanded={!compact || topic.id === expandedId}
          onChangeExpanded={
            !compact || topic.id === expandedId
              ? undefined
              : (expanded) => {
                  setExpandedId(expanded ? topic.id : undefined);
                }
          }
        />
      ))}
    </div>
  );
}
