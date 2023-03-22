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
        <div tw="p-2">
          <div>
            {item.description || (
              <span tw="opacity-50">(No description provided)</span>
            )}
          </div>
          <div>
            {item.links.map((i, link) => (
              <div key={i}>
                <a href="link">{link}</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
