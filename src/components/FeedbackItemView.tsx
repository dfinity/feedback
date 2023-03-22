import React from 'react';
import 'twin.macro';
import { FeedbackItem } from '../stores/feedbackStore';

export interface FeedbackItemProps {
  item: FeedbackItem;
  expanded?: boolean;
  onChangeExpanded?(expanded: boolean): void;
}

export default function FeedbackItemView({
  item,
  expanded,
  onChangeExpanded,
}: FeedbackItemProps) {
  return (
    <div tw="bg-gray-100 rounded-2xl">
      <div
        tw="p-3 text-xl flex rounded-2xl cursor-pointer hover:bg-[rgba(0,0,0,.05)]"
        onClick={() => onChangeExpanded?.(!expanded)}
      >
        <div tw="w-full">{item.name}</div>
      </div>
      {!!expanded && (
        <div tw="pt-3 p-5">
          <div>
            {item.description || (
              <span tw="opacity-50">(No description provided)</span>
            )}
          </div>
          {!!item.links.length && <hr tw="my-3" />}
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
        </div>
      )}
    </div>
  );
}
