import { useState, useEffect } from 'react';
import { TrendingUp, Award, BookOpen, CircleCheck, SlidersHorizontal, Calendar } from 'lucide-react';
import { studentApi } from '@/lib/api';

// ... KEEP YOUR transcriptData ARRAY EXACTLY HERE ...

export default function MyTranscript() {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [studentInfo, setStudentInfo] = useState({ name: "Musengimana Fabrice", id: "25306" });
  const currentDate = new Date().toLocaleDateString('en-GB');

  useEffect(() => {
    studentApi.getDashboard().then(res => {
      if (res.data.data?.student) {
        setStudentInfo({
          name: res.data.data.student.studentName,
          id: res.data.data.student.studentId
        });
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-slow">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* ... Logo header remains identical ... */}
        
        <div className="grid divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <dl className="space-y-2 px-5 py-4 sm:px-6">
            <div className="flex items-baseline gap-2"><dt className="w-[90px] text-[10px] font-bold uppercase text-gray-400">Reg. Number</dt><dd className="text-sm font-medium">{studentInfo.id}</dd></div>
            <div className="flex items-baseline gap-2"><dt className="w-[90px] text-[10px] font-bold uppercase text-gray-400">Full Name</dt><dd className="text-sm font-medium">{studentInfo.name}</dd></div>
            <div className="flex items-baseline gap-2"><dt className="w-[90px] text-[10px] font-bold uppercase text-gray-400">Programme</dt><dd className="text-sm font-medium">DAY</dd></div>
          </dl>
          <dl className="space-y-2 px-5 py-4 sm:px-6">
            <div className="flex items-baseline gap-2"><dt className="w-[90px] text-[10px] font-bold uppercase text-gray-400">Department</dt><dd className="text-sm font-medium">Networks & Communication Systems</dd></div>
            <div className="flex items-baseline gap-2"><dt className="w-[90px] text-[10px] font-bold uppercase text-gray-400">Generated</dt><dd className="text-sm font-medium">{currentDate}</dd></div>
          </dl>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Overall GPA" value="13.78" sub="Satisfaction" icon={TrendingUp} color="amber" />
        <StatCard title="Major Courses GPA" value="13.78" sub="Satisfaction" icon={Award} color="purple" />
        <StatCard title="Total Credits" value="116" sub="Gen: 2 · Maj: 114" icon={BookOpen} color="green" />
        <StatCard title="Courses Passed" value="36" sub="3 failed · 39 total" icon={CircleCheck} color="blue" isPrimary={true} />
      </div>

      {/* ... Keep the rest of your UI rendering transcriptData exactly identical ... */}
    </div>
  );
}

// Keep your StatCard and LegendItem helpers here