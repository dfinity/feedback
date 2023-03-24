import { useTopicStore } from '../../stores/topicStore';
import TopicList from '../TopicList';

export default function TopicsPage() {
  const items = useTopicStore((state) => state.requests);
  const vote = useTopicStore((state) => state.vote);

  return (
    <>
      <TopicList
        topics={items.filter((item) => item.status === 'open')}
        onVote={(item, voteStatus) => vote(item, voteStatus)}
      />
    </>
  );
}
