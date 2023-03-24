import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { Topic, VoteStatus } from '../stores/topicStore';
import tw from 'twin.macro';
import Tag from './Tag';
import { isMobile } from 'react-device-detect';

const maxPreviewTags = isMobile ? 1 : 2;

export interface TopicViewProps {
  topic: Topic;
  expanded?: boolean;
  onChangeExpanded?(expanded: boolean): void;
  onVote?(voteStatus: VoteStatus): void;
}

export default function TopicView({
  topic,
  expanded,
  onChangeExpanded,
  onVote,
}: TopicViewProps) {
  return (
    <div tw="bg-gray-100 rounded-2xl">
      <div
        tw="p-3 text-xl flex items-center gap-4 rounded-2xl cursor-pointer hover:bg-[rgba(0,0,0,.05)]"
        onClick={() => onChangeExpanded?.(!expanded)}
      >
        <>
          {!!onVote && (
            <div
              tw="flex items-center gap-2 cursor-default select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <FaCaretUp
                  tw="cursor-pointer hover:opacity-75"
                  css={[topic.yourVote === 1 && tw`text-orange-500`]}
                  onClick={() => onVote?.(topic.yourVote === 1 ? 0 : 1)}
                />
                <FaCaretDown
                  tw="cursor-pointer -translate-y-1 hover:opacity-75"
                  css={[topic.yourVote === -1 && tw`text-red-500`]}
                  onClick={() => onVote?.(topic.yourVote === -1 ? 0 : -1)}
                />
              </div>
              <span tw="opacity-60 text-lg font-bold">{topic.votes}</span>
            </div>
          )}
          <div tw="flex-1 text-ellipsis whitespace-nowrap overflow-hidden">
            {topic.title}
          </div>
          {topic.tags.length > 0 && (
            <div tw="flex gap-1 items-center">
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
          )}
        </>
      </div>
      {!!expanded && (
        <div tw="px-5 py-3">
          <div>
            {topic.description || (
              <span tw="opacity-50">(No description provided)</span>
            )}
          </div>
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
          {topic.links.length > 0 && (
            <>
              <hr tw="my-3" />
              <div>
                {topic.links.map((link, i) => (
                  <div key={i}>
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
        </div>
      )}
    </div>
  );
}
