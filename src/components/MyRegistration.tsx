import { useState, useEffect, useCallback } from 'react';
import { Info, CheckSquare, Square, Loader2, CheckCircle2, RefreshCw, FileText } from 'lucide-react';

import { imsApi } from '@/lib/api';

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  fee: number;
  lecturerName?: string;
}

interface ActiveTerm {
  id: string;
  registrationOpen: boolean;
}

interface MyRegistrationData {
  termId: string;
  totalFee: number;
  courses: Course[];
  status: string;
}

export default function MyRegistration() {
  const [activeTerm, setActiveTerm] = useState<ActiveTerm | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // After submission, show the registered courses summary
  const [registeredData, setRegisteredData] = useState<MyRegistrationData | null>(null);

  const studentId = localStorage.getItem('student_id') || '25306';

  const fetchRegistrationData = useCallback(async () => {
    setLoading(true);
    try {
      // Check if student already has a registration
      try {
        const myRegResponse = await imsApi.get('/api/v1/registration/my-registration', {
          headers: { 'X-Student-Id': studentId }
        });

        if (myRegResponse.status === 200 && myRegResponse.data) {
          const myReg = myRegResponse.data;
          // Student already registered — show their submitted courses
          setRegisteredData({
            termId: myReg.termId,
            totalFee: myReg.totalFee,
            courses: myReg.courses || [],
            status: myReg.status || 'REGISTERED'
          });
          setActiveTerm(null); // Hide the registration form
          return;
        }
      } catch (err: any) {
        // If 404, it just means they haven't registered yet, continue to fetch term
        if (err?.response?.status !== 404) {
          console.error("Error fetching my-registration:", err);
        }
      }

      // No existing registration — check if term is open for new registration
      const termRes = await imsApi.get('/api/v1/registration/term');
      if (termRes.status === 200 && termRes.data) {
        setActiveTerm(termRes.data);
        if (termRes.data.registrationOpen) {
          const courseRes = await imsApi.get('/api/v1/registration/available-courses');
          if (courseRes.status === 200 && Array.isArray(courseRes.data)) {
            setCourses(courseRes.data.map((c: any) => ({
              ...c,
              fee: c.fee ?? (c.credits * 21300)
            })));
          }
        }
      }
    } catch (error) {
      setActiveTerm(null);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchRegistrationData();
  }, [fetchRegistrationData]);

  const toggleCourseSelection = (courseId: number) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourseIds.length === courses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(courses.map(c => c.id));
    }
  };

  const handleSubmitRegistration = async () => {
    if (selectedCourseIds.length === 0) {
      alert('Please select at least one course to register.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await imsApi.post('/api/v1/registration/submit', selectedCourseIds, {
        headers: {
          'X-Student-Id': studentId
        }
      });

      const data = res.data;
      setRegisteredData({
        termId: data.termId,
        totalFee: data.totalFee,
        courses: courses.filter(c => selectedCourseIds.includes(c.id)),
        status: 'REGISTERED'
      });
      setActiveTerm(null);
      setSelectedCourseIds([]);
    } catch (error: any) {
      alert(`Failed to submit registration: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCoursesData = courses.filter(c => selectedCourseIds.includes(c.id));
  const totalCredits = selectedCoursesData.reduce((sum, c) => sum + c.credits, 0);
  const totalFee = selectedCoursesData.reduce((sum, c) => sum + c.fee, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);

  if (loading) {
    return (
      <div className="p-12 text-center text-blue-900">
        <Loader2 className="animate-spin mx-auto" size={32} />
        <p className="mt-3 text-sm text-gray-500">Loading registration status...</p>
      </div>
    );
  }

  // ── REGISTERED: Show submitted courses summary ──────────────────────────────
  if (registeredData) {
    return (
      <div className="space-y-6 animate-fade-in-slow">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#00447b] rounded-lg shadow-sm p-4 md:p-6 text-white">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-100 tracking-tight">Course Registration</h1>
            <p className="text-blue-200 font-light mt-1 text-sm">Term: {registeredData.termId}</p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1.5 bg-green-500/20 border border-green-400/40 rounded-full text-xs font-bold text-green-300">
            ✓ Registered
          </span>
        </div>

        {/* Success banner */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="text-green-500 shrink-0" size={24} />
          <div>
            <p className="text-green-800 font-bold">Registration Submitted Successfully!</p>
            <p className="text-green-700 text-sm mt-0.5">
              You are registered for term <strong>{registeredData.termId}</strong>. 
              To pay in installments, go to <strong>Sign Contract</strong>.
            </p>
          </div>
        </div>

        {/* Registered Courses Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <FileText className="text-blue-600" size={18} />
            <h2 className="font-bold text-gray-800">Registered Courses — {registeredData.termId}</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 border-b">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase">#</th>
                  <th className="px-5 py-3 font-semibold uppercase">Course Code</th>
                  <th className="px-5 py-3 font-semibold uppercase">Course Name</th>
                  <th className="px-5 py-3 font-semibold uppercase text-center">Credits</th>
                  <th className="px-5 py-3 font-semibold uppercase text-right">Fee (RWF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registeredData.courses.map((course, idx) => (
                  <tr key={course.id ?? idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-5 py-4 font-bold text-gray-800">{course.courseCode}</td>
                    <td className="px-5 py-4 text-gray-600">{course.courseName}</td>
                    <td className="px-5 py-4 text-center font-medium">{course.credits}</td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-800">
                      {formatCurrency(course.fee ?? (course.credits * 21300))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#00447b]/5 border-t-2 border-[#00447b]/20">
                  <td colSpan={3} className="px-5 py-4 font-bold text-gray-700">Total</td>
                  <td className="px-5 py-4 text-center font-bold text-gray-800">
                    {registeredData.courses.reduce((s, c) => s + (c.credits ?? 0), 0)}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-xl text-[#00447b]">
                    {formatCurrency(registeredData.totalFee)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Total Amount Box */}
        <div className="bg-blue-900 text-white rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm">Total Amount to Pay</p>
            <p className="text-3xl font-black mt-1">{formatCurrency(registeredData.totalFee)}</p>
            <p className="text-blue-300 text-xs mt-1">For {registeredData.courses.length} course(s) — Term {registeredData.termId}</p>
          </div>
          <div className="flex flex-col gap-2">
            <a href="/contract" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors text-sm">
              Sign a Payment Contract
            </a>
            <a href="/my-fees" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-blue-400/40 text-blue-200 rounded-lg hover:border-blue-300 hover:text-white transition-colors text-sm">
              View Fees &amp; Balance
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = activeTerm !== null;

  // ── REGISTRATION FORM ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in-slow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#00447b] rounded-lg shadow-sm p-4 md:p-6 text-white border border-transparent">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-100 tracking-tight">Course Registration</h1>
          <p className="text-blue-200 font-light mt-1 text-sm">
            {isRegistrationOpen ? `Active term: ${activeTerm.id}` : 'Active term: No Active Term'}
          </p>
        </div>
        <button
          onClick={fetchRegistrationData}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-blue-200 hover:text-white border border-blue-400/40 hover:border-blue-300 rounded-md px-3 py-1.5 transition-all"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Registration Closed */}
      {!isRegistrationOpen && (
        <div className="flex items-start gap-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl p-6 shadow-sm">
          <Info className="text-[#d97706] mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="font-bold text-[#92400e] text-lg">Registration is Closed</h3>
            <p className="text-sm text-[#92400e] mt-1">
              There are no open courses for registration at this time. If you believe this is an error, please contact the academic registrar's office.
            </p>
          </div>
        </div>
      )}

      {/* Registration Open */}
      {isRegistrationOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Course Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-800">Available Courses — {activeTerm.id}</h2>
              <button onClick={handleSelectAll} className="text-sm text-blue-600 font-semibold hover:underline">
                {selectedCourseIds.length === courses.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            {courses.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Info size={32} className="mx-auto mb-3 opacity-30" />
                <p>No courses assigned to this term yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 text-gray-500 border-b">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">Select</th>
                      <th className="px-4 py-3 font-semibold uppercase">Code</th>
                      <th className="px-4 py-3 font-semibold uppercase">Course Name</th>
                      <th className="px-4 py-3 font-semibold uppercase text-center">Credits</th>
                      <th className="px-4 py-3 font-semibold uppercase text-right">Fee (RWF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map((course) => {
                      const isSelected = selectedCourseIds.includes(course.id);
                      return (
                        <tr
                          key={course.id}
                          onClick={() => toggleCourseSelection(course.id)}
                          className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${isSelected ? 'bg-blue-50/80' : ''}`}
                        >
                          <td className="px-4 py-4 text-center">
                            {isSelected
                              ? <CheckSquare className="text-blue-600 inline" size={20} />
                              : <Square className="text-gray-300 inline" size={20} />}
                          </td>
                          <td className="px-4 py-4 font-bold text-gray-700">{course.courseCode}</td>
                          <td className="px-4 py-4 text-gray-600">{course.courseName}</td>
                          <td className="px-4 py-4 text-center font-medium">{course.credits}</td>
                          <td className="px-4 py-4 text-right font-medium text-gray-700">{formatCurrency(course.fee)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-6">
              <div className="px-6 py-4 border-b bg-[#00447b] text-white rounded-t-xl">
                <h2 className="font-bold text-lg">Registration Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Courses Selected:</span>
                  <span className="font-bold">{selectedCourseIds.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-bold">{totalCredits}</span>
                </div>
                {selectedCoursesData.length > 0 && (
                  <div className="pt-2 space-y-1 border-t border-gray-100">
                    {selectedCoursesData.map(c => (
                      <div key={c.id} className="flex justify-between text-xs text-gray-500">
                        <span>{c.courseCode}</span>
                        <span>{formatCurrency(c.fee)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total Fees:</span>
                    <span className="font-bold text-xl text-blue-700">{formatCurrency(totalFee)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-right">* 21,300 RWF per credit</p>
                </div>
                <button
                  onClick={handleSubmitRegistration}
                  disabled={selectedCourseIds.length === 0 || submitting}
                  className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-600 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <><Loader2 className="animate-spin" size={18} /> Submitting...</> : 'Submit Registration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}