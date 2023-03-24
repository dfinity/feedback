import { useState } from 'react';
import { FeedbackItem, VoteStatus } from '../stores/feedbackStore';
import FeedbackListItem from './FeedbackListItem';

export interface FeedbackListProps {
  items: FeedbackItem[];
  onVote?(item: FeedbackItem, voteStatus: VoteStatus): void;
}

export default function FeedbackList({ items, onVote }: FeedbackListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>();

  const sortedItems = [...items].sort(
    (a, b) => b.createTime.getTime() - a.createTime.getTime(),
  );

  return (
    <div tw="flex flex-col gap-3">
      {sortedItems.map((item) => (
        <FeedbackListItem
          key={item.id}
          item={item}
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
