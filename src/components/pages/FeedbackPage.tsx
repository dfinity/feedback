import React from 'react';
import { useFeedbackStore } from '../../stores/feedbackStore';
import FeedbackList from '../FeedbackList';

export default function FeedbackPage() {
  const feedbackState = useFeedbackStore();

  return (
    <>
      <div className="d-flex w-full h-screen">
        <FeedbackList state={feedbackState} />
      </div>
    </>
  );
}
