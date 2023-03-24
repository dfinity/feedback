import { useState } from 'react';
import { Topic, VoteStatus } from '../stores/topicStore';
import TopicView from './TopicView';

export interface TopicListProps {
  topics: Topic[];
  onVote?(topic: Topic, voteStatus: VoteStatus): void;
}

export default function TopicList({ topics: items, onVote }: TopicListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>();

  const sortedItems = [...items].sort(
    (a, b) => b.createTime.getTime() - a.createTime.getTime(),
  );

  return (
    <div tw="flex flex-col gap-3">
      {sortedItems.map((item) => (
        <TopicView
          key={item.id}
          topic={item}
          expanded={item.id === expandedId}
          onChangeExpanded={(expanded) =>
            setExpandedId(expanded ? item.id : undefined)
          }
          onVote={onVote && ((voted) => onVote?.(item, voted))}
        />
      ))}
    </div>
  );
}
