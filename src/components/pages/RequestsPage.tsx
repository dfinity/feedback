import { useFeedbackStore } from '../../stores/feedbackStore';
import FeedbackList from '../FeedbackList';

export default function RequestsPage() {
  const items = useFeedbackStore((state) => state.items);
  const vote = useFeedbackStore((state) => state.vote);

  return (
    <>
      <div className="d-flex w-full h-screen">
        <FeedbackList
          items={items.filter((item) => item.status === 'open')}
          onVote={(item, voteStatus) => vote(item, voteStatus)}
        />
      </div>
    </>
  );
}
