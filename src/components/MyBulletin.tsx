import { useState, useEffect } from 'react';
import { FileText, Download, Printer, Filter } from 'lucide-react';
import aucaLogo from '@/images/AUCA-logo.png';

// --- MOCK DATA ---
const mockTerms = ['2024/2', '2024/1', '2023/2', '2023/1'];

const mockBulletinData: Record<string, any> = {
  '2024/2': {
    term: '2024/2',
    academicYear: '2024 - 2025',
    semester: 'Semester 2',
    courses: [
      { code: 'INSY 311', title: 'Advanced Web Development', credits: 4, cat: 35.5, exam: 48.0, total: 83.5, grade: 'A' },
      { code: 'INSY 312', title: 'Network Security', credits: 3, cat: 28.0, exam: 42.5, total: 70.5, grade: 'B' },
      { code: 'INSY 313', title: 'Database Staffistration', credits: 3, cat: 32.0, exam: 40.0, total: 72.0, grade: 'B' },
      { code: 'MATH 221', title: 'Discrete Mathematics', credits: 3, cat: 36.0, exam: 55.0, total: 91.0, grade: 'A' },
      { code: 'ENGL 211', title: 'Business Communication', credits: 2, cat: 25.0, exam: 30.0, total: 55.0, grade: 'C' }
    ],
    creditsAttempted: 15,
    creditsEarned: 15,
    semesterGpa: 16.2,
    decision: 'PROMOTED'
  },
  '2024/1': {
    term: '2024/1',
    academicYear: '2024 - 2025',
    semester: 'Semester 1',
    courses: [
      { code: 'INSY 221', title: 'Object Oriented Programming', credits: 4, cat: 30.0, exam: 45.0, total: 75.0, grade: 'B' },
      { code: 'INSY 222', title: 'Data Structures', credits: 4, cat: 34.0, exam: 50.0, total: 84.0, grade: 'A' },
      { code: 'INSY 223', title: 'Computer Architecture', credits: 3, cat: 20.0, exam: 35.0, total: 55.0, grade: 'C' },
      { code: 'MATH 211', title: 'Linear Algebra', credits: 3, cat: 25.0, exam: 40.0, total: 65.0, grade: 'C' }
    ],
    creditsAttempted: 14,
    creditsEarned: 14,
    semesterGpa: 14.8,
    decision: 'PROMOTED'
  }
};

