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
    // TODO: filter unsuccessful requests
    if ('request' in e) {
      const date = new Date(Number(e.request.time) / 1e6);
      const bin = getBin(date.getFullYear(), date.getMonth());
      bin.activity++;
      if ('createTopic' in e.request.request) {
        bin.created++;
      }
    }
  });

  const monthHistoryLength = 12;

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  const data = Array.from({ length: monthHistoryLength })
    .map(() => {
      const row = {
        name: months[month],
        ...getBin(year, month),
      };
      if (--month < 0) {
        month += 12;
        --year;
      }
      return row;
    })
    .reverse();

  return (
    <div tw="bg-[#FFFE] rounded-xl h-[300px] sm:h-[400px] p-10 pl-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={500} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="created" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
