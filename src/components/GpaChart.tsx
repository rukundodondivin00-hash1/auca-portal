import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { term: "2021/2", gpa: 14 },
  { term: "2022/1", gpa: 12.5 },
  { term: "2022/2", gpa: 12 },
  { term: "2023/1", gpa: 14.5 },
  { term: "2023/2", gpa: 9.5 },
  { term: "2023/3", gpa: 14 },
  { term: "2024/1", gpa: 13 },
  { term: "2024/2", gpa: 14 },
  { term: "2024/3", gpa: 8.5 },
];

export default function GpaChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <TrendingUp size={16} className="text-primary-600" />
        GPA Trend
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 16, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="term"
              tick={{ fontSize: 11, fill: "#334155" }}
              stroke="#666"
              height={30}
            />
            <YAxis
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
              tick={{ fontSize: 11, fill: "#334155" }}
              stroke="#666"
              width={40}
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
              formatter={(value: number) => [`${value}`, "GPA (out of 20)"]}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", color: "#334155" }}
              iconType="plainline"
            />
            <Line
              type="monotone"
              dataKey="gpa"
              name="GPA (out of 20)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ fill: "#3b82f6", stroke: "#3b82f6", r: 3, strokeWidth: 2.5 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
