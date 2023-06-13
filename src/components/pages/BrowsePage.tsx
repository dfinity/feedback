import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import 'twin.macro';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  SEARCH_SORTS,
  SearchSort,
  Topic,
  TopicStatus,
  useTopicStore,
} from '../../stores/topicStore';
import { capitalize } from '../../utils/capitalize';
import { handleError } from '../../utils/handlers';
import TopicList from '../TopicList';
import Tooltip from '../Tooltip';

const filterStatuses: TopicStatus[] = ['open', 'next', 'completed', 'closed'];

const defaultFilterStates: Record<TopicStatus, boolean> = {
  open: true,
  next: true,
  completed: false,
  closed: false,
};

const statusTooltips: Record<TopicStatus, string> = {
  open: 'Thing thing',
  next: 'Thing thing',
  completed: 'Thing thing',
  closed: 'Thing thing',
};

export default function BrowsePage() {
  const [filterStates, setFilterStates] = useState(defaultFilterStates);
  const [filterText, setFilterText] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const breakpoint = useBreakpoint();

  const topics = useTopicStore((state) => state.topics);
  const sort = useTopicStore((state) => state.sort);
  // const tags = useTopicStore((state) => state.tags);
  const navigate = useNavigate();

  const tag = searchParams.get('tag');

  const visibleTopics = topics.filter((topic: Topic) => {
    if (filterText) {
      // Show all topics matching the query regardless of other search params
      return topic.title.toLowerCase().includes(filterText.toLowerCase());
    }
    if (tag && !topic.tags.includes(tag)) {
      return false;
    }
    return !!filterStates[topic.status];
  });

  useEffect(() => {
    const id = searchParams.get('topic');
    if (id && id === String(+id) && !topics.some((t) => t.id === id)) {
      navigate(`/topic/${id}`);
    }
  }, [navigate, searchParams, topics]);

  // useEffect(() => {
  //   search().catch((err) => handleError(err, 'Error while fetching topics!'));
  // }, [search]);

  const onChangeSort = useCallback(
    (sort: SearchSort) => {
      useTopicStore.setState({ sort });
      useTopicStore
        .getState()
        .search()
        .catch((err) =>
          handleError(err, 'Error while updating search results!'),
        );
      searchParams.set('sort', sort);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam && sortParam !== sort && SEARCH_SORTS.includes(sortParam)) {
      onChangeSort(sortParam as SearchSort);
    }
  }, [onChangeSort, searchParams, sort]);

  const sortDropdown = (
    <div tw="flex gap-2 items-center">
      <label tw="font-semibold sm:text-lg text-white opacity-80">
        Sort by:
      </label>
      <Select
        tw="opacity-95 z-10"
        value={{ value: sort, label: capitalize(sort) }}
        onChange={(option) => option && onChangeSort(option.value)}
        isSearchable={false}
        options={SEARCH_SORTS.map((s) => {
          return {
            value: s,
            label: capitalize(s),
          } as any;
        })}
      />
    </div>
  );
  const inlineSort = breakpoint === 'xs';

  return (
    <>
      <div tw="h-[100px] mb-2 sm:h-[122px]" />
      <div tw="fixed bg-background top-[60px] left-0 right-0 pt-5 z-50 shadow-md shadow-background">
        <div tw="max-w-[800px] mx-auto px-5">
          <div tw="flex mb-4 gap-2 items-center">
            <input
              tw="w-full text-lg rounded-3xl px-4 py-2 sm:py-3 opacity-90 hover:opacity-95 focus:opacity-95"
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search..."
            />
            {/* <Select isMulti options={tags.map((tag) => tag.name)} /> */}
            {inlineSort && <div tw="shrink-0">{sortDropdown}</div>}
          </div>
          <div tw="sm:flex items-center pb-4">
            <div tw="flex-1 flex justify-around sm:justify-start sm:px-3 sm:text-lg font-semibold sm:gap-4 text-white">
              {filterStatuses.map((status) => (
                <Tooltip content={statusTooltips[status]}>
                  <label
                    key={status}
                    tw="select-none cursor-pointer whitespace-nowrap"
                  >
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
                </Tooltip>
              ))}
            </div>
            {!inlineSort && sortDropdown}
          </div>
        </div>
      </div>
      <TopicList topics={visibleTopics} compact={!!filterText} />
    </>
  );
}
