import 'twin.macro';
import { Topic, useTopicStore } from '../../stores/topicStore';
import TopicView from '../TopicView';
import { useEffect, useState } from 'react';
import { handlePromise } from '../../utils/handlers';
import { useIdentityStore } from '../../stores/identityStore';

export default function QueuePage() {
  const [topics, setTopics] = useState<Topic[]>([]);

  const user = useIdentityStore((state) => state.user);
  const getModeratorQueue = useTopicStore((state) => state.getModeratorQueue);

  useEffect(() => {
    if (user) {
      handlePromise(
        getModeratorQueue(),
        'Fetching topics...',
        'Error while fetching topics!',
      ).then((topics) => setTopics(topics));
    }
  }, [getModeratorQueue, user]);

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
