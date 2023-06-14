import 'twin.macro';
import { TopicStatus } from '../stores/topicStore';
import Tag from './Tag';
import Tooltip from './Tooltip';

const statusColors: Record<TopicStatus, string> = {
  open: '#e8caf1',
  next: '#bcdbef',
  completed: '#c8ebd7',
  closed: '#e9ddd3',
};

const statusTooltips: Record<TopicStatus, string> = {
  open: 'Currently in discussion',
  next: 'Under development',
  completed: 'Already completed',
  closed: 'No longer under consideration',
};

export interface StatusTagProps {
  status: TopicStatus;
}

export default function StatusTag({ status }: StatusTagProps) {
  return (
    <Tooltip content={statusTooltips[status]}>
      <div tw="inline-block">
        <Tag tw="cursor-default" color={statusColors[status]}>
          {status}
        </Tag>
      </div>
    </Tooltip>
  );
}
