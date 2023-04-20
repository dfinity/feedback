import 'twin.macro';
import { Topic } from '../../stores/topicStore';
import TopicView from '../TopicView';

export default function QueuePage() {
  const topics: Topic[] = [];

  return (
    <>
      <div tw="flex flex-col gap-4">
        {topics.map((topic) => (
          <TopicView key={topic.id} topic={topic} expanded={true} />
        ))}
      </div>
    </>
  );
}
