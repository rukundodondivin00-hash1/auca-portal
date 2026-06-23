import { useState, useEffect } from 'react';
import { Info, CheckSquare, Square, Loader2, CheckCircle2 } from 'lucide-react';

// Mock API for the preview environment.
// In your local project, remove this mock and restore: import { studentApi } from '@/lib/api';
const studentApi = {
  createContract: (payload: any) => Promise.resolve({ data: "Contract created" })
};

// Replace with your actual backend URL
const API_BASE_URL = "http://localhost:8080/api/v1/registration";

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  fee: number;
  lecturerName?: string;
  day?: string;
}

export default function MyRegistration() {
  const [activeTerm, setActiveTerm] = useState("Loading...");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const studentId = localStorage.getItem('student_id') || '25306';

  useEffect(() => {
    const fetchRegistrationData = async () => {
      setLoading(true);
      try {
        // Fetch courses from your Spring Boot controller
        const response = await fetch(`${API_BASE_URL}/available-courses`);
        
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
          
          // If we got courses, let's assume the term is active.
          // You could also extract the termId from the first course if needed.
          const currentTerm = data.length > 0 ? data[0].termId : "Active Term";
          setActiveTerm(currentTerm || "Active Term"); 
          setIsRegistrationOpen(true);
        } else {
          setIsRegistrationOpen(false);
          setActiveTerm("No Active Term");
        }
      } catch (error) {
        setIsRegistrationOpen(false);
        setActiveTerm("No Active Term");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegistrationData();
  }, []);

  const toggleCourseSelection = (courseId: number) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourseIds.length === courses.length) {
      setSelectedCourseIds([]); // Deselect all
    } else {
      setSelectedCourseIds(courses.map(c => c.id)); // Select all
    }
  };

  const handleSubmitRegistration = async () => {
    if (selectedCourseIds.length === 0) {
      alert("Please select at least one course to register.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit Registration to Port 8080
      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Student-Id': studentId
        },
        body: JSON.stringify(selectedCourseIds)
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      const data = await response.json();

      // 2. Auto-create Contract on Port 8083 using the exact fee calculated by the backend!
      try {
        await studentApi.createContract({
          studentId: data.studentId,
          termId: data.termId,
          totalFees: data.totalFee
        });
      } catch (contractError) {
        console.error("Failed to generate contract:", contractError);
        // We log the error, but the registration itself succeeded
      }

      setSuccessMessage("Your registration has been submitted successfully! Your contract has been generated. Please proceed to sign it.");
      setSelectedCourseIds([]); // Clear selection on success
      setIsRegistrationOpen(false); // Hide the form so they don't submit twice
    } catch (error: any) {
      alert("Failed to submit registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate Totals dynamically
  const selectedCoursesData = courses.filter(c => selectedCourseIds.includes(c.id));
  const totalCredits = selectedCoursesData.reduce((sum, c) => sum + c.credits, 0);
  const totalFee = selectedCoursesData.reduce((sum, c) => sum + c.fee, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  if (loading) {
    return <div className="p-12 text-center text-blue-900"><Loader2 className="animate-spin mx-auto" size={32} /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-slow">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#00447b] dark:bg-slate-900 rounded-lg shadow-sm p-4 md:p-6 text-white dark:text-slate-100 border border-transparent dark:border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-100 dark:text-slate-50 tracking-tight">
            Course Registration
          </h1>
          <p className="text-blue-200 dark:text-slate-300 font-light mt-1 text-sm">
            Active term: {activeTerm}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="text-green-500 shrink-0" size={24} />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Main Registration Area */}
      {!isRegistrationOpen && !successMessage ? (
        <div className="flex items-start gap-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl p-6 shadow-sm">
          <Info className="text-[#d97706] mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="font-bold text-[#92400e] text-lg">Registration is Closed</h3>
            <p className="text-sm text-[#92400e] mt-1">
              There are no open courses for registration at this time. If you believe this is an error, please contact the academic registrar's office.
            </p>
          </div>
        </div>
      ) : isRegistrationOpen ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Side: Course Selection Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
              <h2 className="font-bold text-gray-800 dark:text-slate-200">Available Courses</h2>
              <button 
                onClick={handleSelectAll}
                className="text-sm text-blue-600 font-semibold hover:underline"
              >
                {selectedCourseIds.length === courses.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 dark:bg-slate-900/30 text-gray-500 dark:text-slate-400 border-b">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Select</th>
                    <th className="px-4 py-3 font-semibold uppercase">Course Code</th>
                    <th className="px-4 py-3 font-semibold uppercase">Course Name</th>
                    <th className="px-4 py-3 font-semibold uppercase text-center">Credits</th>
                    <th className="px-4 py-3 font-semibold uppercase text-right">Fee (RWF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                  {courses.map((course) => {
                    const isSelected = selectedCourseIds.includes(course.id);
                    return (
                      <tr 
                        key={course.id} 
                        onClick={() => toggleCourseSelection(course.id)}
                        className={`cursor-pointer transition-colors hover:bg-blue-50/50 dark:hover:bg-slate-800/50 ${isSelected ? 'bg-blue-50/80 dark:bg-blue-900/20' : ''}`}
                      >
                        <td className="px-4 py-4 text-center">
                          {isSelected ? (
                            <CheckSquare className="text-blue-600 inline" size={20} />
                          ) : (
                            <Square className="text-gray-300 inline" size={20} />
                          )}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-700 dark:text-slate-200">{course.courseCode}</td>
                        <td className="px-4 py-4 text-gray-600 dark:text-slate-300">
                          {course.courseName}
                          {course.lecturerName && <span className="block text-xs text-gray-400 mt-1">By: {course.lecturerName}</span>}
                        </td>
                        <td className="px-4 py-4 text-center font-medium">
                          {course.credits}
                          {course.credits > 4 && <span className="text-red-500 text-xs block">(Max 4)</span>}
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-gray-700 dark:text-slate-200">
                          {formatCurrency(course.fee)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm sticky top-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-[#00447b] text-white rounded-t-xl">
                <h2 className="font-bold text-lg">Registration Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Courses Selected:</span>
                  <span className="font-bold text-gray-900 dark:text-slate-100">{selectedCourseIds.length}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Total Credits:</span>
                  <span className="font-bold text-gray-900 dark:text-slate-100">{totalCredits}</span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Total Fee Estimated:</span>
                    <span className="font-bold text-xl text-blue-700 dark:text-blue-400">
                      {formatCurrency(totalFee)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-right">* Calculated at 21,300 RWF per credit</p>
                </div>

                <button
                  onClick={handleSubmitRegistration}
                  disabled={selectedCourseIds.length === 0 || submitting}
                  className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-600 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <><Loader2 className="animate-spin" size={18} /> Submitting...</> : "Submit Registration"}
                </button>
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}