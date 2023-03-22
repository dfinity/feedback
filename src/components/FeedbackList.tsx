import React, { useState } from 'react';
import { FeedbackItem } from '../stores/feedbackStore';
import FeedbackItemView from './FeedbackItemView';
import 'twin.macro';

export interface FeedbackListProps {
  items: FeedbackItem[];
}

export default function FeedbackList({ items }: FeedbackListProps) {
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
        />
      ))}
    </div>
  );
}
