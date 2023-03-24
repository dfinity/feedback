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
  topic: item,
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
                  css={[item.yourVote === 1 && tw`text-orange-500`]}
                  onClick={() => onVote?.(item.yourVote === 1 ? 0 : 1)}
                />
                <FaCaretDown
                  tw="cursor-pointer -translate-y-1 hover:opacity-75"
                  css={[item.yourVote === -1 && tw`text-red-500`]}
                  onClick={() => onVote?.(item.yourVote === -1 ? 0 : -1)}
                />
              </div>
              <span tw="opacity-60 text-lg font-bold">{item.votes}</span>
            </div>
          )}
          <div tw="flex-1 text-ellipsis whitespace-nowrap overflow-hidden">
            {item.title}
          </div>
          {item.tags.length > 0 && (
            <div tw="flex gap-1 items-center">
              {item.tags.slice(0, maxPreviewTags).map((tag, i) => (
                <Tag key={i}>{tag}</Tag>
              ))}
              {item.tags.length > maxPreviewTags && (
                <Tag>
                  <span tw="opacity-50">
                    +{item.tags.length - maxPreviewTags}
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
            {item.description || (
              <span tw="opacity-50">(No description provided)</span>
            )}
          </div>
          {item.tags.length > 0 && (
            <>
              <hr tw="my-3" />
              <div tw="flex flex-wrap gap-2 items-center">
                <span tw="font-bold opacity-70">Tags:</span>
                {item.tags.map((tag, i) => (
                  <Tag key={i}>{tag}</Tag>
                ))}
              </div>
            </>
          )}
          {item.links.length > 0 && (
            <>
              <hr tw="my-3" />
              <div>
                {item.links.map((link, i) => (
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
