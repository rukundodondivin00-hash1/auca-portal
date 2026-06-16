import { useState, useEffect } from 'react';
import { AlertCircle, FileText, CheckCircle2, Loader2, AlertTriangle, FileSignature } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { studentApi } from '@/lib/api';
import { getDemoDashboard, getDemoPaymentMade, createDemoContract, isDemoMode } from '@/lib/demo-mode';

export default function ContractPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [installments, setInstallments] = useState<{ amount: string; date: string }[]>([]);
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const termId: string = data?.financial?.activeTerm || data?.contract?.termId || '';
  const termParts = termId ? termId.split('/').map(Number) : [0, 0];
  const termYear: number = termParts[0] || 0;
  const semester: number = termParts[1] || 0;
  const installmentCount = semester === 1 ? 2 : semester === 2 ? 3 : 2;

  const getSuggestedDeadlines = (): string[] => {
    if (semester === 1) {
      const y = termYear || new Date().getFullYear();
      return [`${y}-10-31`, `${y}-11-30`];
    } else {
      const y = (termYear || new Date().getFullYear()) + 1;
      return [`${y}-02-28`, `${y}-03-31`, `${y}-04-30`];
    }
  };

  const suggestedDeadlines = getSuggestedDeadlines();

  const updateInstallment = (index: number, field: 'amount' | 'date', value: string) => {
    setInstallments(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  useEffect(() => {
    if (termYear && semester && installments.length === 0) {
      setInstallments(
        Array.from({ length: installmentCount }, (_, i) => ({
          amount: '',
          date: suggestedDeadlines[i] || '',
        }))
      );
    }
  }, [termYear, semester, installmentCount]);

  useEffect(() => {
    // Demo student - skip API call entirely
    if (isDemoMode()) {
      setData(getDemoDashboard());
      setLoading(false);
      return;
    }
    
    const init = async () => {
      try {
        const response = await studentApi.getDashboard();
        const apiData = response.data.data;
        setData(apiData);
      } catch (error) {
        console.error(error);
        setData(getDemoDashboard());
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-900" size={32} /></div>;

  const studentName = data?.student?.studentName || getDemoDashboard().student.studentName;
  const studentId = data?.student?.studentId || getDemoDashboard().student.studentId;
  const totalAmount = data?.financial?.totalFees || getDemoDashboard().financial.totalFees;
  const paymentMade = getDemoPaymentMade();
  const remainingBalance = totalAmount - paymentMade;
  const isEligible = paymentMade >= totalAmount * 0.5;
  const hasContract = !!localStorage.getItem('auca_demo_contract');

  const sumEntered = installments.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
  const isAmountsValid = sumEntered > 0 && sumEntered === remainingBalance && installments.every(inst => inst.date && Number(inst.amount) > 0);

  const canSubmit = isPlanConfirmed && hasAccepted && isAmountsValid && !isSubmitting;

  const handleSubmitContract = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const contractData = {
        studentId,
        termId,
        academicYear: String(termYear),
        semester: semester === 1 ? '1' : '2',
        totalFees: totalAmount,
        balanceAtSigning: remainingBalance,
        amountPaidAtSigning: paymentMade,
        remainingAtSigning: remainingBalance,
        status: 'ACTIVE',
        agreed: true,
        agreedDate: new Date().toISOString().split('T')[0],
        installments: installments
          .filter(inst => Number(inst.amount) > 0)
          .map((inst, i) => ({
            installmentNumber: i + 1,
            deadlineDate: inst.date,
            amountDue: Number(inst.amount),
            amountPaid: 0,
            status: 'PENDING',
            penaltyAmount: 0,
          })),
      };

      // Demo student - save to localStorage without API call
      if (isDemoMode()) {
        createDemoContract(installments);
        navigate('/contract-details');
        return;
      }

      try {
        const response = await studentApi.createContract(contractData);
        if (response.data?.data?.id) {
          navigate(`/contract-details?id=${response.data.data.id}`);
        } else {
          alert('Contract submitted successfully!');
          navigate('/contract-details');
        }
      } catch (apiError) {
        console.error('API failed:', apiError);
        setSubmitError('Failed to submit contract. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (totalAmount === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl shadow-sm text-center">
          <AlertTriangle size={40} className="text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-700">No Registration Found</h2>
          <p className="mt-2 text-yellow-600">You have not registered for courses yet. Please apply for registration first.</p>
        </div>
      </div>
    );
  }

  if (paymentMade >= totalAmount) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-green-50 border border-green-200 p-8 rounded-xl shadow-sm text-center">
          <CheckCircle2 size={40} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700">Congratulations! You're Paid in Full</h2>
          <p className="mt-2 text-green-600">You have already paid your full tuition of {totalAmount.toLocaleString()} RWF.</p>
          <p className="mt-2 text-sm text-gray-600">No payment contract is needed.</p>
          <Link to="/dashboard" className="mt-4 inline-block bg-[#00447b] text-white px-6 py-2 rounded-lg font-bold">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

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
          <p className="mt-2 text-sm text-gray-600">Total: {totalAmount.toLocaleString()} RWF · Paid: {paymentMade.toLocaleString()} RWF ({((paymentMade / totalAmount) * 100).toFixed(1)}%)</p>
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
          <div className="flex flex-wrap gap-3">
             <div className="bg-gray-50 px-4 py-3 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">Remaining Balance</p>
              <p className="font-bold">{remainingBalance.toLocaleString()} RWF</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">Paid Percentage</p>
              <p className="font-bold text-green-600">{((paymentMade / totalAmount) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">Semester</p>
              <p className="font-bold">{semester === 1 ? 'Semester 1 (Oct-Nov)' : 'Semester 2 (Feb-Mar-Apr)'}</p>
            </div>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-bold mb-4">Step 1: Set Installment Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: installmentCount }, (_, i) => (
            <div key={i} className="space-y-2">
              <label className="text-sm font-semibold">Installment {i + 1} Date</label>
              <input
                type="date"
                value={installments[i]?.date || ''}
                onChange={(e) => updateInstallment(i, 'date', e.target.value)}
                disabled={isPlanConfirmed}
                className="w-full p-3 border rounded-lg"
              />
              <label className="text-sm font-semibold mt-2">Amount (RWF)</label>
              <input
                type="number"
                value={installments[i]?.amount || ''}
                onChange={(e) => updateInstallment(i, 'amount', e.target.value)}
                disabled={isPlanConfirmed}
                className="w-full p-3 border rounded-lg"
                placeholder="0"
              />
              {suggestedDeadlines[i] && (
                <p className="text-xs text-gray-400">Suggested: {suggestedDeadlines[i]}</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsPlanConfirmed(!isPlanConfirmed)}
          disabled={!isAmountsValid && !isPlanConfirmed}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:bg-gray-300"
        >
          {isPlanConfirmed ? 'Edit Plan' : 'Confirm Plan'}
        </button>
      </div>

      <div className={`bg-white rounded-xl shadow-sm border p-6 ${!isPlanConfirmed && 'opacity-50 pointer-events-none'}`}>
        <label className="flex gap-3">
          <input type="checkbox" checked={hasAccepted} onChange={(e) => setHasAccepted(e.target.checked)} className="w-5 h-5 mt-1" />
          <span className="text-sm text-gray-700">I agree to the payment terms outlined in the official contract.</span>
        </label>
        <button onClick={handleSubmitContract} disabled={!canSubmit} className="mt-6 w-full bg-[#00447b] text-white py-4 rounded-xl font-bold disabled:bg-gray-300 flex justify-center gap-2">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <FileSignature />}
          Submit Contract
        </button>
        {!isAmountsValid && remainingBalance > 0 && (
          <p className="text-sm text-red-600 mt-2">Total must equal remaining balance: {remainingBalance.toLocaleString()} RWF (current: {sumEntered.toLocaleString()} RWF)</p>
        )}
      </div>
    </div>
  );
}