import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, Trash2, Calendar, BookOpen, XCircle, PlayCircle, PauseCircle, RefreshCw } from 'lucide-react';
import { imsApi } from '@/lib/api';

const PREDEFINED_COURSES = [
  { code: 'ACCT 112', name: 'Principles of Accounting I' },
  { code: 'AMAT 111', name: 'Applied Mathematics' },
  { code: 'COSC 8311', name: 'Advanced Computer Networks' },
  { code: 'COSC 8321', name: 'Data Structure and Algorithm' },
  { code: 'COSC 8323', name: 'Network Administration' },
  { code: 'COSC 8324', name: 'Network Programming TCP/IP' },
  { code: 'COSC 8325', name: 'Network Security' },
  { code: 'COSC 8411', name: 'System Administration' },
  { code: 'COSC 8412', name: 'Wireless Networks' },
  { code: 'EDRM 113', name: 'Study and Research Methods' },
  { code: 'ENGL 115', name: 'General English' },
  { code: 'ENGL 124', name: 'Academic English Writing' },
  { code: 'INSY 118', name: 'Introduction to Computer Applications' },
  { code: 'INSY 214', name: 'Computer Maintenance' },
  { code: 'INSY 217', name: 'Database Management System' },
  { code: 'INSY 227', name: 'Introduction to Computer Programming' },
  { code: 'INSY 228', name: 'Programming with C' },
  { code: 'INSY 324', name: 'Java Programming' },
  { code: 'INSY 329', name: 'Operating Systems' },
  { code: 'INSY 426', name: 'Web Design' },
  { code: 'INSY 8211', name: 'Computer Networks' },
  { code: 'INSY 8313', name: 'Management Information System' },
  { code: 'INSY 8322', name: 'Web Technology and Internet' },
  { code: 'INSY 8415', name: 'System Analysis and Design' },
  { code: 'MATH 126', name: 'Multivariable Calculus & Differential Equations' },
  { code: 'MATH 127', name: 'Digital Computer Fundamentals' },
  { code: 'RELB 116', name: 'Introduction to Bible Study' },
  { code: 'SENG 8215', name: 'Software Engineering' },
  { code: 'STAT 122', name: 'Descriptive Statistics' }
];

const PREDEFINED_TERMS = ['2025/1', '2025/2', '2026/1', '2026/2', '2026/3', '2026/4'];


