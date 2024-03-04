import { useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import tw from 'twin.macro';
import useIdentity from '../../hooks/useIdentity';
import { ModStatus, Topic, useTopicStore } from '../../stores/topicStore';
import { handleError } from '../../utils/handlers';
import Loading from '../Loading';
import TopicView from '../TopicView';
import { promptModMessage } from '../../utils/promptModMessage';

const ModeratorButton = tw.div`flex items-center gap-2 font-bold px-3 py-3 text-xl rounded-full cursor-pointer border-2 bg-[#fffd] border-gray-300 hover:scale-105`;

export default function QueuePage() {
  const user = useIdentity();
  const topics = useTopicStore((state) => state.modQueue);
  const getModQueue = useTopicStore((state) => state.fetchModQueue);
  const setModStatus = useTopicStore((state) => state.setModStatus);

  useEffect(() => {
    if (user) {
      getModQueue().catch((err) =>
        handleError(err, 'Error while fetching moderator queue!'),
      );
    }
  }, [getModQueue, user]);

  const changeModStatus = (topic: Topic, modStatus: ModStatus) => {
    const promise =
      modStatus === 'rejected'
        ? promptModMessage(topic, modStatus)
        : setModStatus(topic, modStatus);

    promise.catch((err) => {
      handleError(err, 'Error while changing topic status!');
    });
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
            <div tw="flex">
              <div tw="flex gap-2 mt-2 mx-auto">
                <ModeratorButton
                  onClick={() => changeModStatus(topic, 'approved')}
                >
                  <FaCheck tw="text-green-600" />
                </ModeratorButton>
                <ModeratorButton
                  onClick={() => changeModStatus(topic, 'rejected')}
                >
                  <FaTimes tw="text-orange-600" />
                </ModeratorButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
