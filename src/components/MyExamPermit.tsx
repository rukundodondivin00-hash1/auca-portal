import { useState, useEffect, useRef } from 'react';
import { Loader2, QrCode, Upload, Printer, AlertTriangle } from 'lucide-react';
import { studentApi, paymentApi, registrationApi } from '@/lib/api';
import aucaLogo from '@/images/AUCA-logo.png';

interface Course {
  courseCode: string;
  courseName: string;
  credits: number;
}

interface PermitData {
  name: string;
  studentId: string;
  gender: string;
  program: string;
  department: string;
  termId: string;
  totalFee: number;
  paidAmount: number;
  balanceDue: number;
  courses: Course[];
}

export default function MyExamPermit() {
  const [loading, setLoading] = useState(true);
  const [permitStatus, setPermitStatus] = useState<'FULL' | 'PARTIAL' | 'NONE'>('NONE');
  const [permitData, setPermitData] = useState<PermitData | null>(null);
  
  const studentId = localStorage.getItem('student_id') || '25306';
  
  // Photo upload state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    return localStorage.getItem(`student_photo_${studentId}`);
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPermitStatus = async () => {
      setLoading(true);
      try {
        const termRes = await registrationApi.getTerm();
        let totalFee = 0;
        let pData: any = {
          name: '',
          studentId: studentId,
          gender: 'MALE', // Defaulted or fetched
          program: '',
          department: '',
          termId: termRes.data?.id || '',
          courses: []
        };

        if (termRes.data && termRes.data.id) {
          try {
            const regRes = await registrationApi.getMyRegistration(studentId, termRes.data.id);
            if (regRes.status === 200 && regRes.data) {
              const r = regRes.data;
              totalFee = r.totalFee;
              pData = {
                ...pData,
                name: r.studentName,
                program: r.studentProgram,
                department: r.studentDepartment,
                courses: r.courses || []
              };
            }
          } catch {
            // Ignore if no registration
          }
        }

        let paidAmount = 0;
        try {
          const balRes = await paymentApi.getMyBalance(studentId);
          const currentPrePaid = Number(balRes.data?.data?.totalPaid || balRes.data?.totalPaid || 0);
          
          const contractRes = await studentApi.getMyContracts();
          const contracts: any[] = contractRes.data?.data || [];
          
          if (contracts.length > 0) {
            const c = contracts[0];
            const installPaid = (c.installments || []).reduce((s: number, i: any) => s + (i.amountPaid || 0), 0);
            paidAmount = currentPrePaid + installPaid;
            
            if (paidAmount < totalFee) {
               const paidInstallmentsCount = (c.installments || []).filter((i: any) => i.status === 'PAID' || i.status === 'PARTIALLY_PAID').length;
               if (paidInstallmentsCount >= 1) {
                 setPermitStatus('PARTIAL');
               } else {
                 setPermitStatus('NONE');
               }
            } else {
               setPermitStatus('FULL');
            }
          } else {
            paidAmount = currentPrePaid;
            if (paidAmount >= totalFee && totalFee > 0) {
              setPermitStatus('FULL');
            } else {
              setPermitStatus('NONE');
            }
          }
        } catch {
          setPermitStatus('NONE');
        }

        setPermitData({
          ...pData,
          totalFee,
          paidAmount,
          balanceDue: Math.max(0, totalFee - paidAmount)
        });

      } catch (err) {
        console.error("Failed to load permit status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermitStatus();
  }, [studentId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePhoto(base64String);
        localStorage.setItem(`student_photo_${studentId}`, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#00447b] animate-spin" />
      </div>
    );
  }

  // Calculate total credits
  const totalCredits = permitData?.courses?.reduce((sum, c) => sum + c.credits, 0) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Non-printable screen header */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <h1 className="text-3xl font-bold text-slate-800">My Exam Permit</h1>
        <button 
          onClick={handlePrint}
          disabled={permitStatus === 'NONE'}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-colors ${permitStatus !== 'NONE' ? 'bg-[#00447b] hover:bg-blue-900 text-white shadow-md' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
        >
          <Printer size={18} />
          Print Permit
        </button>
      </div>

      {permitStatus === 'NONE' && (
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl shadow-sm text-center flex flex-col items-center print:hidden">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-700">No Exam Permit Available</h2>
          <p className="mt-2 text-red-600 max-w-lg mx-auto">
            You do not have a valid exam permit. You must either pay the full semester fees upfront or sign a payment contract and complete at least one installment to receive a partial permit.
          </p>
        </div>
      )}

      {permitStatus !== 'NONE' && permitData && (
        <div className="bg-white mx-auto shadow-xl print:shadow-none border border-slate-300 print:border-none p-8" style={{ width: '100%', maxWidth: '900px' }}>
          
          {/* Header Section */}
          <div className="flex justify-between items-center border-b-4 border-[#00447b] pb-6 mb-6">
            <div className="flex items-center gap-6">
              <img src={aucaLogo} alt="AUCA Logo" className="w-24 h-24 object-contain" />
              <div>
                <h1 className="text-2xl font-black text-[#00447b] uppercase tracking-wide">Adventist University of Central Africa</h1>
                <h2 className="text-lg font-bold text-slate-700 uppercase mt-1">Office of the Registrar</h2>
                <h3 className="text-md font-semibold text-slate-600 mt-1">Student Examination Permit</h3>
                <p className="text-xs text-slate-500 mt-2 font-medium">PRINT DATE: {new Date().toLocaleString().toUpperCase()}</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg">
              <QrCode size={80} className="text-slate-800" />
            </div>
          </div>

          {/* Blue Title Bar */}
          <div className="bg-[#00447b] text-white text-center py-2 font-bold uppercase tracking-widest text-lg mb-8">
            Examination Permit
          </div>

          {/* Student Info Area */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 border-b-2 border-dashed border-gray-300 pb-8">
            
            {/* Photo Upload Area */}
            <div className="w-40 shrink-0 flex flex-col items-center">
              <div 
                className="w-36 h-44 border-4 border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-[#00447b] transition-colors" />
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#00447b] transition-colors text-center px-2">Click to Upload<br/>Photo</span>
                  </>
                )}
                {profilePhoto && (
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center print:hidden">
                    <span className="text-white text-xs font-bold">Change Photo</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Info Grid */}
            <div className="flex-1 grid grid-cols-12 gap-x-4 gap-y-3 text-sm">
              <div className="col-span-3 font-bold text-slate-700">FULL NAME:</div>
              <div className="col-span-5 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1">{permitData.name}</div>
              
              <div className="col-span-2 font-bold text-slate-700 text-right">FEES BAL DUE:</div>
              <div className="col-span-2 font-bold text-red-600 border-b border-dotted border-gray-400 pb-1">{permitData.balanceDue.toLocaleString()} RWF</div>

              <div className="col-span-3 font-bold text-slate-700">GENDER:</div>
              <div className="col-span-9 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1">{permitData.gender}</div>

              <div className="col-span-3 font-bold text-slate-700">STUDENT NO:</div>
              <div className="col-span-9 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1">{permitData.studentId}</div>

              <div className="col-span-3 font-bold text-slate-700">PROGRAMME:</div>
              <div className="col-span-9 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1">{permitData.department}</div>

              <div className="col-span-3 font-bold text-slate-700">STUDY PROGRAM:</div>
              <div className="col-span-5 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1">{permitData.program || 'DAY'}</div>

              <div className="col-span-2 font-bold text-slate-700 text-right">TERM:</div>
              <div className="col-span-2 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1">{permitData.termId}</div>

              <div className="col-span-3 font-bold text-slate-700">PERMIT TYPE:</div>
              <div className="col-span-9 border-b border-dotted border-gray-400 pb-1 flex items-center">
                <span className={`font-black text-sm uppercase px-2 py-0.5 rounded ${permitStatus === 'FULL' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {permitStatus === 'FULL' ? 'FULL EXAM PERMIT' : 'PARTIAL (MIDTERM EXAMS ONLY)'}
                </span>
              </div>
            </div>
          </div>

          {/* Courses Title */}
          <div className="text-center font-bold text-[#00447b] tracking-wider mb-4">
            COURSES / MODULES REGISTERED
          </div>

          {/* Courses Table */}
          <table className="w-full text-sm border border-slate-300 mb-4">
            <thead className="bg-slate-100 border-b-2 border-slate-300">
              <tr>
                <th className="py-2 px-3 text-left font-bold text-slate-800 border-r border-slate-300 w-12">#</th>
                <th className="py-2 px-3 text-left font-bold text-slate-800 border-r border-slate-300">COURSE NAME</th>
                <th className="py-2 px-3 text-center font-bold text-slate-800 border-r border-slate-300">CREDIT UNITS</th>
                <th className="py-2 px-3 text-center font-bold text-slate-800 border-r border-slate-300">CATEGORY</th>
                <th className="py-2 px-3 text-left font-bold text-slate-800">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {permitData.courses.length > 0 ? (
                permitData.courses.map((course, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="py-2 px-3 border-r border-slate-300 text-slate-800 font-medium">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-slate-300">
                      <span className="font-bold">{course.courseCode}</span>: {course.courseName}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 text-center font-medium">{course.credits}</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-center text-slate-600">CORE</td>
                    <td className="py-2 px-3 text-slate-800">NORMAL PAPER</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 italic">No courses registered for this term.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer Info */}
          <p className="text-sm font-bold text-slate-800 italic mb-6">
            Total Credits Registered for {permitData.termId} is {totalCredits}.
          </p>

          <p className="text-xs text-justify text-slate-700 leading-tight mb-16 italic">
            <span className="font-bold underline">NOTES:</span> This is to certify that the above named has been authorized to sit the stated examination(s). This Examination Permit is confidential and must be produced to the invigilator when required at each examination. You are cautioned against contravening any of the University rules and Regulations. Please do not write anything on this Examination Permit. <strong>Always refer to the notice boards for the latest timetable updates.</strong>
          </p>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-12">
            <div className="font-bold text-sm text-slate-800 uppercase">
              REGISTERED BY: <span className="font-normal ml-2">STUDENT</span>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-800 mb-1"></div>
              <p className="font-bold text-sm text-slate-800 uppercase">SCHOOL REGISTRAR</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
