import { useState } from 'react';
import 'twin.macro';
import { Topic, TopicStatus, useTopicStore } from '../../stores/topicStore';
import TopicList from '../TopicList';
import { handlePromise } from '../../utils/handlers';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const filterStatuses: TopicStatus[] = ['open', 'next', 'completed', 'closed'];

const defaultFilterStates: Record<TopicStatus, boolean> = {
  open: true,
  next: true,
  completed: false,
  closed: false,
};

export default function TopicsPage() {
  const [filterStates, setFilterStates] = useState(defaultFilterStates);

  const topics = useTopicStore((state) => state.topics);
  const vote = useTopicStore((state) => state.vote);

  const filter = (topic: Topic) => !!filterStates[topic.status];

  const visibleTopics = topics.filter(filter);

  return (
    <>
      <div tw="flex justify-around sm:justify-start sm:px-3 sm:text-lg font-semibold pb-5 sm:gap-4 text-white">
        {filterStatuses.map((status) => (
          <div key={status}>
            <label tw="select-none cursor-pointer">
              <input
                tw="mr-2"
                type="checkbox"
                checked={filterStates[status]}
                onChange={() =>
                  setFilterStates({
                    ...filterStates,
                    [status]: !filterStates[status],
                  })
                }
              />
              {capitalize(status)}
            </label>
          </div>
        ))}
      </div>
      <TopicList
        topics={visibleTopics}
        onVote={(item, voteStatus) =>
          handlePromise(
            vote(item, voteStatus),
            'Voting...',
            'Error occurred while voting!',
          )
        }
      />
    </>
  );
}
