import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import {
  FaCaretDown,
  FaCaretUp,
  FaEdit,
  FaGithub,
  FaJira,
  FaRegCheckCircle,
  FaRegDotCircle,
  FaRegPlayCircle,
  FaRegTimesCircle,
} from 'react-icons/fa';
import tw from 'twin.macro';
import {
  Topic,
  TopicInfo,
  TopicStatus,
  VoteStatus,
  useTopicStore,
} from '../stores/topicStore';
import Markdown from './Markdown';
import Tag from './Tag';
import TopicForm from './TopicForm';
import { handlePromise } from '../utils/handlers';

const OwnerButton = tw.div`flex items-center gap-2 font-bold px-4 py-2 text-sm rounded-full cursor-pointer border-2 bg-[#fff8] border-gray-300 hover:bg-[rgba(0,0,0,.05)]`;

const statusColors: Record<TopicStatus, string> = {
  open: '#e8caf1',
  next: '#bcdbef',
  completed: '#c8ebd7',
  closed: '#e9ddd3',
};

export interface TopicViewProps {
  topic: Topic;
  expanded?: boolean;
  onChangeExpanded?(expanded: boolean): void;
}

export default function TopicView({
  topic,
  expanded,
  onChangeExpanded,
}: TopicViewProps) {
  const [editing, setEditing] = useState(false);
  const edit = useTopicStore((state) => state.edit);
  const changeStatus = useTopicStore((state) => state.changeStatus);

  const vote = useTopicStore((state) => state.vote);

  const maxPreviewTags = isMobile || expanded ? 0 : 2;

  useEffect(() => {
    if (!expanded) {
      setEditing(false);
    }
  }, [expanded]);

  const onVote = (voteStatus: VoteStatus) => {
    handlePromise(
      vote(topic, voteStatus),
      voteStatus === 1
        ? 'Upvoting...'
        : voteStatus === -1
        ? 'Downvoting...'
        : 'Removing vote...',
      'Error occurred while voting!',
    );
  };

  const onChangeStatus = (topic: Topic, status: TopicStatus) => {
    handlePromise(
      changeStatus(topic.id, status),
      // 'Changing status...',
      undefined,
      'Error while changing status!',
    );
  };

  const onSubmitEdit = async (info: TopicInfo) => {
    /* await */ handlePromise(
      edit(topic.id, info),
      'Saving changes...',
      'Error while saving topic!',
    );
    setEditing(false);
  };

  return (
    <div tw="bg-gray-100 rounded-2xl [box-shadow: 0 4px .5rem #0005]">
      <div
        tw="p-3 text-lg flex items-center gap-4 rounded-2xl cursor-pointer hover:bg-[rgba(0,0,0,.05)]"
        onClick={() => onChangeExpanded?.(!expanded)}
      >
        <>
          <div
            tw="flex items-center gap-2 cursor-default select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <FaCaretUp
                tw="cursor-pointer hover:opacity-75"
                css={[topic.yourVote === 1 && tw`text-orange-500`]}
                onClick={() => onVote(topic.yourVote === 1 ? 0 : 1)}
              />
              <FaCaretDown
                tw="cursor-pointer -translate-y-1 hover:opacity-75"
                css={[topic.yourVote === -1 && tw`text-red-500`]}
                onClick={() => onVote(topic.yourVote === -1 ? 0 : -1)}
              />
            </div>
            <span tw="opacity-60 text-lg font-bold">{topic.votes}</span>
          </div>
          <div
            tw="flex-1 overflow-hidden select-none"
            css={[!expanded && tw`text-ellipsis whitespace-nowrap`]}
          >
            {topic.title}
          </div>
          <div tw="flex gap-1 items-center">
            <Tag color={statusColors[topic.status]}>{topic.status}</Tag>
            {topic.tags.slice(0, maxPreviewTags).map((tag, i) => (
              <Tag key={i}>{tag}</Tag>
            ))}
            {topic.tags.length > maxPreviewTags && (
              <Tag>
                <span tw="opacity-50">
                  +{topic.tags.length - maxPreviewTags}
                </span>
              </Tag>
            )}
          </div>
        </>
      </div>
      {!!expanded && (
        <div tw="px-5 pt-3 pb-4">
          {editing ? (
            <TopicForm initial={topic} onSubmit={onSubmitEdit} />
          ) : (
            <>
              {!!topic.description && (
                <>
                  <div>
                    <Markdown>{topic.description}</Markdown>
                  </div>
                  <hr tw="my-3" />
                </>
              )}
              {topic.links.length > 0 && (
                <>
                  <div>
                    {topic.links.map((link, i) => (
                      <div key={i} tw="flex gap-2 items-center">
                        {!!link.startsWith(
                          'https://dfinity.atlassian.net/',
                        ) && <FaJira tw="text-blue-500" />}
                        {!!link.startsWith('https://github.com/') && (
                          <FaGithub tw="text-black" />
                        )}
                        <a
                          tw="text-blue-500"
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link}
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {topic.tags.length > 0 && (
                <>
                  <hr tw="my-3" />
                  <div tw="flex flex-wrap gap-2 items-center">
                    <span tw="font-bold opacity-70">Tags:</span>
                    {topic.tags.map((tag, i) => (
                      <Tag key={i}>{tag}</Tag>
                    ))}
                  </div>
                </>
              )}
              {!!topic.isOwner && (
                <>
                  <hr tw="my-3" />
                  <div tw="flex mt-4">
                    <div tw="flex flex-1">
                      <OwnerButton onClick={() => setEditing(true)}>
                        <FaEdit />
                        Edit
                      </OwnerButton>
                    </div>
                    <div tw="flex gap-2">
                      {topic.status === 'open' && (
                        <OwnerButton
                          // css={{ background: statusColors.next }}
                          onClick={() => onChangeStatus(topic, 'next')}
                        >
                          <FaRegPlayCircle />
                          Start
                        </OwnerButton>
                      )}
                      {topic.status === 'next' && (
                        <OwnerButton
                          // css={{ background: statusColors.completed }}
                          onClick={() => onChangeStatus(topic, 'completed')}
                        >
                          <FaRegCheckCircle />
                          Complete
                        </OwnerButton>
                      )}
                      {(topic.status === 'open' || topic.status === 'next') && (
                        <OwnerButton
                          // css={{ background: statusColors.closed }}
                          onClick={() => onChangeStatus(topic, 'closed')}
                        >
                          <FaRegTimesCircle />
                          Close
                        </OwnerButton>
                      )}
                      {(topic.status === 'completed' ||
                        topic.status === 'closed') && (
                        <OwnerButton
                          // css={{ background: statusColors.open }}
                          onClick={() => onChangeStatus(topic, 'open')}
                        >
                          <FaRegDotCircle />
                          Reopen
                        </OwnerButton>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
