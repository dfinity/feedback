import React, { useState } from 'react';
import { FeedbackItem } from '../stores/feedbackStore';
import FeedbackItemView from './FeedbackItemView';

export interface FeedbackListProps {
  items: FeedbackItem[];
}

export default function FeedbackList({ items }: FeedbackListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>();

  return (
    <div>
      {items.map((item) => (
        <FeedbackItemView
          item={item}
          expanded={item.id === expandedId}
          onChangeExpanded={(expanded) =>
            setExpandedId(expanded ? item.id : undefined)
          }
        />
      ))}
    </div>
  );
}
