import { useEffect, useState } from 'react';
import {
  FaCaretDown,
  FaCaretUp,
  FaCheck,
  FaClock,
  FaEdit,
  FaFlag,
  FaGithub,
  FaJira,
  FaRegCheckCircle,
  FaRegDotCircle,
  FaRegPlayCircle,
  FaRegTimesCircle,
  FaTimes,
} from 'react-icons/fa';
import tw from 'twin.macro';
import { useBreakpoint } from '../hooks/useBreakpoint';
import useIdentity from '../hooks/useIdentity';
import {
  Topic,
  TopicInfo,
  TopicStatus,
  VoteStatus,
  useTopicStore,
} from '../stores/topicStore';
import { handleInfo, handlePromise } from '../utils/handlers';
import Markdown from './Markdown';
import Tag from './Tag';
import Tooltip from './Tooltip';
import TopicForm from './TopicForm';
import { Join } from './utils/Join';

const ToolbarButton = tw.div`flex items-center gap-2 font-bold px-4 py-2 text-sm rounded-full cursor-pointer border-2 bg-[#fff8] border-gray-300 hover:bg-[rgba(0,0,0,.05)]`;

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
  hideModerationInfo?: boolean;
}

export default function TopicView({
  topic,
  expanded,
  onChangeExpanded,
  hideModerationInfo,
}: TopicViewProps) {
  const [editing, setEditing] = useState(false);
  const edit = useTopicStore((state) => state.edit);
  const setStatus = useTopicStore((state) => state.setStatus);
  const setModStatus = useTopicStore((state) => state.setModStatus);
  const breakpoint = useBreakpoint();

  const user = useIdentity();
  const vote = useTopicStore((state) => state.vote);

  const maxPreviewTags = breakpoint === 'xs' || expanded ? 0 : 2;

  useEffect(() => {
    if (!expanded) {
      setEditing(false);
    }
  }, [expanded]);

  const onVote = (voteStatus: VoteStatus) => {
    if (!user) {
      return handleInfo('Please sign in to vote.');
    }
    handlePromise(
      vote(topic, voteStatus),
      // voteStatus === 1
      //   ? 'Upvoting...'
      //   : voteStatus === -1
      //   ? 'Downvoting...'
      //   : 'Removing vote...',
      undefined,
      'Error occurred while voting!',
    );
  };

  const onChangeStatus = (topic: Topic, status: TopicStatus) => {
    handlePromise(
      setStatus(topic.id, status),
      // 'Changing status...',
      undefined,
      'Error while changing status!',
    );
  };

  const onSubmitEdit = (info: TopicInfo) => {
    /* await */ handlePromise(
      edit(topic.id, info),
      'Saving changes...',
      'Error while saving topic!',
    );
    setEditing(false);
  };

  return (
    <div
      tw="bg-gray-100 rounded-2xl [box-shadow: 0 4px .5rem #0005]"
      css={
        topic.modStatus === 'pending'
          ? tw`border-[4px] border-teal-500`
          : topic.modStatus === 'rejected'
          ? tw`border-[4px] border-orange-500`
          : null
      }
    >
      <div
        tw="p-3 text-lg flex items-center gap-4 rounded-2xl"
        css={[
          onChangeExpanded && tw`cursor-pointer hover:bg-[rgba(0,0,0,.05)]`,
        ]}
        onClick={() => onChangeExpanded?.(!expanded)}
      >
        <>
          <div
            tw="flex items-center gap-2"
            css={[onChangeExpanded && tw`cursor-default select-none`]}
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
            tw="flex-1 flex gap-2 items-center overflow-hidden"
            css={[
              !expanded && tw`text-ellipsis whitespace-nowrap`,
              onChangeExpanded && tw`select-none`,
            ]}
          >
            {topic.importId?.type === 'jira' && (
              <div>
                <Tooltip content={topic.importId.id}>
                  <div>
                    <FaJira tw="text-blue-500" />
                  </div>
                </Tooltip>
              </div>
            )}
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
        <div tw="px-5 pt-3 pb-4 ">
          {editing ? (
            <TopicForm initial={topic} onSubmit={onSubmitEdit} />
          ) : (
            <Join separator={() => <hr tw="my-3" />}>
              {!!topic.description && (
                <div>
                  <Markdown>{topic.description}</Markdown>
                </div>
              )}
              {topic.links.length > 0 && (
                <div>
                  {topic.links.map((link, i) => (
                    <div key={i} tw="flex gap-2 items-center">
                      {!!link.startsWith('https://dfinity.atlassian.net/') && (
                        <FaJira tw="text-blue-500" />
                      )}
                      {!!link.startsWith('https://github.com/') && (
                        <FaGithub tw="text-black" />
                      )}
                      <a
                        tw="text-blue-500 text-ellipsis overflow-hidden whitespace-nowrap"
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              {topic.tags.length > 0 && (
                <div tw="flex flex-wrap gap-2 items-center">
                  <span tw="font-bold opacity-70">Tags:</span>
                  {topic.tags.map((tag, i) => (
                    <Tag key={i}>{tag}</Tag>
                  ))}
                  {user?.detail.isModerator && (
                    <Tag color="#9195e621">{`#${topic.id}`}</Tag>
                  )}
                </div>
              )}
              {!hideModerationInfo &&
                !user?.detail.isModerator &&
                topic.modStatus !== 'approved' && (
                  <div tw="flex gap-2 items-center font-bold text-[#000a]">
                    {topic.modStatus === 'pending' ? (
                      <>
                        <FaClock tw="text-teal-500" />
                        <div>Under review</div>
                      </>
                    ) : topic.modStatus === 'rejected' ? (
                      <>
                        <FaTimes tw="text-orange-500" />
                        <div>Changes requested</div>
                      </>
                    ) : (
                      false
                    )}
                  </div>
                )}
              {(!!topic.isEditable || !!user?.detail.isModerator) &&
                !hideModerationInfo && (
                  <div tw="flex gap-2 mt-4">
                    <div tw="flex flex-1">
                      <ToolbarButton onClick={() => setEditing(true)}>
                        <FaEdit />
                        Edit
                      </ToolbarButton>
                    </div>
                    {!!user?.detail.isModerator && (
                      <div tw="hidden sm:flex gap-2">
                        {topic.modStatus !== 'approved' && (
                          <Tooltip content="Approve">
                            <ToolbarButton
                              // css={{ background: statusColors.next }}
                              onClick={() => setModStatus(topic, 'approved')}
                            >
                              <FaCheck tw="text-green-500" />
                            </ToolbarButton>
                          </Tooltip>
                        )}
                        {topic.modStatus !== 'rejected' && (
                          <Tooltip content="Hide">
                            <ToolbarButton
                              // css={{ background: statusColors.next }}
                              onClick={() => setModStatus(topic, 'rejected')}
                            >
                              {' '}
                              <FaFlag tw="text-red-600" />
                            </ToolbarButton>
                          </Tooltip>
                        )}
                      </div>
                    )}
                    <div tw="flex gap-2">
                      {topic.status === 'open' && (
                        <ToolbarButton
                          // css={{ background: statusColors.next }}
                          onClick={() => onChangeStatus(topic, 'next')}
                        >
                          <FaRegPlayCircle />
                          Start
                        </ToolbarButton>
                      )}
                      {topic.status === 'next' && (
                        <ToolbarButton
                          // css={{ background: statusColors.completed }}
                          onClick={() => onChangeStatus(topic, 'completed')}
                        >
                          <FaRegCheckCircle />
                          Complete
                        </ToolbarButton>
                      )}
                      {(topic.status === 'open' || topic.status === 'next') && (
                        <ToolbarButton
                          // css={{ background: statusColors.closed }}
                          onClick={() => onChangeStatus(topic, 'closed')}
                        >
                          <FaRegTimesCircle />
                          Close
                        </ToolbarButton>
                      )}
                      {(topic.status === 'completed' ||
                        topic.status === 'closed') && (
                        <ToolbarButton
                          // css={{ background: statusColors.open }}
                          onClick={() => onChangeStatus(topic, 'open')}
                        >
                          <FaRegDotCircle />
                          Reopen
                        </ToolbarButton>
                      )}
                    </div>
                  </div>
                )}
            </Join>
          )}
        </div>
      )}
    </div>
  );
}
