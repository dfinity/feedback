import React, { useState } from 'react';
import { FeedbackState } from '../stores/feedbackStore';
import FeedbackItemView from './FeedbackItemView';

export interface FeedbackListProps {
  state: FeedbackState;
}

export default function FeedbackList({ state }: FeedbackListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>();

  return (
    <div>
      {state.items.map((item) => (
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