export default function MyBulletin() {
  const [selectedTerm, setSelectedTerm] = useState(mockTerms[0]);
  const [bulletinData, setBulletinData] = useState<Record<string, any>>(mockBulletinData);
  const [loading, setLoading] = useState(true);
  
  const studentName = localStorage.getItem('student_name') || 'Student Name';
  const studentId = localStorage.getItem('student_id') || '25306';
  const currentDate = new Date().toLocaleDateString('en-GB');

  useEffect(() => {
    import('@/lib/api').then(({ studentApi }) => {
      studentApi.getStudentBulletin()
        .then(res => {
          const data = res.data?.data || res.data;
          if (data && typeof data === 'object') {
            // Assuming the API returns a structured object matching or similar to our schema
            // We'll wrap it or use it. If it's an array of bulletins:
            if (Array.isArray(data)) {
              const mapped: Record<string, any> = {};
              data.forEach((b: any) => {
                if (b.term) mapped[b.term] = b;
              });
              if (Object.keys(mapped).length > 0) setBulletinData(mapped);
            } else if (data.term) {
              setBulletinData({ [data.term]: data });
            }
          } else {
            console.warn("Bulletin data schema mismatch");
          }
        })
        .catch(err => {
          console.error("Failed to fetch bulletin", err);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  const availableTerms = Object.keys(bulletinData);
  const currentTerm = availableTerms.includes(selectedTerm) ? selectedTerm : availableTerms[0];
  const data = bulletinData[currentTerm];

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading academic bulletin...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-500">No bulletin data available.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-slow pb-12">
      <div className="bg-[#00447b] text-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText /> Academic Bulletin</h1>
          <p className="text-blue-100 text-sm mt-1">View and download your official semester grade reports</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-200">
              <Filter size={16} />
            </div>
            <select 
              value={currentTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-white/10 border border-blue-400/30 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 p-2.5 appearance-none [&>option]:text-gray-900"
            >
              {availableTerms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
          <button className="bg-white text-[#00447b] p-2.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm hidden sm:block">
            <Printer size={18} />
          </button>
          <button className="bg-white text-[#00447b] p-2.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm hidden sm:block">
            <Download size={18} />
          </button>
        </div>
      </div>

      {!data ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-700">No Bulletin Found</h2>
          <p className="text-gray-500 mt-2">There is no academic bulletin available for the selected term ({selectedTerm}).</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Bulletin Header (Printable Area Start) */}
          <div className="p-8 pb-4">
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <img 
                  src={aucaLogo} 
                  alt="AUCA Logo" 
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h2 className="font-bold text-xl text-gray-900 uppercase tracking-wide">Adventist University of Central Africa</h2>
                  <p className="text-sm text-gray-600">Office of the Registrar</p>
                  <p className="text-sm font-bold text-gray-800 mt-1 uppercase">Academic Bulletin / Bulletin de Notes</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p><span className="text-gray-500">Date:</span> <span className="font-semibold">{currentDate}</span></p>
                <p><span className="text-gray-500">Term:</span> <span className="font-semibold">{data.term}</span></p>
                <div className="mt-2 inline-block border border-gray-300 px-3 py-1 rounded text-xs text-gray-500 bg-gray-50 font-medium">
                  Student Copy
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Student Name</p>
                <p className="font-semibold text-gray-900">{studentName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Reg Number</p>
                <p className="font-semibold text-gray-900">{studentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Academic Year</p>
                <p className="font-semibold text-gray-900">{data.academicYear}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Semester</p>
                <p className="font-semibold text-gray-900">{data.semester}</p>
              </div>
            </div>

            {/* Courses Table */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold border-r">Course Code</th>
                    <th className="px-4 py-3 font-bold border-r">Course Title</th>
                    <th className="px-4 py-3 font-bold border-r text-center">Credits</th>
                    <th className="px-4 py-3 font-bold border-r text-center">CAT (50%)</th>
                    <th className="px-4 py-3 font-bold border-r text-center">Exam (50%)</th>
                    <th className="px-4 py-3 font-bold border-r text-center bg-blue-50">Total (%)</th>
                    <th className="px-4 py-3 font-bold text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.courses.map((course: any) => (
                    <tr key={course.code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium border-r">{course.code}</td>
                      <td className="px-4 py-3 border-r">{course.title}</td>
                      <td className="px-4 py-3 text-center border-r">{course.credits}</td>
                      <td className="px-4 py-3 text-center border-r">{course.cat.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center border-r">{course.exam.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center font-bold border-r bg-blue-50/30">{course.total.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center font-bold">{course.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="mt-8 flex flex-col md:flex-row justify-between items-start gap-6 border-t pt-6">
              <div className="w-full md:w-1/2">
                <table className="w-full text-sm border">
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium bg-gray-50 w-1/2">Credits Attempted</td>
                      <td className="px-4 py-2 text-right">{data.creditsAttempted}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium bg-gray-50">Credits Earned</td>
                      <td className="px-4 py-2 text-right font-bold text-green-600">{data.creditsEarned}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium bg-blue-100 text-blue-900">Semester Average / GPA</td>
                      <td className="px-4 py-2 text-right font-bold text-blue-900 bg-blue-50">{data.semesterGpa} / 20</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium bg-gray-800 text-white">Jury Decision</td>
                      <td className="px-4 py-2 text-right font-bold bg-gray-100 uppercase text-green-700 tracking-wider">
                        {data.decision}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="w-full md:w-1/3 pt-4 pr-8 text-center">
                <div className="border-b-2 border-dashed border-gray-400 mb-2 w-full h-12"></div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Registrar's Signature & Stamp</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
