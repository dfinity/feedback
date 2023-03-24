import { Topic, useTopicStore } from '../../stores/topicStore';
import TopicList from '../TopicList';

export default function TopicsPage() {
  const items = useTopicStore((state) => state.topics);
  const vote = useTopicStore((state) => state.vote);

  const filter = (topic: Topic) => {
    return true;
  };

  return (
    <>
      <TopicList
        topics={items.filter(filter)}
        onVote={(item, voteStatus) => vote(item, voteStatus)}
      />
    </>
  );
}
