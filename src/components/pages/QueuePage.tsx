import 'twin.macro';
import { Topic, useTopicStore } from '../../stores/topicStore';
import TopicView from '../TopicView';
import { useEffect, useState } from 'react';
import { handlePromise } from '../../utils/handlers';

export default function QueuePage() {
  const [topics, setTopics] = useState<Topic[]>([]);

  const getModeratorQueue = useTopicStore((state) => state.getModeratorQueue);

  useEffect(() => {
    handlePromise(
      getModeratorQueue(),
      'Fetching topics...',
      'Error while fetching topics!',
    ).then((topics) => setTopics(topics));
  }, [getModeratorQueue]);

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
