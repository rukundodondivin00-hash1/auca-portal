import { useState, useEffect } from 'react';
import { AlertCircle, FileText, CheckCircle2, Lock, FileSignature, Loader2, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router'; 
import { studentApi } from '@/lib/api';

export default function ContractPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form states
  const [month1, setMonth1] = useState('');
  const [month2, setMonth2] = useState('');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Fetch real dashboard data
  useEffect(() => {
    const init = async () => {
      try {
        const response = await studentApi.getDashboard();
        setData(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-900" size={32} /></div>;

  // Extract variables
  const studentName = data?.student?.studentName || "Student";
  const studentId = data?.student?.studentId || "N/A";
  const totalAmount = data?.financials?.totalFees || 0;
  const paymentMade = data?.financials?.amountPaid || 0;
  const remainingBalance = data?.financials?.remainingBalance || 0;
  const isEligible = (data?.financials?.paidPercentage || 0) >= 50;
  const hasContract = data?.contract != null;

  // Validation
  const sumEntered = (Number(month1) || 0) + (Number(month2) || 0);
  const isAmountsValid = sumEntered === remainingBalance;
  const canSubmit = isPlanConfirmed && hasAccepted && !isSubmitting;

  // 2. Submit to the real API
  const handleSubmitContract = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setSubmitError(null);
    
    const payload = {
      installments: [
        { amount: Number(month1), deadlineDate: date1 },
        { amount: Number(month2), deadlineDate: date2 }
      ]
    };
    
    try {
      await studentApi.createContract(payload);
      // On success, redirect to contract details
      navigate('/contract-details');
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || "Failed to submit contract to server.");
      setIsSubmitting(false);
    }
  };

  // Views based on backend status
  if (hasContract) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <CheckCircle2 size={40} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Contract Already Signed</h2>
          <Link to="/contract-details" className="mt-4 block text-blue-600 font-bold underline">View Contract Details</Link>
        </div>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl shadow-sm text-center">
          <AlertTriangle size={40} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700">Not Eligible</h2>
          <p className="mt-2 text-red-600">You must pay 50% of your total fees to take a contract.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-6 animate-fade-in-slow">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3">
          <AlertCircle size={18} />
          <p className="text-sm font-medium">{submitError}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h2 className="text-lg font-bold text-gray-900">{studentName}</h2>
            <p className="text-sm text-gray-500">ID: {studentId}</p>
         </div>
         <div className="flex gap-4">
            <div className="bg-gray-50 px-4 py-3 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">Remaining Balance</p>
              <p className="font-bold">{remainingBalance.toLocaleString()} RWF</p>
            </div>
         </div>
      </div>

      {/* Plan Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-bold mb-4">Step 1: Set Installment Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Installment 1 Date</label>
            <input type="date" value={date1} onChange={e => setDate1(e.target.value)} disabled={isPlanConfirmed} className="w-full p-3 border rounded-lg" />
            <label className="text-sm font-semibold mt-2">Amount</label>
            <input type="number" value={month1} onChange={e => setMonth1(e.target.value)} disabled={isPlanConfirmed} className="w-full p-3 border rounded-lg" placeholder="RWF" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Installment 2 Date</label>
            <input type="date" value={date2} onChange={e => setDate2(e.target.value)} disabled={isPlanConfirmed} className="w-full p-3 border rounded-lg" />
            <label className="text-sm font-semibold mt-2">Amount</label>
            <input type="number" value={month2} onChange={e => setMonth2(e.target.value)} disabled={isPlanConfirmed} className="w-full p-3 border rounded-lg" placeholder="RWF" />
          </div>
        </div>

        <button onClick={() => setIsPlanConfirmed(!isPlanConfirmed)} disabled={!isAmountsValid && !isPlanConfirmed} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:bg-gray-300">
          {isPlanConfirmed ? 'Edit Plan' : 'Confirm Plan'}
        </button>
      </div>

      <div className={`bg-white rounded-xl shadow-sm border p-6 ${!isPlanConfirmed && 'opacity-50 pointer-events-none'}`}>
        <label className="flex gap-3">
          <input type="checkbox" checked={hasAccepted} onChange={e => setHasAccepted(e.target.checked)} className="w-5 h-5 mt-1" />
          <span className="text-sm text-gray-700">I agree to the payment terms outlined in the official contract.</span>
        </label>
        <button onClick={handleSubmitContract} disabled={!canSubmit} className="mt-6 w-full bg-[#00447b] text-white py-4 rounded-xl font-bold disabled:bg-gray-300 flex justify-center gap-2">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <FileSignature />}
          Submit Contract
        </button>
      </div>
    </div>
  );
}