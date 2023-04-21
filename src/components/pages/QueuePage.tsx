import { useEffect, useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import tw from 'twin.macro';
import { useIdentityStore } from '../../stores/identityStore';
import { ModStatus, Topic, useTopicStore } from '../../stores/topicStore';
import { handleError } from '../../utils/handlers';
import Loading from '../Loading';
import TopicView from '../TopicView';

const ModeratorButton = tw.div`flex items-center gap-2 font-bold px-3 py-3 text-xl rounded-full cursor-pointer border-2 bg-[#fffd] border-gray-300 hover:scale-105`;

export default function QueuePage() {
  const [topics, setTopics] = useState<Topic[] | undefined>();

  const user = useIdentityStore((state) => state.user);
  const getModeratorQueue = useTopicStore((state) => state.getModeratorQueue);
  const setModeratorStatus = useTopicStore((state) => state.setModeratorStatus);

  useEffect(() => {
    if (user) {
      getModeratorQueue()
        .then((topics) => setTopics(topics))
        .catch((err) =>
          handleError(err, 'Error while fetching moderator queue!'),
        );
    }
  }, [getModeratorQueue, user]);

  const changeStatus = (topic: Topic, modStatus: ModStatus) => {
    setModeratorStatus(topic, modStatus).catch((err) => {
      handleError(err, 'Error while approving topic!');
    });
    if (topics) {
      setTopics(topics.filter((t) => t !== topic));
    }
  };

  if (!topics) {
    return <Loading />;
  }

  return (
    <>
      {topics.length === 0 && (
        <div tw="bg-gray-100 text-xl text-center px-2 py-5 rounded-xl text-gray-600 select-none">
          All caught up!
        </div>
      )}
      <div tw="flex flex-col gap-4 mx-auto">
        {topics.map((topic) => (
          <div key={topic.id}>
            <div tw="flex-1">
              <TopicView
                key={topic.id}
                topic={topic}
                expanded={true}
                hideModerationInfo
              />
            </div>
            <div tw="flex gap-2 mt-2">
              <ModeratorButton onClick={() => changeStatus(topic, 'approved')}>
                <FaCheck tw="text-green-600" />
              </ModeratorButton>
              <ModeratorButton onClick={() => changeStatus(topic, 'rejected')}>
                <FaTimes tw="text-orange-600" />
              </ModeratorButton>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
