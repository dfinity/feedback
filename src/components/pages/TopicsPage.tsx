import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import {
  SearchSort,
  Topic,
  TopicStatus,
  useTopicStore,
} from '../../stores/topicStore';
import { capitalize } from '../../utils/capitalize';
import { handleError } from '../../utils/handlers';
import TopicList from '../TopicList';
import 'twin.macro';

const filterStatuses: TopicStatus[] = ['open', 'next', 'completed', 'closed'];

const defaultFilterStates: Record<TopicStatus, boolean> = {
  open: true,
  next: true,
  completed: false,
  closed: false,
};

export default function TopicPage() {
  const [filterStates, setFilterStates] = useState(defaultFilterStates);
  const [searchParams] = useSearchParams();

  const topics = useTopicStore((state) => state.topics);
  const sort = useTopicStore((state) => state.sort);
  const navigate = useNavigate();

  const filter = (topic: Topic) => !!filterStates[topic.status];

  const visibleTopics = topics.filter(filter);

  useEffect(() => {
    const id = searchParams.get('topic');
    if (id && id === String(+id) && !topics.some((t) => t.id === id)) {
      navigate(`/topic/${id}`);
    }
  }, [navigate, searchParams, topics]);

  // useEffect(() => {
  //   search().catch((err) => handleError(err, 'Error while fetching topics!'));
  // }, [search]);

  const onChangeSort = (sort: SearchSort) => {
    useTopicStore.setState({ sort });
    useTopicStore
      .getState()
      .search()
      .catch((err) => handleError(err, 'Error while updating search results!'));
  };

  return (
    <>
      <div tw="md:flex items-center pb-5 text-white">
        <div tw="flex-1 flex justify-around sm:justify-start sm:px-3 sm:text-lg font-semibold sm:gap-4">
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
        <div tw="flex gap-2 items-center">
          <label tw="font-semibold text-lg">Sort by:</label>
          <Select
            tw="text-black opacity-95"
            value={{ value: sort, label: capitalize(sort) }}
            onChange={(option) => option && onChangeSort(option.value)}
            isSearchable={false}
            options={['activity', 'votes'].map((s) => {
              return {
                value: s,
                label: capitalize(s),
              } as any;
            })}
          />
        </div>
      </div>
      <TopicList topics={visibleTopics} />
    </>
  );
}
