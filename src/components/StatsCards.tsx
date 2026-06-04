import { TrendingUp, BookOpen, GraduationCap, Calendar } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  subtext?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  borderColor: string;
}

function StatCard({
  label,
  value,
  suffix,
  subtext,
  icon: Icon,
  iconColor,
  iconBg,
  borderColor,
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 border-l-4 ${borderColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {suffix && (
              <span className="text-sm font-normal text-gray-400">{suffix}</span>
            )}
          </p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

const stats: StatCardProps[] = [
  {
    label: "Cumulative GPA",
    value: "12.04",
    suffix: "/20",
    icon: TrendingUp,
    iconColor: "text-primary-600",
    iconBg: "bg-primary-100",
    borderColor: "border-l-primary-600",
  },
  {
    label: "Credits Earned",
    value: "116",
    subtext: "of 137 total",
    icon: BookOpen,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    borderColor: "border-l-blue-600",
  },
  {
    label: "Program Progress",
    value: "86%",
    subtext: "36 of 42 courses",
    icon: GraduationCap,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    borderColor: "border-l-green-600",
  },
  {
    label: "Current Term",
    value: "2025/1",
    subtext: "0 credits",
    icon: Calendar,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    borderColor: "border-l-purple-600",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
