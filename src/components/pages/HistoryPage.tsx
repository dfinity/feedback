import { useFeedbackStore } from '../../stores/feedbackStore';
import FeedbackList from '../FeedbackList';

export default function HistoryPage() {
  const items = useFeedbackStore((state) => state.items);
  const vote = useFeedbackStore((state) => state.vote);

  return (
    <>
      <FeedbackList
        items={items.filter((item) => item.status === 'completed')}
        onVote={(item, voteStatus) => vote(item, voteStatus)}
      />
    </>
  );
}
