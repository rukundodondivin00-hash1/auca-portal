import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BookOpen } from "lucide-react";

const data = [
  { term: "2021/2", earned: 16, cumulative: 16 },
  { term: "2022/1", earned: 18, cumulative: 34 },
  { term: "2022/2", earned: 18, cumulative: 52 },
  { term: "2023/1", earned: 14, cumulative: 66 },
  { term: "2023/2", earned: 18, cumulative: 84 },
  { term: "2023/3", earned: 6, cumulative: 90 },
  { term: "2024/1", earned: 18, cumulative: 108 },
  { term: "2024/2", earned: 6, cumulative: 114 },
  { term: "2024/3", earned: 2, cumulative: 116 },
];

export default function CreditsChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <BookOpen size={16} className="text-primary-600" />
        Credits Progress
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 16, bottom: 5, left: 0 }}
          >
            <defs>
              <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="term"
              tick={{ fontSize: 11, fill: "#334155" }}
              stroke="#666"
              height={30}
            />
            <YAxis
              yAxisId="left"
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
              tick={{ fontSize: 11, fill: "#334155" }}
              stroke="#666"
              width={40}
              orientation="left"
            />
            <YAxis
              yAxisId="right"
              domain={[0, 120]}
              ticks={[0, 30, 60, 90, 120]}
              tick={{ fontSize: 11, fill: "#334155" }}
              stroke="#666"
              width={40}
              orientation="right"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#0f172a",
              }}
              labelStyle={{ color: "#0f172a", fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", color: "#334155", paddingTop: "8px" }}
              iconType="plainline"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="earned"
              name="Credits Earned"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#creditGradient)"
              fillOpacity={0.6}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              name="Cumulative Credits"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#cumulativeGradient)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 mb-0.5 font-medium">Credits</p>
          <p className="text-sm font-bold text-green-700">116</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 mb-0.5 font-medium">Courses</p>
          <p className="text-sm font-bold text-gray-900">39</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 mb-0.5 font-medium">Semesters</p>
          <p className="text-sm font-bold text-blue-700">9</p>
        </div>
      </div>
    </div>
  );
}