export default function AdminAcademic() {
  const [selectedTermInput, setSelectedTermInput] = useState(PREDEFINED_TERMS[0]);
  const [managedTerm, setManagedTerm] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [togglingRegistration, setTogglingRegistration] = useState(false);

  const [courseForm, setCourseForm] = useState({ courseCode: '', courseName: '', credits: '' });
  const [registeredCourses, setRegisteredCourses] = useState<any[]>([]);
  const [addingCourse, setAddingCourse] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Load existing courses for the managed term
  const fetchCoursesForTerm = async (termId: string) => {
    setLoadingCourses(true);
    try {
      const res = await imsApi.get(`/api/v1/admin/academic/courses?termId=${encodeURIComponent(termId)}`);
      setRegisteredCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Could not load courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  // On mount, check if there's already an active managed term
  useEffect(() => {
    const checkActiveTerm = async () => {
      try {
        const res = await imsApi.get('/api/v1/admin/academic/terms/active');
        if (res.data && res.data.active) {
          setManagedTerm(res.data.termId);
          setSelectedTermInput(res.data.termId);
          setRegistrationOpen(res.data.registrationOpen);
          fetchCoursesForTerm(res.data.termId);
        }
      } catch (err) {
        // 404 or no active term, do nothing
      }
    };
    checkActiveTerm();
  }, []);

  // Admin selects a term to start managing it (does NOT open registration)
  const startManagingTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTermInput) return;

    setLoadingCourses(true);
    try {
      const res = await imsApi.put(`/api/v1/admin/academic/terms/activate?termId=${encodeURIComponent(selectedTermInput)}`);
      setManagedTerm(selectedTermInput);
      setRegistrationOpen(res.data?.registrationOpen ?? false);
      await fetchCoursesForTerm(selectedTermInput);
    } catch (err) {
      console.error('Could not activate term:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Toggle registration open/closed for students
  const toggleRegistration = async () => {
    setTogglingRegistration(true);
    try {
      if (registrationOpen) {
        // Close registration
        await imsApi.put(`/api/v1/admin/academic/terms/close-registration`);
        setRegistrationOpen(false);
      } else {
        // Open registration
        await imsApi.put(`/api/v1/admin/academic/terms/open-registration?termId=${encodeURIComponent(managedTerm)}`);
        setRegistrationOpen(true);
      }
    } catch (err) {
      console.error('Failed to toggle registration:', err);
    } finally {
      setTogglingRegistration(false);
    }
  };

  // Close/exit the currently managed term
  const closeManagedTerm = async () => {
    try {
      await imsApi.put(`/api/v1/admin/academic/terms/deactivate-all`);
    } catch (err) {
      console.error('Failed to deactivate terms:', err);
    }
    setManagedTerm('');
    setRegistrationOpen(false);
    setRegisteredCourses([]);
    setSelectedTermInput('');
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCourse(true);

    try {
      const response = await imsApi.post(`/api/v1/admin/academic/courses`, {
        courseCode: courseForm.courseCode,
        courseName: courseForm.courseName,
        credits: Number(courseForm.credits),
        termId: managedTerm
      });

      setRegisteredCourses(prev => [...prev, response.data]);
      setCourseForm({ courseCode: '', courseName: '', credits: '' });
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to save course to database.');
    } finally {
      setAddingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to remove this course?')) return;
    setRegisteredCourses(prev => prev.filter(c => c.id !== courseId));

    try {
      await imsApi.delete(`/api/v1/admin/academic/courses/${courseId}`);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course from database.');
    }
  };

  const handleCourseSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourse = PREDEFINED_COURSES.find(c => c.code === e.target.value);
    if (selectedCourse) {
      setCourseForm({ courseCode: selectedCourse.code, courseName: selectedCourse.name, credits: courseForm.credits });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in-slow">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Academic Setup</h1>
          <p className="text-gray-500 mt-1">Configure terms and assign courses.</p>
        </div>
      </div>

      {/* STEP 1: Select Term (Visible if no term is managed) */}
      {!managedTerm ? (
        <Card className="max-w-md border-t-4 border-t-blue-600 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={24} />
              <CardTitle>Select Term to Manage</CardTitle>
            </div>
            <CardDescription>
              Choose an academic term to set up courses for registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={startManagingTerm} className="space-y-4">
              <select
                value={selectedTermInput}
                onChange={(e) => setSelectedTermInput(e.target.value)}
                className="w-full p-2.5 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                required
              >
                <option value="" disabled>Select Term...</option>
                {PREDEFINED_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                type="submit"
                disabled={!selectedTermInput || loadingCourses}
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2.5 rounded-md font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingCourses ? <><Loader2 className="animate-spin" size={16} /> Loading...</> : 'Start Setup'}
              </button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* STEP 2: Manage the Selected Term */
        <div className="space-y-6">
          {/* Term Header Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-wrap gap-3 justify-between items-center shadow-sm">
            <div>
              <span className="text-blue-600 font-bold tracking-wider text-sm">CURRENTLY MANAGING TERM</span>
              <h2 className="text-2xl font-black text-blue-900">{managedTerm}</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Registration Open/Close Toggle */}
              <button
                onClick={toggleRegistration}
                disabled={togglingRegistration}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all shadow-sm disabled:opacity-50 ${
                  registrationOpen
                    ? 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {togglingRegistration ? (
                  <><Loader2 className="animate-spin" size={16} /> Updating...</>
                ) : registrationOpen ? (
                  <><PauseCircle size={18} /> Close Registration</>
                ) : (
                  <><PlayCircle size={18} /> Open Registration</>
                )}
              </button>

              {/* Registration Status Badge */}
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                registrationOpen
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
                {registrationOpen ? '● Registration Open' : '○ Registration Closed'}
              </span>

              {/* Exit Term Management */}
              <button
                onClick={closeManagedTerm}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
              >
                <XCircle size={18} /> Close Term
              </button>
            </div>
          </div>

          {/* Registration open banner */}
          {registrationOpen && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800 text-sm font-medium flex items-center gap-2">
              <PlayCircle size={16} className="text-green-600 shrink-0" />
              Students can now see <strong>{managedTerm}</strong> courses and submit their course registration.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Form to add courses */}
            <Card className="lg:col-span-1 border-t-4 border-t-emerald-500 shadow-sm h-fit">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="text-emerald-500" size={20} />
                  <CardTitle>Add Course</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Select Course</label>
                    <select
                      onChange={handleCourseSelection}
                      value={courseForm.courseCode}
                      className="w-full p-2.5 border rounded-md border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      required
                    >
                      <option value="">Choose...</option>
                      {PREDEFINED_COURSES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Credits (Max 4)</label>
                    <input
                      type="number"
                      placeholder="Credits"
                      value={courseForm.credits}
                      onChange={e => setCourseForm({ ...courseForm, credits: e.target.value })}
                      className="w-full p-2.5 border rounded-md border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      required min="1" max="4"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addingCourse}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white py-2.5 rounded-md font-semibold mt-2"
                  >
                    {addingCourse ? <><Loader2 className="animate-spin inline mr-2" size={16} />Saving...</> : 'Add to Term'}
                  </button>
                </form>
              </CardContent>
            </Card>

            {/* List of existing courses */}
            <Card className="lg:col-span-2 border-t-4 border-t-slate-800 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Courses Assigned to {managedTerm}</CardTitle>
                    <CardDescription>Students will see these courses when registration is open.</CardDescription>
                  </div>
                  <button
                    onClick={() => fetchCoursesForTerm(managedTerm)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Refresh courses"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingCourses ? (
                  <div className="py-8 text-center text-slate-500"><Loader2 className="animate-spin inline" size={24} /></div>
                ) : registeredCourses.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-20" />
                    <p>No courses added to this term yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-semibold text-slate-600">Code</th>
                          <th className="text-left p-3 font-semibold text-slate-600">Course Name</th>
                          <th className="text-center p-3 font-semibold text-slate-600">Credits</th>
                          <th className="text-right p-3 font-semibold text-slate-600">Fee (RWF)</th>
                          <th className="text-center p-3 font-semibold text-slate-600 w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {registeredCourses.map((c, idx) => {
                          const courseFee = c.fee || (c.credits * 21300);
                          return (
                            <tr key={c.id ?? idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-bold text-slate-800">{c.courseCode}</td>
                              <td className="p-3 text-slate-600">{c.courseName}</td>
                              <td className="p-3 text-center font-medium">{c.credits}</td>
                              <td className="p-3 text-right font-medium text-slate-800">{formatCurrency(courseFee)}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleDeleteCourse(c.id)}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Delete Course"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}