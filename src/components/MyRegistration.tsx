import { useState, useEffect } from 'react';
import { Info, BookOpen, Search, Clock, CircleAlert } from 'lucide-react';
import { studentApi } from '@/lib/api';

export default function MyRegistration() {
  const [activeTab, setActiveTab] = useState<'my-courses' | 'browse' | 'timetable'>('my-courses');
  const [activeTerm, setActiveTerm] = useState("Loading...");

  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const response = await studentApi.getDashboard();
        if (response.data?.data?.academic?.activeTerm) {
          setActiveTerm(response.data.data.academic.activeTerm);
        }
      } catch (error) {
        setActiveTerm("2025/1");
      }
    };
    fetchTerm();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-slow">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#00447b] dark:bg-slate-900 rounded-lg shadow-sm p-4 md:p-5 text-white dark:text-slate-100 border border-transparent dark:border-slate-800">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-gray-100 dark:text-slate-50 tracking-tight">
            My Registration
          </h1>
          <p className="text-gray-300 dark:text-slate-300 font-light mt-0.5 text-sm">
            Active term: {activeTerm}
          </p>
        </div>
      </div>

      {/* Main Alert */}
      <div className="flex items-start gap-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 shadow-sm">
        <Info className="text-[#d97706] mt-0.5 shrink-0" size={18} />
        <p className="text-sm text-[#92400e]">
          Registration and pre-registration are currently closed.
        </p>
      </div>

      {/* Tabs & Content Box */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('my-courses')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-[120px] ${
              activeTab === 'my-courses' 
                ? 'text-[#00447b] border-b-2 border-[#00447b] bg-blue-50/50 dark:bg-blue-900/20' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <BookOpen size={16} /> My Courses
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('browse')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-[120px] ${
              activeTab === 'browse' 
                ? 'text-[#00447b] border-b-2 border-[#00447b] bg-blue-50/50 dark:bg-blue-900/20' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Search size={16} /> Browse Courses
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('timetable')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-[120px] ${
              activeTab === 'timetable' 
                ? 'text-[#00447b] border-b-2 border-[#00447b] bg-blue-50/50 dark:bg-blue-900/20' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Clock size={16} /> Timetable
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'my-courses' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 bg-[#fffbeb] border border-[#fde68a] rounded-md px-3 py-2">
                <Info className="text-[#d97706] mt-0.5 shrink-0" size={14} />
                <p className="text-xs text-[#92400e]">
                  Direct add/remove is only available while the registration window is open.
                </p>
              </div>
              <div className="py-12">
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-slate-500 gap-2">
                  <CircleAlert size={24} />
                  <p className="text-sm">No registration found for the active term.</p>
                </div>
                <p className="mt-4 text-center text-xs text-gray-500 dark:text-slate-400">
                  Registration window is closed. You cannot add courses at this time.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'browse' && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-2">
              <Search size={24} />
              <p className="text-sm">Browse Courses is currently unavailable.</p>
            </div>
          )}

          {activeTab === 'timetable' && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-2">
              <Clock size={24} />
              <p className="text-sm">No timetable generated for this term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}