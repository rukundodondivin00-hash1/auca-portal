import React, { useState } from 'react';
import { 
  TrendingUp, Award, BookOpen, CircleCheck, 
  SlidersHorizontal, Calendar 
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Course {
  code: string;
  name: string;
  type: 'Major' | 'General';
  credit: number;
  score: number;
  status: 'pass' | 'fail';
  note: string;
}

interface Semester {
  id: number;
  title: string;
  dateRange: string;
  credits: number;
  courseCount: number;
  average: number;
  courses: Course[];
}

interface AcademicYear {
  title: string;
  genAvg: number;
  majAvg: number;
  totalCr: number;
  semesters: Semester[];
  yearTotal: { courses: number, passed: number, failed: number, credits: number };
}

// --- MOCK DATA ---
// You will replace this with an API call later
const transcriptData: AcademicYear[] = [
  {
    title: "Academic Year 2021 – 2022",
    genAvg: 13.83,
    majAvg: 13.83,
    totalCr: 16,
    yearTotal: { courses: 6, passed: 6, failed: 0, credits: 16 },
    semesters: [
      {
        id: 2,
        title: "Sem 2",
        dateRange: "Jan – May 2022",
        credits: 16,
        courseCount: 6,
        average: 13.83,
        courses: [
          { code: "ACCT 112", name: "Principles of Accounting I", type: "Major", credit: 3, score: 15.40, status: "pass", note: "√" },
          { code: "AMAT 111", name: "Applied Mathematics", type: "Major", credit: 3, score: 11.20, status: "pass", note: "√" },
          { code: "EDRM 113", name: "Study and Research Methods", type: "Major", credit: 2, score: 14.00, status: "pass", note: "√" },
          { code: "ENGL 115", name: "General English", type: "Major", credit: 3, score: 15.65, status: "pass", note: "√" },
          { code: "INSY 118", name: "Introduction to Computer Applications", type: "Major", credit: 3, score: 12.70, status: "pass", note: "√" },
          { code: "RELB 116", name: "Introduction to Bible Study", type: "Major", credit: 2, score: 14.20, status: "pass", note: "√" }
        ]
      }
    ]
  },
  {
    title: "Academic Year 2022 – 2023",
    genAvg: 12.17,
    majAvg: 12.17,
    totalCr: 33,
    yearTotal: { courses: 11, passed: 10, failed: 1, credits: 33 },
    semesters: [
      {
        id: 1,
        title: "Sem 1",
        dateRange: "Sep – Dec 2022",
        credits: 19,
        courseCount: 6,
        average: 12.12,
        courses: [
          { code: "ENGL 124", name: "Academic English Writing", type: "Major", credit: 3, score: 14.30, status: "pass", note: "√" },
          { code: "INSY 214", name: "Computer maintenance", type: "Major", credit: 3, score: 14.40, status: "pass", note: "√" },
          { code: "INSY 217", name: "Database Management System", type: "Major", credit: 3, score: 10.17, status: "pass", note: "√" },
          { code: "INSY 227", name: "Introduction to Computer Programming", type: "Major", credit: 4, score: 12.76, status: "pass", note: "√" },
          { code: "MATH 127", name: "Digital Computer Fundamentals", type: "Major", credit: 3, score: 10.50, status: "pass", note: "√" },
          { code: "STAT 122", name: "Descriptive Statistics", type: "Major", credit: 3, score: 10.40, status: "pass", note: "√" }
        ]
      },
      {
        id: 2,
        title: "Sem 2",
        dateRange: "Jan – May 2023",
        credits: 14,
        courseCount: 5,
        average: 11.54,
        courses: [
          { code: "ENGL 223", name: "English Proficiency Certificate I", type: "Major", credit: 3, score: 11.40, status: "pass", note: "√" },
          { code: "INSY 228", name: "Programming With C", type: "Major", credit: 4, score: 12.30, status: "pass", note: "√" },
          { code: "INSY 229", name: "Computer Networks", type: "Major", credit: 4, score: 12.42, status: "pass", note: "√" },
          { code: "RELT 123", name: "Bible Doctrines", type: "Major", credit: 3, score: 12.70, status: "pass", note: "√" },
          { code: "STAT 222", name: "Probability and Statistics & Reliability", type: "Major", credit: 3, score: 8.33, status: "fail", note: "FAIL" }
        ]
      }
    ]
  }
];

export default function MyTranscript() {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  
  const currentDate = new Date().toLocaleDateString('en-GB');

  return (
    <div className="space-y-6 animate-fade-in-slow">
      
      {/* 1. Header Information Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="h-[3px] bg-primary-600"></div>
        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Adventist_University_of_Central_Africa_logo.png/220px-Adventist_University_of_Central_Africa_logo.png" 
                alt="AUCA Logo" 
                className="object-contain w-full h-full"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight text-gray-900 dark:text-slate-50">Adventist University of Central Africa</p>
              <p className="mt-0.5 text-[11px] leading-tight text-gray-400 dark:text-slate-500">P.O. Box 2461 · Kigali, Rwanda · auca.ac.rw</p>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></span>Unofficial
          </span>
        </div>
        
        <div className="flex items-center justify-center bg-[#00447b] px-5 sm:px-6 py-2.5">
          <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.28em] text-white">UNDERGRADUATE — GRADE TRANSCRIPT</p>
        </div>
        
        <div className="grid divide-y divide-gray-100 dark:divide-slate-800/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <dl className="space-y-2 px-5 py-4 sm:px-6">
            <div className="flex items-baseline gap-2"><dt className="w-[90px] shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Reg. Number</dt><dd className="min-w-0 text-sm font-medium text-gray-800 dark:text-slate-100">25306</dd></div>
            <div className="flex items-baseline gap-2"><dt className="w-[90px] shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Full Name</dt><dd className="min-w-0 text-sm font-medium text-gray-800 dark:text-slate-100">Musengimana Fabrice</dd></div>
            <div className="flex items-baseline gap-2"><dt className="w-[90px] shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Programme</dt><dd className="min-w-0 text-sm font-medium text-gray-800 dark:text-slate-100">DAY</dd></div>
          </dl>
          <dl className="space-y-2 px-5 py-4 sm:px-6">
            <div className="flex items-baseline gap-2"><dt className="w-[90px] shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Department</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-100">Information Technology in Networks & Communication Systems</dd></div>
            <div className="flex items-baseline gap-2"><dt className="w-[90px] shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Minor</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-100">—</dd></div>
            <div className="flex items-baseline gap-2"><dt className="w-[90px] shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Generated</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-100">{currentDate}</dd></div>
          </dl>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Overall GPA" value="13.78" sub="Satisfaction" icon={TrendingUp} color="amber" />
        <StatCard title="Major Courses GPA" value="13.78" sub="Satisfaction" icon={Award} color="purple" />
        <StatCard title="Total Credits" value="127" sub="Gen: 2 · Maj: 125" icon={BookOpen} color="green" />
        <StatCard title="Courses Passed" value="36" sub="3 failed · 39 total" icon={CircleCheck} color="blue" isPrimary={true} />
      </div>

      {/* 3. Filter Bar */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:gap-3">
          <SlidersHorizontal size={14} className="shrink-0 text-gray-400 dark:text-slate-500" />
          <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Year</span>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 pl-3 pr-8 text-xs text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors">
                <option value="all">All years</option>
                <option value="2024">2024 – 2025</option>
                <option value="2023">2023 – 2024</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Term</span>
              <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 pl-3 pr-8 text-xs text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors">
                <option value="all">All terms</option>
                <option value="2024/3">2024/3</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-t border-gray-100 dark:border-slate-800/60 px-4 py-2.5">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Type</span>
          <button className="rounded-full px-3 py-1 text-[11px] font-bold bg-primary-600 text-white shadow-sm transition-colors">All Courses</button>
          <button className="rounded-full px-3 py-1 text-[11px] font-semibold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 transition-colors">General</button>
          <button className="rounded-full px-3 py-1 text-[11px] font-semibold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 transition-colors">Major</button>
        </div>
      </div>

      {/* 4. Transcript Tables */}
      <div className="space-y-5">
        {transcriptData.map((year, yearIndex) => (
          <div key={yearIndex} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
            
            {/* Year Header */}
            <div className="bg-primary-600 px-4 py-3 sm:px-5">
              <div className="flex items-start gap-2.5 sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-0.5 shrink-0 rounded-full bg-white/60"></span>
                  <h3 className="text-sm font-bold tracking-tight text-white">{year.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  <span className="flex items-center gap-1 text-[11px]"><span className="font-semibold text-sky-200">Gen</span><span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none bg-amber-100 text-amber-700">{year.genAvg}</span></span>
                  <span className="flex items-center gap-1 text-[11px]"><span className="font-semibold text-violet-200">Maj</span><span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none bg-amber-100 text-amber-700">{year.majAvg}</span></span>
                  <span className="text-[11px] text-white/70">{year.totalCr} cr</span>
                </div>
              </div>
            </div>

            {/* Semesters Loop */}
            {year.semesters.map((sem, semIndex) => (
              <div key={semIndex}>
                {semIndex > 0 && <div className="h-px bg-gray-100 dark:bg-slate-800/50"></div>}
                
                <div className="border-b border-blue-100/70 bg-blue-50/70 dark:border-slate-800/50 dark:bg-slate-900/20 px-4 py-2.5 sm:px-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-slate-200">{sem.title}</span>
                      <span className="text-[11px] text-gray-400 dark:text-slate-500">{sem.dateRange}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-slate-400">
                      <span>{sem.credits} cr</span><span>{sem.courseCount} courses</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b border-blue-100/70 bg-[#3b75b3] dark:border-slate-800 dark:bg-slate-900/60">
                        <th className="w-[13%] px-2 py-2 text-left text-[7px] font-bold uppercase tracking-wider text-white sm:w-28 sm:px-4 sm:py-2.5 sm:text-[10px] dark:text-slate-200">Sem</th>
                        <th className="w-[17%] px-2 py-2 text-left text-[7px] font-bold uppercase tracking-wider text-white sm:w-40 sm:px-4 sm:py-2.5 sm:text-[10px] dark:text-slate-200">Code</th>
                        <th className="w-[31%] px-2 py-2 text-left text-[7px] font-bold uppercase tracking-wider text-white sm:px-4 sm:py-2.5 sm:text-[10px] dark:text-slate-200">Name</th>
                        <th className="w-[13%] px-1 py-2 text-center text-[7px] font-bold uppercase tracking-wider text-white sm:w-28 sm:px-4 sm:py-2.5 sm:text-[10px] dark:text-slate-200">Type</th>
                        <th className="w-[9%] px-1 py-2 text-center text-[7px] font-bold uppercase tracking-wider text-white sm:w-24 sm:px-4 sm:py-2.5 sm:text-[10px] dark:text-slate-200">Credit</th>
                        <th className="w-[8%] px-1 py-2 text-right text-[7px] font-bold uppercase tracking-wider text-white sm:w-20 sm:px-4 sm:py-2.5 sm:text-[10px] dark:text-slate-200">Score</th>
                        <th className="w-[9%] px-1 py-2 text-center text-[7px] font-bold uppercase tracking-wider text-white sm:w-24 sm:px-4 sm:py-2.5 sm:text-[10px] dark:text-slate-200">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sem.courses.map((course, i) => (
                        <tr key={i} className={`border-b last:border-0 transition-colors ${course.status === 'fail' ? 'border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50' : 'border-gray-50 dark:border-slate-800/40 hover:bg-primary-50/40'}`}>
                          <td className="px-2 py-2 align-top sm:px-4 sm:py-2.5">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/40 sm:h-8 sm:w-8">
                                <Calendar size={12} className="text-primary-600 dark:text-primary-400" />
                              </div>
                              <span className="text-[10px] font-semibold leading-tight text-primary-700 dark:text-primary-300 sm:text-sm">{sem.id}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 align-top sm:px-4 sm:py-2.5">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/40 sm:h-8 sm:w-8">
                                <BookOpen size={12} className="text-primary-600 dark:text-primary-400" />
                              </div>
                              <span className="text-[10px] font-semibold leading-tight text-primary-900 dark:text-slate-100 sm:text-xs">{course.code}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 align-top text-[10px] font-medium leading-tight text-primary-900 dark:text-slate-200 sm:px-4 sm:py-2.5 sm:text-xs">
                            <span className="block whitespace-normal wrap-break-word sm:break-normal">{course.name}</span>
                          </td>
                          <td className="px-1 py-2 align-top text-center sm:px-4 sm:py-2.5">
                            <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none sm:px-2.5 sm:py-1 sm:text-xs ${course.type === 'Major' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'}`}>
                              {course.type}
                            </span>
                          </td>
                          <td className="px-1 py-2 align-top text-center text-[10px] font-medium text-gray-700 dark:text-slate-300 sm:px-4 sm:py-2.5 sm:text-xs">{course.credit}</td>
                          <td className="px-1 py-2 align-top text-right sm:px-4 sm:py-2.5">
                            <span className={`text-[10px] font-bold tabular-nums sm:text-sm font-semibold ${course.status === 'fail' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                              {course.score.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-1 py-2 align-top text-center sm:px-4 sm:py-2.5">
                            <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none sm:px-2.5 sm:py-1 sm:text-xs ${course.status === 'fail' ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'}`}>
                              {course.note}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Semester Footer Average */}
                <div className="flex items-center justify-end gap-2 border-t border-blue-100/70 bg-blue-50/60 dark:border-slate-800/50 dark:bg-slate-900/20 px-4 py-2 sm:px-5">
                  <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">Semester Average</span>
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none ${sem.average < 12 ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}>
                    {sem.average.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Year Total Footer */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60 px-4 py-2.5 sm:px-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Year Total</span>
              <span className="text-[11px] text-gray-600 dark:text-slate-300">{year.yearTotal.courses} courses</span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{year.yearTotal.passed} passed</span>
              {year.yearTotal.failed > 0 && <span className="text-[11px] font-medium text-red-600 dark:text-red-400">{year.yearTotal.failed} failed</span>}
              <span className="ml-auto text-[11px] font-semibold text-gray-700 dark:text-slate-300">{year.yearTotal.credits} credits earned</span>
            </div>
            
          </div>
        ))}
      </div>

      {/* 5. Legend & Grading Scale */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-900/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Transcript Legend & Grading Scale</p>
        </div>
        <div className="grid gap-6 p-5 sm:grid-cols-3">
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Note Codes</h4>
            <dl className="space-y-1.5">
              <LegendItem code="√" desc="Successful Completion" />
              <LegendItem code="FAIL" desc="Failure" />
              <LegendItem code="TF" desc="Transferred Credit" />
              <LegendItem code="*" desc="General Education Course" />
              <LegendItem code="+" desc="Complementary Course" />
              <LegendItem code="IN" desc="Incomplete Grade" />
              <LegendItem code="WV" desc="Waived Course" />
            </dl>
          </div>
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Semester Calendar</h4>
            <dl className="space-y-1.5">
              <LegendItem code="I" desc="September – December" />
              <LegendItem code="II" desc="January – May" />
              <LegendItem code="III" desc="June – July (Summer)" />
            </dl>
            <h4 className="mt-5 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Promotion Conditions</h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
              A cumulative mean of 12/20 is required to obtain a BA degree. Transferred courses and non-major courses do not affect mean calculations. Failed courses that are retaken and passed are excluded from the mean.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">AUCA Grading Scale</h4>
            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800">
              <table className="min-w-full text-[11px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900">
                    <th className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-slate-400">Score</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-slate-400">Classification</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-500 dark:text-slate-400">Gr.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-emerald-600 dark:text-emerald-400">16.00 – 20.00</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-slate-300">Grand Distinction</td>
                    <td className="px-3 py-2 text-center font-bold text-emerald-600 dark:text-emerald-400">A</td>
                  </tr>
                  <tr className="bg-gray-50/40 dark:bg-slate-900/30">
                    <td className="px-3 py-2 font-mono font-semibold text-blue-600 dark:text-blue-400">14.00 – 15.99</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-slate-300">Distinction</td>
                    <td className="px-3 py-2 text-center font-bold text-blue-600 dark:text-blue-400">B</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-amber-600 dark:text-amber-400">12.00 – 13.99</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-slate-300">Satisfaction</td>
                    <td className="px-3 py-2 text-center font-bold text-amber-600 dark:text-amber-400">C</td>
                  </tr>
                  <tr className="bg-gray-50/40 dark:bg-slate-900/30">
                    <td className="px-3 py-2 font-mono font-semibold text-red-600 dark:text-red-400">0.00 – 11.99</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-slate-300">Fail</td>
                    <td className="px-3 py-2 text-center font-bold text-red-600 dark:text-red-400">F</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatCard({ title, value, sub, icon: Icon, color, isPrimary = false }: any) {
  const colorStyles: any = {
    amber: "border-l-amber-500 dark:border-l-amber-400 text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950",
    purple: "border-l-purple-500 dark:border-l-purple-400 text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950",
    green: "border-l-green-500 dark:border-l-green-400 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950",
    blue: "border-l-blue-500 dark:border-l-blue-400 text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-950"
  };

  const style = colorStyles[color];

  return (
    <div className={`w-full bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 text-left transition-all duration-200 ${isPrimary ? '' : `border-l-4 ${style.split(' ')[0]}`}`}>
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-primary-600 dark:text-primary-300 mb-1">{title}</p>
            <p className={`text-xl md:text-2xl font-bold ${style.split(' ')[2]}`}>{value}</p>
            <p className="text-[11px] text-primary-500 dark:text-slate-400 mt-1">{sub}</p>
          </div>
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 ${style.split(' ')[4]}`}>
            <Icon size={18} className={style.split(' ')[2]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ code, desc }: { code: string, desc: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="w-8 shrink-0 font-mono text-[11px] font-bold text-gray-700 dark:text-slate-200">{code}</dt>
      <dd className="text-[11px] text-gray-500 dark:text-slate-400">{desc}</dd>
    </div>
  );
}