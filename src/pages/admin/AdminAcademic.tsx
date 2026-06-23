import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Expanded list of courses
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

const PREDEFINED_TERMS = ['2025/1', '2025/2', '2026/1', '2026/2'];
const PREDEFINED_LECTURERS = ['Dr. Nsengiyumva Juvenal', 'Dr. Nshuti David', 'Dr. Mugabe Kevin'];

export default function AdminAcademic() {
  const [courseForm, setCourseForm] = useState({ courseCode: '', courseName: '', credits: '', termId: '', lecturerName: '' });
  const [registeredCourses, setRegisteredCourses] = useState<any[]>([]);
  const [addingCourse, setAddingCourse] = useState(false);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCourse(true);
    const newCourse = { ...courseForm, credits: Number(courseForm.credits), id: Date.now() };
    setRegisteredCourses(prev => [...prev, newCourse]);
    setCourseForm({ courseCode: '', courseName: '', credits: '', termId: courseForm.termId, lecturerName: '' });
    setAddingCourse(false);
  };

  const handleCourseSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourse = PREDEFINED_COURSES.find(c => c.code === e.target.value);
    if (selectedCourse) {
      setCourseForm(prev => ({ ...prev, courseCode: selectedCourse.code, courseName: selectedCourse.name }));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Academic Setup</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader><CardTitle>Add New Course</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <select onChange={handleCourseSelection} value={courseForm.courseCode} className="w-full p-2 border rounded" required>
                <option value="">Select a course...</option>
                {PREDEFINED_COURSES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
              </select>
              <input type="number" placeholder="Credits" value={courseForm.credits} onChange={e => setCourseForm({...courseForm, credits: e.target.value})} className="w-full p-2 border rounded" required />
              <select value={courseForm.termId} onChange={e => setCourseForm({...courseForm, termId: e.target.value})} className="w-full p-2 border rounded" required>
                <option value="">Select Term...</option>
                {PREDEFINED_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={courseForm.lecturerName} onChange={e => setCourseForm({...courseForm, lecturerName: e.target.value})} className="w-full p-2 border rounded" required>
                <option value="">Select Lecturer...</option>
                {PREDEFINED_LECTURERS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button type="submit" disabled={addingCourse} className="w-full bg-emerald-600 text-white p-2 rounded">
                {addingCourse ? "Saving..." : "Save Course"}
              </button>
            </form>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-slate-800">
          <CardHeader><CardTitle>Selected Courses for Registration</CardTitle></CardHeader>
          <CardContent>
            {registeredCourses.length === 0 ? <p className="text-slate-500 text-center py-4">No courses selected yet.</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Code</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Term</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredCourses.map(c => (
                    <tr key={c.id} className="border-b">
                      <td className="p-2 font-bold">{c.courseCode}</td>
                      <td className="p-2">{c.courseName}</td>
                      <td className="p-2">{c.termId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}