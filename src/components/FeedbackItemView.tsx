import React from 'react';
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
  return <div>{item.name}</div>;
}
