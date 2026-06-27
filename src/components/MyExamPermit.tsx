import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Printer, Loader2 } from 'lucide-react';
import { studentApi, paymentApi, registrationApi } from '@/lib/api';

export default function MyExamPermit() {
  const [loading, setLoading] = useState(true);
  const [permitStatus, setPermitStatus] = useState<'FULL' | 'PARTIAL' | 'NONE'>('NONE');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  
  const studentId = localStorage.getItem('student_id') || '25306';

  useEffect(() => {
    const fetchPermitStatus = async () => {
      setLoading(true);
      try {
        // Fetch active term to get the registration and student details
        const termRes = await registrationApi.getTerm();
        let totalFee = 0;
        let studentName = '';
        if (termRes.data && termRes.data.id) {
          try {
            const regRes = await registrationApi.getMyRegistration(studentId, termRes.data.id);
            if (regRes.status === 200 && regRes.data) {
              totalFee = regRes.data.totalFee;
              studentName = regRes.data.studentName;
              setStudentInfo({
                name: studentName,
                id: studentId,
                department: regRes.data.studentDepartment,
                termId: termRes.data.id
              });
            }
          } catch {
            // Ignore if no registration
          }
        }

        // Get total paid amount
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
            
            // Logic for partial permit
            if (paidAmount < totalFee) {
               // Must have paid at least the pre-payment amount AND at least 1 installment?
               // The prompt says: "partial exam permit if he payed only one installment where he will will be allowed to sit for mid term exam only."
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

      } catch (err) {
        console.error("Failed to load permit status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermitStatus();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#00447b] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#00447b] text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">My Exam Permit</h1>
          <p className="text-blue-200">View and print your digital exam permit card</p>
        </div>
        <CreditCard className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4 md:relative md:right-0 md:bottom-0 md:text-white/20" />
      </div>

      {permitStatus === 'NONE' && (
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl shadow-sm text-center flex flex-col items-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-700">No Exam Permit Available</h2>
          <p className="mt-2 text-red-600 max-w-lg mx-auto">
            You do not have a valid exam permit. You must either pay the full semester fees upfront or sign a payment contract and complete at least one installment to receive a partial permit.
          </p>
        </div>
      )}

      {permitStatus !== 'NONE' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
          <div className="border-2 border-slate-800 rounded-xl p-6 relative">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Adventist University</h2>
                <p className="text-slate-600 font-medium">Of Central Africa</p>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold uppercase text-sm ${
                permitStatus === 'FULL' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {permitStatus === 'FULL' ? 'Full Permit' : 'Partial (Midterm Only)'}
              </div>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Student Name</p>
                <p className="font-medium text-lg text-slate-800">{studentInfo?.name || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Student ID</p>
                <p className="font-medium text-lg text-slate-800">{studentInfo?.id || studentId}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Department</p>
                <p className="font-medium text-lg text-slate-800">{studentInfo?.department || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Academic Term</p>
                <p className="font-medium text-lg text-slate-800">{studentInfo?.termId || 'Loading...'}</p>
              </div>
            </div>

            {/* Validity */}
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
                permitStatus === 'FULL' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-orange-50 border border-orange-200 text-orange-800'
              }`}>
              {permitStatus === 'FULL' ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-semibold">Valid for ALL Midterm and Final Exams.</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6" />
                  <span className="font-semibold">Valid for MIDTERM EXAMS ONLY. Remaining balance required for finals.</span>
                </>
              )}
            </div>

            <button className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-medium transition-colors">
              <Printer className="w-5 h-5" />
              Print Permit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
