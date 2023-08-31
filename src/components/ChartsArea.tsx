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
  'Nov',
  'Dec',
];

export interface ChartsAreaProps {
  events: Event[];
}

export default function ChartsArea({ events }: ChartsAreaProps) {
  type Bin = { created: number; activity: number };
  const monthBins: Record<string, Bin> = {};
  const getBin = (year: number, month: number): Bin => {
    const key = `${year} ${month}`;
    return (
      monthBins[key] ||
      (monthBins[key] = {
        created: 0,
        activity: 0,
      })
    );
  };

  events.forEach((e) => {
    const createTime = (e as any)?.request?.createTopic?.time;
    if (createTime) {
      console.log(createTime);
      const date = new Date(createTime);
      getBin(date.getFullYear(), date.getMonth()).created++;
    }
  });

  const monthHistoryLength = 12;

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  const data = Array.from({ length: monthHistoryLength }).map(() => {
    const bin = getBin(year, month);
    month--;
    if (month < 0) {
      month += 12;
      year--;
    }
    return { ...bin, name: months[month] };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="created" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
