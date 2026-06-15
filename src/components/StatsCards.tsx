import { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, GraduationCap, Calendar } from "lucide-react";
import { studentApi } from '@/lib/api';

export default function StatsCards() {
  const [term, setTerm] = useState("Loading...");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await studentApi.getDashboard();
        const data = response.data?.data;
        setTerm(data?.academic?.activeTerm || data?.academic?.termId || data?.termId || "2025/1");
      } catch (error) {
        setTerm("2025/1");
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "Cumulative GPA", value: "13.78", suffix: "/20", icon: TrendingUp, iconColor: "text-blue-600", iconBg: "bg-blue-100", borderColor: "border-l-blue-600" },
    { label: "Credits Earned", value: "116", subtext: "Information Technology", icon: BookOpen, iconColor: "text-blue-600", iconBg: "bg-blue-100", borderColor: "border-l-blue-600" },
    { label: "Program Progress", value: "86%", subtext: "36 of 42 courses", icon: GraduationCap, iconColor: "text-green-600", iconBg: "bg-green-100", borderColor: "border-l-green-600" },
    { label: "Current Term", value: term, subtext: "Active Registration", icon: Calendar, iconColor: "text-purple-600", iconBg: "bg-purple-100", borderColor: "border-l-purple-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, idx) => (
        <div key={idx} className={`bg-white rounded-lg border border-gray-200 p-4 border-l-4 ${stat.borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value} {stat.suffix && <span className="text-sm font-normal text-gray-400">{stat.suffix}</span>}
              </p>
              {stat.subtext && <p className="text-xs text-gray-500 mt-0.5">{stat.subtext}</p>}
            </div>
            <div className={`w-10 h-10 rounded-full ${stat.iconBg} flex items-center justify-center shrink-0`}>
              <stat.icon size={20} className={stat.iconColor} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}