import React from 'react';
import { useFeedbackStore } from '../../stores/feedbackStore';
import FeedbackList from '../FeedbackList';

export default function FeedbackPage() {
  const { items } = useFeedbackStore();

  return (
    <>
      <div className="d-flex w-full h-screen">
        <FeedbackList
          items={items.filter(
            (item) => item.status === 'completed' || item.status === 'closed',
          )}
        />
      </div>
    </>
  );
}
