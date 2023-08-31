import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  Bar,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Event } from '../declarations/backend/backend.did';

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

export interface ChartsAreaProps {
  events: Event[];
}

export default function ChartArea({ events }: ChartsAreaProps) {
  type Bin = {
    activity: number;
    created: Set<string>;
    started: Set<string>;
    completed: Set<string>;
    closed: Set<string>;
  };
  const monthBins: Record<string, Bin> = {};
  const getBin = (year: number, month: number): Bin => {
    const key = `${year} ${month}`;
    return (
      monthBins[key] ||
      (monthBins[key] = {
        activity: 0,
        created: new Set(),
        started: new Set(),
        completed: new Set(),
        closed: new Set(),
      })
    );
  };

  events.forEach((e) => {
    // TODO: filter unsuccessful requests
    if ('request' in e) {
      const date = new Date(Number(e.request.time) / 1e6);
      const bin = getBin(date.getFullYear(), date.getMonth());
      bin.activity++;
      if ('setTopicModStatus' in e.request.request) {
        const request = e.request.request.setTopicModStatus;
        if ('approved' in request.modStatus) {
          bin.created.add(String(request.topic.topic));
        }
      }
      if ('setTopicStatus' in e.request.request) {
        const request = e.request.request.setTopicStatus;
        const topicId = String(request.topic.topic);
        if ('next' in request.status) {
          bin.started.add(topicId);
        }
        if ('completed' in request.status) {
          bin.completed.add(topicId);
        }
        if ('closed' in request.status) {
          bin.closed.add(topicId);
        }
      }
    }
  });

  const monthHistoryLength = 6;

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  const data = Array.from({ length: monthHistoryLength })
    .map(() => {
      const bins = getBin(year, month);
      const row = {
        Name: months[month],
        Activity: bins.activity,
        Created: bins.created.size,
        Started: bins.started.size,
        Completed: bins.completed.size,
        Closed: bins.closed.size,
      };
      if (--month < 0) {
        month += 12;
        --year;
      }
      return row;
    })
    .reverse();

  return (
    <div tw="bg-[#FFFE] rounded-xl p-10 pl-0">
      <div tw="h-[200px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Activity" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div tw="h-[200px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Created" stackId="a" fill="#8884d8" />
            <Bar dataKey="Started" stackId="a" fill="#82ca9d" />
            <Bar dataKey="Completed" stackId="a" fill="#02ca9d" />
            <Bar dataKey="Closed" stackId="a" fill="#825a9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
