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
  return <div tw="p-2">{item.name}</div>;
}
