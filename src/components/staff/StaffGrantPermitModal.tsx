import React, { useState, useRef } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, AlertTriangle, Loader2, Upload, Search } from 'lucide-react';
import { registrationApi, studentApi, paymentApi, staffApi } from '@/lib/api';
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
  courses: Course[];
}

interface StaffGrantPermitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffGrantPermitModal({ isOpen, onClose }: StaffGrantPermitModalProps) {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [permitData, setPermitData] = useState<PermitData | null>(null);
  const [permitStatus, setPermitStatus] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [grantReason, setGrantReason] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    
    setLoading(true);
    setError(null);
    setPermitData(null);
    
    try {
      // Get current term
      const termRes = await registrationApi.getTerm();
      if (!termRes.data || !termRes.data.id) {
        throw new Error('Current term not found');
      }
      
      const termId = termRes.data.id;
      
      let pData: PermitData = {
        name: 'Unknown Student',
        studentId: searchId,
        gender: 'MALE',
        program: 'Day',
        department: '',
        termId: termId,
        courses: []
      };

      // Try fetching student summary to get the name reliably
      try {
        const sumRes = await staffApi.getStudentSummary(searchId);
        if (sumRes.data && sumRes.data.studentName) {
          pData.name = sumRes.data.studentName;
        }
      } catch (e) {
        // Fallback or ignore
      }

      // Fetch Registration for courses
      try {
        const regRes = await registrationApi.getMyRegistration(searchId, termId);
        if (regRes.status === 200 && regRes.data) {
          const r = regRes.data;
          pData = {
            ...pData,
            name: r.studentName || pData.name,
            program: r.studentProgram || pData.program,
            department: r.studentDepartment || pData.department,
            courses: r.courses || []
          };
        }
      } catch (err: any) {
         if (err.response?.status === 404) {
             throw new Error('Student has no registration for the current term.');
         }
         throw err;
      }
      
      // Attempt to automatically determine status based on payments, but allow staff to override.
      try {
        let initialPaymentPercentage = 100;
        const configRes = await studentApi.getTermConfig(termId);
        if (configRes.data && configRes.data.initialPaymentPercentage) {
          initialPaymentPercentage = Number(configRes.data.initialPaymentPercentage);
        }

        const balRes = await paymentApi.getMyBalance(searchId);
        const currentPrePaid = Number(balRes.data?.data?.totalPaid || balRes.data?.totalPaid || 0);
        
        const contractRes = await staffApi.getContractsByStudent(searchId);
        const contracts: any[] = contractRes.data?.content || [];
        
        let paidAmount = currentPrePaid;
        if (contracts.length > 0) {
          const c = contracts.find((c: any) => c.status === 'ACTIVE') || contracts[0];
          const installPaid = (c.installments || []).reduce((s: number, i: any) => s + (i.amountPaid || 0), 0);
          paidAmount = currentPrePaid + installPaid;
        }
        
        // Fetch registration totalFee to calculate required amounts
        const regRes = await registrationApi.getMyRegistration(searchId, termId);
        const totalFee = regRes.data?.totalFee || 0;
        
        const minRequiredAmount = (totalFee * initialPaymentPercentage) / 100;
        
        if (paidAmount >= totalFee && totalFee > 0) {
          setPermitStatus('FULL');
        } else if (paidAmount >= minRequiredAmount && minRequiredAmount > 0) {
          setPermitStatus('PARTIAL');
        } else {
           // Default to PARTIAL if they haven't met requirements but staff wants to grant anyway
          setPermitStatus('PARTIAL');
        }
      } catch (e) {
        setPermitStatus('PARTIAL');
      }

      setPermitData(pData);
      
      // Load saved photo if exists
      const savedPhoto = localStorage.getItem(`student_photo_${searchId}`);
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      } else {
        setProfilePhoto(null);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePhoto(base64String);
        localStorage.setItem(`student_photo_${permitData?.studentId}`, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGrantAndPrint = async () => {
    if (!permitData || !grantReason.trim()) {
      setError('Please provide a reason before granting the permit.');
      return;
    }
    
    setIsGranting(true);
    setError(null);
    try {
      // 1. Call backend to save the granted contract
      await staffApi.grantPermit({
        studentId: permitData.studentId,
        permitType: permitStatus,
        reason: grantReason.trim()
      });

      // 2. Open print dialog
      document.body.classList.add('print-modal-only');
      window.print();
      // Remove class after printing is initiated
      setTimeout(() => {
        document.body.classList.remove('print-modal-only');
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to grant permit');
    } finally {
      setIsGranting(false);
    }
  };

  const totalCredits = permitData?.courses?.reduce((sum, c) => sum + c.credits, 0) || 0;
  const qrContent = permitData ? JSON.stringify({
    id: permitData.studentId,
    name: permitData.name,
    term: permitData.termId,
    status: permitStatus
  }) : '';
  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`max-w-4xl flex flex-col overflow-hidden print:max-w-none print:h-auto print:p-0 print:border-none print:shadow-none bg-white ${permitData ? 'h-[95vh]' : 'h-auto'}`}>
        
        {/* Modal Header & Controls - Hidden in print */}
        <div className="print:hidden space-y-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Grant Exam Permit</DialogTitle>
          </DialogHeader>

          {/* Row 1: Search + Permit Type + Grant button */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-wrap gap-2 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[140px]">
              <Label htmlFor="searchId" className="mb-1 block text-blue-900 text-xs">Student ID</Label>
              <div className="flex gap-1">
                <Input 
                  id="searchId" 
                  placeholder="e.g. 25306" 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-white h-8 text-sm"
                />
                <Button onClick={handleSearch} disabled={loading || !searchId} size="sm" className="bg-blue-900 hover:bg-blue-800 h-8 px-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Permit Type */}
            {permitData && (
              <div className="min-w-[160px]">
                <Label className="mb-1 block text-blue-900 text-xs">Permit Type</Label>
                <Select value={permitStatus} onValueChange={(val: any) => setPermitStatus(val)}>
                  <SelectTrigger className="bg-white h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL">FULL – All Exams</SelectItem>
                    <SelectItem value="PARTIAL">PARTIAL – Mid-term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Grant Button */}
            {permitData && (
              <Button onClick={handleGrantAndPrint} disabled={isGranting} size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs px-3 whitespace-nowrap">
                {isGranting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Printer className="w-3 h-3 mr-1" />}
                Grant &amp; Print
              </Button>
            )}
          </div>

          {/* Row 2: Reason (only after student found) */}
          {permitData && (
            <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
              <Label htmlFor="grantReason" className="mb-1 block text-blue-900 text-xs">Reason for Granting (Required)</Label>
              <textarea 
                id="grantReason" 
                value={grantReason}
                onChange={(e) => setGrantReason(e.target.value)}
                placeholder="e.g. Cleared by Vice Chancellor, Missing bank slip, etc." 
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] resize-none"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Permit Preview / Print View */}
        {permitData && (
          <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <div className="border p-6 rounded-lg bg-white shadow-sm print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:block" id="printable-permit" style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
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
                    <div className="bg-[#e6f0ff] p-1.5 border-r border-black print:bg-[#e6f0ff] print:!bg-[#e6f0ff]">Reg No</div>
                    <div className="p-1.5 font-normal">{permitData.studentId}</div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                    <div className="bg-[#e6f0ff] p-1.5 border-r border-black print:bg-[#e6f0ff] print:!bg-[#e6f0ff]">Name</div>
                    <div className="p-1.5 font-normal uppercase">{permitData.name}</div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                    <div className="bg-[#e6f0ff] p-1.5 border-r border-black print:bg-[#e6f0ff] print:!bg-[#e6f0ff]">Faculty</div>
                    <div className="p-1.5 font-normal">Information Technology</div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                    <div className="bg-[#e6f0ff] p-1.5 border-r border-black print:bg-[#e6f0ff] print:!bg-[#e6f0ff]">Department</div>
                    <div className="p-1.5 font-normal">{permitData.department || 'Networks and Com. Systems'}</div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                    <div className="bg-[#e6f0ff] p-1.5 border-r border-black print:bg-[#e6f0ff] print:!bg-[#e6f0ff]">Programme</div>
                    <div className="p-1.5 font-normal">{permitData.program}</div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] border-b border-black text-xs font-bold">
                    <div className="bg-[#e6f0ff] p-1.5 border-r border-black print:bg-[#e6f0ff] print:!bg-[#e6f0ff]">Permit Status</div>
                    <div className="p-1.5 font-bold text-blue-900">
                      {permitStatus === 'FULL' ? 'FULL - Allowed to sit for all exams' : 'PARTIAL - Allowed to sit for mid-term exams'}
                    </div>
                  </div>
                  {grantReason && (
                    <div className="grid grid-cols-[130px_1fr] text-xs font-bold">
                      <div className="bg-[#fff3cd] p-1.5 border-r border-black">Granted By / Reason</div>
                      <div className="p-1.5 font-normal italic text-amber-800">{grantReason}</div>
                    </div>
                  )}
                </div>

                {/* Courses Table */}
                <table className="w-full text-xs border-collapse h-full">
                  <thead className="bg-[#00447b] text-white print:bg-[#00447b] print:text-white print:!bg-[#00447b]">
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
                    <tr className="bg-[#e6f0ff] font-bold print:bg-[#e6f0ff] print:!bg-[#e6f0ff]">
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
                  className="flex-1 min-h-[160px] flex items-center justify-center relative cursor-pointer group p-3 print:border-b-0 print:pb-0"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to change photo"
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 print:hidden">
                      <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1 group-hover:text-[#00447b]" />
                      <span className="text-[10px] text-gray-400 group-hover:text-[#00447b]">Click to Upload Photo</span>
                    </div>
                  )}
                  {/* Provide a blank box in print if no photo */}
                  {!profilePhoto && (
                     <div className="hidden print:flex w-full h-full border-2 border-dashed border-gray-300 items-center justify-center">
                        <span className="text-[10px] text-gray-400">Photo Here</span>
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
                
                <div className="border-t border-black p-4 flex flex-col items-center justify-center bg-white min-h-[180px]">
                  <QRCodeSVG 
                    value={qrContent} 
                    size={120}
                    level="Q"
                    includeMargin={false}
                  />
                  <div className="text-[9px] font-mono mt-2 text-center break-all w-full leading-tight text-gray-600">
                    {permitData.studentId}-{permitData.termId.replace('/','')}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Warning */}
            <div className="text-center text-[10px] italic text-red-600 font-bold tracking-wide mt-2">
              NOTE: Any alteration to this permit makes it invalid and may lead to disciplinary action.
            </div>

          </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
