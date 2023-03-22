import React, { useState } from 'react';
import { FeedbackItem } from '../stores/feedbackStore';
import FeedbackItemView from './FeedbackItemView';
import 'twin.macro';

export interface FeedbackListProps {
  items: FeedbackItem[];
  onVote?(item: FeedbackItem, voted: boolean): void;
}

export default function FeedbackList({ items, onVote }: FeedbackListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>();

  return (
    <div tw="flex flex-col gap-3 py-5">
      {items.map((item) => (
        <FeedbackItemView
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
