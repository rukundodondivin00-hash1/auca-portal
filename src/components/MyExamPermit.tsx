import { useState, useEffect, useRef } from 'react';
import { Printer, AlertTriangle, Upload, Loader2 } from 'lucide-react';
import { studentApi, paymentApi, registrationApi } from '@/lib/api';
import aucaLogo from '@/images/AUCA-logo.png';
import { QRCodeSVG } from 'qrcode.react';

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
          gender: 'MALE',
          program: 'Day',
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
                program: r.studentProgram || 'Day',
                department: r.studentDepartment,
                courses: r.courses || []
              };
            }
          } catch {
            // Ignore if no registration
          }
        }

        let initialPaymentPercentage = 100;
        if (pData.termId) {
          try {
            const configRes = await studentApi.getTermConfig(pData.termId);
            if (configRes.data && configRes.data.initialPaymentPercentage) {
              initialPaymentPercentage = Number(configRes.data.initialPaymentPercentage);
            }
          } catch {
            // Default to 100% if config missing
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
          } else {
            paidAmount = currentPrePaid;
          }

          const minRequiredAmount = (totalFee * initialPaymentPercentage) / 100;

          if (paidAmount >= totalFee && totalFee > 0) {
            setPermitStatus('FULL');
          } else if (paidAmount >= minRequiredAmount && minRequiredAmount > 0) {
            setPermitStatus('PARTIAL');
          } else {
            setPermitStatus('NONE');
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

  const totalCredits = permitData?.courses?.reduce((sum, c) => sum + c.credits, 0) || 0;

  const qrContent = permitData ? JSON.stringify({
    id: permitData.studentId,
    name: permitData.name,
    term: permitData.termId,
    status: permitStatus
  }) : '';

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
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
            You do not have a valid exam permit. You must pay at least your required initial payment to receive a partial permit, or pay in full for a full permit.
          </p>
        </div>
      )}

      {permitStatus !== 'NONE' && permitData && (
        <div className="bg-white mx-auto shadow-sm print:shadow-none p-8 font-sans" style={{ width: '100%', maxWidth: '850px' }}>
          
          {/* Header Section */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <img src={aucaLogo} alt="AUCA Logo" className="w-16 h-16 object-contain" />
              <div className="text-center">
                <h1 className="text-xl font-bold text-[#00447b] font-serif">Adventist University of Central Africa</h1>
                <p className="text-xs text-[#00447b] tracking-wide">P.O. Box 2461 Kigali, Rwanda | www.auca.ac.rw | info@auca.ac.rw</p>
              </div>
            </div>
            
            <h2 className="text-lg font-extrabold mt-6 uppercase tracking-wide">EXAMINATION PERMIT CARD</h2>
            <p className="text-sm font-bold mt-1">Semester {permitData.termId.replace('/', '/')} &nbsp;|&nbsp; Generated {currentDate}</p>
          </div>

          {/* Main Content Grid */}
          <div className="flex items-stretch border border-black mb-4">
            
            {/* Left Column (Info + Courses) */}
            <div className="flex-1 flex flex-col border-r border-black">
              
              {/* Info Table */}
              <div className="flex flex-col border-b border-black">
                <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                  <div className="bg-[#e6f0ff] p-1.5 border-r border-black">Reg No</div>
                  <div className="p-1.5 font-normal">{permitData.studentId}</div>
                </div>
                <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                  <div className="bg-[#e6f0ff] p-1.5 border-r border-black">Name</div>
                  <div className="p-1.5 font-normal uppercase">{permitData.name}</div>
                </div>
                <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                  <div className="bg-[#e6f0ff] p-1.5 border-r border-black">Faculty</div>
                  <div className="p-1.5 font-normal">Information Technology</div>
                </div>
                <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                  <div className="bg-[#e6f0ff] p-1.5 border-r border-black">Department</div>
                  <div className="p-1.5 font-normal">{permitData.department || 'Networks and Com. Systems'}</div>
                </div>
                <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                  <div className="bg-[#e6f0ff] p-1.5 border-r border-black">Programme</div>
                  <div className="p-1.5 font-normal">{permitData.program}</div>
                </div>
                <div className="grid grid-cols-[130px_1fr] text-xs font-bold">
                  <div className="bg-[#e6f0ff] p-1.5 border-r border-black">Permit Status</div>
                  <div className="p-1.5 font-bold text-blue-900">
                    {permitStatus === 'FULL' ? 'FULL - Allowed to sit for all exams' : 'PARTIAL - Allowed to sit for mid-term exams'}
                  </div>
                </div>
              </div>

              {/* Courses Table */}
              <table className="w-full text-xs border-collapse h-full">
                <thead className="bg-[#00447b] text-white">
                  <tr>
                    <th className="py-1 px-2 border-b border-r border-black font-bold text-center w-32">CODE</th>
                    <th className="py-1 px-2 border-b border-r border-black font-bold text-center">COURSE TITLE</th>
                    <th className="py-1 px-2 border-b border-black font-bold text-center w-16">CR</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {permitData.courses.length > 0 ? (
                    permitData.courses.map((course, idx) => (
                      <tr key={idx}>
                        <td className="py-1 px-2 border-b border-r border-black text-left">{course.courseCode}</td>
                        <td className="py-1 px-2 border-b border-r border-black text-left">{course.courseName}</td>
                        <td className="py-1 px-2 border-b border-black text-center">{course.credits}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center italic text-gray-500 border-b border-black">No courses registered</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="mt-auto">
                  <tr className="bg-[#e6f0ff] font-bold">
                    <td className="py-1 px-2 border-r border-black text-center">Courses</td>
                    <td className="py-1 px-2 border-r border-black text-center">
                      <span className="inline-block w-8">{permitData.courses.length}</span>
                      <span className="inline-block mx-4">Credits</span>
                      <span className="inline-block w-8">{totalCredits}</span>
                    </td>
                    <td className="py-1 px-2 text-center">{totalCredits}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Right Photo & QR Box */}
            <div className="w-48 flex flex-col">
              <div 
                className="flex-1 min-h-[160px] flex items-center justify-center relative cursor-pointer group p-3"
                onClick={() => fileInputRef.current?.click()}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1 group-hover:text-[#00447b]" />
                    <span className="text-[10px] text-gray-400 group-hover:text-[#00447b]">Click to Upload Photo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="border-t border-black p-2 pb-4 flex flex-col items-center bg-white">
                <span className="text-[10px] font-bold mb-1 uppercase tracking-wider">VERIFY</span>
                <QRCodeSVG value={qrContent} size={70} level="M" includeMargin={false} />
                <span className="text-[9px] text-gray-600 mt-1">Scan QR</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border border-black p-1.5 text-[10px] text-gray-800 mb-8">
            Valid only for this exam session. Alteration invalidates this permit. Phones, smart watches, bags, and unauthorized notes are prohibited.
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-12 px-4">
            <div className="w-48">
              <div className="border-b border-black mb-1"></div>
              <p className="text-xs text-black">Student Signature</p>
            </div>
            <div className="text-center flex flex-col items-center">
              {/* Authorized Stamp Placeholder */}
              <div className="relative mb-1">
                 <img src={aucaLogo} alt="Stamp" className="w-12 h-12 opacity-50 grayscale" style={{ mixBlendMode: 'multiply' }} />
                 <div className="absolute inset-0 flex items-center justify-center opacity-70">
                    <span className="text-[8px] font-black uppercase tracking-widest rotate-[-15deg] text-blue-800 whitespace-nowrap border-2 border-blue-800 px-1 rounded-sm">Authorized</span>
                 </div>
              </div>
              <p className="text-[10px] text-black">Authorized Stamp / Signature</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
