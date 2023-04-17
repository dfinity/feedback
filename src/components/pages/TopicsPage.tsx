import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import 'twin.macro';
import { Topic, TopicStatus, useTopicStore } from '../../stores/topicStore';
import TopicList from '../TopicList';

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
  const [searchParams] = useSearchParams();

  const topics = useTopicStore((state) => state.topics);
  const navigate = useNavigate();

  const filter = (topic: Topic) => !!filterStates[topic.status];

  const visibleTopics = topics.filter(filter);

  useEffect(() => {
    const id = searchParams.get('topic');
    if (id && id === String(+id) && !topics.some((t) => t.id === id)) {
      navigate(`/topic/${id}`);
    }
  }, [navigate, searchParams, topics]);

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
      <TopicList topics={visibleTopics} />
    </>
  );
}
