import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, AlertTriangle, FileSignature } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { imsApi, studentApi, paymentApi, registrationApi } from '@/lib/api';

export default function ContractPage() {
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<any>(null);
  const [externalFeesData, setExternalFeesData] = useState<any>(null);
  const [existingContract, setExistingContract] = useState<any>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const navigate = useNavigate();

  const [installments, setInstallments] = useState<{ amount: string; date: string }[]>([]);
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const studentId = localStorage.getItem('student_id') || '25306';

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        // 1. Get student registration from IMS
        try {
          const termRes = await registrationApi.getTerm();
          if (termRes.data && termRes.data.id) {
            const regRes = await registrationApi.getMyRegistration(studentId, termRes.data.id);
            if (regRes.status === 200 && regRes.data) {
              setRegistration(regRes.data);
            }
          }
        } catch (err) {
          // Fallback if 500 error
        }

        // 1b. Get total fees from Finance API
        try {
          const feesRes = await paymentApi.getStudentFees(studentId);
          if (feesRes.data?.data && feesRes.data.data.length > 0) {
            setExternalFeesData(feesRes.data.data[0]);
          }
        } catch (err) {
          console.error("Could not fetch external fees", err);
        }

        // 2. Check if contract already exists + get paid amount
        try {
          const contractRes = await studentApi.getMyContracts();
          const contracts: any[] = contractRes.data?.data || [];
          
          const balRes = await paymentApi.getMyBalance(studentId);
          const currentPrePaid = Number(balRes.data?.data?.totalPaid || balRes.data?.totalPaid || 0);
          
          if (contracts.length > 0) {
            setExistingContract(contracts[0]);
            const c = contracts[0];
            const installPaid = (c.installments || []).reduce((s: number, i: any) => s + (i.amountPaid || 0), 0);
            setPaidAmount(currentPrePaid + installPaid);
          } else {
            setPaidAmount(currentPrePaid);
          }
        } catch {
          // Contract backend unavailable — proceed without
        }
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [studentId]);

  // Derive semester from termId e.g. "2025/1" → semester=1, year=2025
  const termId: string = externalFeesData?.termId || registration?.termId || '';
  const termParts = termId ? termId.split('/').map(Number) : [0, 0];
  const termYear: number = termParts[0] || new Date().getFullYear();
  const semester: number = termParts[1] || 0;

  // Installment count by semester
  const installmentCount = semester === 1 ? 2 : semester === 2 ? 3 : 1;

  // Suggested deadlines
  const getSuggestedDeadlines = (): string[] => {
    if (semester === 1) {
      return [`${termYear}-10-31`, `${termYear}-11-30`];
    } else if (semester === 2) {
      const y = termYear + 1;
      return [`${y}-02-28`, `${y}-03-31`, `${y}-04-30`];
    } else if (semester === 3) {
      return [`${termYear}-07-31`];
    }
    return [];
  };
  const suggestedDeadlines = getSuggestedDeadlines();

  const totalFees = externalFeesData?.totalFee || registration?.totalFee || 0;
  const halfAmount = totalFees / 2;
  const isEligible = paidAmount >= halfAmount;
  const remainingBalance = totalFees - paidAmount;

  // Initialize installments when data loads
  useEffect(() => {
    if (installmentCount > 0 && installments.length === 0 && totalFees > 0) {
      // Pre-fill even split across installments
      const perInstallment = Math.floor(remainingBalance / installmentCount);
      const lastInstallment = remainingBalance - perInstallment * (installmentCount - 1);
      setInstallments(
        Array.from({ length: installmentCount }, (_, i) => ({
          amount: i === installmentCount - 1 ? String(lastInstallment) : String(perInstallment),
          date: suggestedDeadlines[i] || '',
        }))
      );
    }
  }, [installmentCount, totalFees]);

  const updateInstallment = (index: number, field: 'amount' | 'date', value: string) => {
    setInstallments(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const sumEntered = installments.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
  const isAmountsValid = sumEntered > 0
    && sumEntered === remainingBalance
    && installments.every(inst => inst.date && Number(inst.amount) > 0);

  const canSubmit = isPlanConfirmed && hasAccepted && isAmountsValid && !isSubmitting;

  const handleSubmitContract = async () => {
    if (!canSubmit) return;
    
    if (!isEligible) {
      setSubmitError(`First payment required: You must pay at least 50% (${formatCurrency(halfAmount)}) of your total fees before submitting the contract.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        studentId,
        termId,
        totalFees,
        installments: installments
          .filter(inst => Number(inst.amount) > 0)
          .map((inst, i) => ({
            installmentNumber: i + 1,
            deadlineDate: inst.date,
            amount: Number(inst.amount),
          })),
      };

      const response = await studentApi.createContract(payload);
      if (response.data?.data?.id) {
        navigate(`/contract-details`);
      } else {
        navigate('/contract-details');
      }
    } catch (error: any) {
      if (error?.response) {
        const d = error.response.data;
        const msg = d?.message || d?.error || d?.details || JSON.stringify(d) || 'Failed to submit contract.';
        setSubmitError(`Error (${error.response.status}): ${msg}`);
      } else if (error?.request) {
        setSubmitError('Network error: Cannot reach the contract server. Is it running on port 8083?');
      } else {
        setSubmitError(error?.message || 'Failed to submit contract. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(n || 0);

  if (loading) {
    return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-900" size={32} /></div>;
  }

  // ── Guard: No registration found ──────────────────────────────────────────
  if (!registration || totalFees === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl shadow-sm text-center max-w-md">
          <AlertTriangle size={40} className="text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-700">No Registration Found</h2>
          <p className="mt-2 text-yellow-600">You must register for courses before signing a contract.</p>
          <Link to="/my-registration" className="mt-4 inline-block bg-[#00447b] text-white px-6 py-2 rounded-lg font-bold">
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  // ── Guard: Full fees paid ───────────────────────────────────────────────
  if (paidAmount >= totalFees && totalFees > 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-green-50 border border-green-200 p-8 rounded-xl shadow-sm text-center max-w-md">
          <CheckCircle2 size={40} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700">Congratulations!</h2>
          <p className="mt-2 text-green-700 font-medium">You have fully paid your fees. You don't have to take a contract.</p>
          <div className="mt-4 bg-white border border-green-200 rounded-lg p-4 text-sm text-left space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Total Fees:</span><span className="font-bold">{formatCurrency(totalFees)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Amount Paid:</span><span className="font-bold text-green-600">{formatCurrency(paidAmount)}</span></div>
          </div>
          <Link to="/" className="mt-4 inline-block bg-[#00447b] text-white px-6 py-2 rounded-lg font-bold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Guard: Contract already exists ───────────────────────────────────────
  if (existingContract) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md border">
          <CheckCircle2 size={40} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Contract Already Signed</h2>
          <p className="text-gray-500 mt-2">Status: <strong>{existingContract.status}</strong></p>
          <Link to="/contract-details" className="mt-4 inline-block bg-[#00447b] text-white px-6 py-2 rounded-lg font-bold">
            View Contract Details
          </Link>
        </div>
      </div>
    );
  }

  // ── Guard: Semester 3 — no contract allowed ───────────────────────────────
  if (semester === 3) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl shadow-sm text-center max-w-md">
          <AlertTriangle size={40} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Summer Semester</h2>
          <p className="mt-2 text-gray-600">No payment contract is available for the summer semester (Semester 3).</p>
          <p className="mt-2 text-sm text-gray-500">Full payment is required for summer courses.</p>
        </div>
      </div>
    );
  }

  // ── Guard: Not eligible (less than 50% paid) ─────────────────────────────
  if (!isEligible && paidAmount > 0) {
    const stillNeeded = halfAmount - paidAmount;
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl shadow-sm text-center max-w-md">
          <AlertTriangle size={40} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700">Not Eligible Yet</h2>
          <p className="mt-2 text-red-600">You must pay at least 50% of your total fees to sign a contract.</p>
          <div className="mt-4 bg-white border border-red-200 rounded-lg p-4 text-sm text-left space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Total Fees:</span><span className="font-bold">{formatCurrency(totalFees)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Minimum Required (50%):</span><span className="font-bold text-orange-600">{formatCurrency(halfAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Amount Paid:</span><span className="font-bold text-green-600">{formatCurrency(paidAmount)}</span></div>
            <div className="flex justify-between border-t pt-1 mt-1"><span className="font-semibold text-red-600">Still Need to Pay:</span><span className="font-bold text-red-700">{formatCurrency(stillNeeded)}</span></div>
          </div>
          <Link to="/my-fees" className="mt-4 inline-block bg-[#00447b] text-white px-6 py-2 rounded-lg font-bold">
            Go to My Fees
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Contract Form ─────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-12 animate-fade-in-slow">
      {/* Header */}
      <div className="bg-[#00447b] text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileSignature size={24} /> Sign Payment Contract</h1>
        <p className="text-blue-200 text-sm mt-1">Term: {termId} — Semester {semester} · {installmentCount} installments</p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{submitError}</p>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3 border">
          <p className="text-xs text-gray-500 mb-1">Total Fees</p>
          <p className="font-bold text-gray-900">{formatCurrency(totalFees)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border">
          <p className="text-xs text-gray-500 mb-1">Paid at Signing</p>
          <p className="font-bold text-green-600">{formatCurrency(paidAmount)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border">
          <p className="text-xs text-gray-500 mb-1">Remaining Balance</p>
          <p className="font-bold text-orange-600">{formatCurrency(remainingBalance)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border">
          <p className="text-xs text-gray-500 mb-1">Semester</p>
          <p className="font-bold">{semester === 1 ? 'Sem 1 (2 installments)' : 'Sem 2 (3 installments)'}</p>
        </div>
      </div>

      {/* No previous payment — show instructions */}
      {paidAmount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-amber-800">
            <p className="font-bold">First payment required</p>
            <p className="mt-0.5">You must pay at least 50% ({formatCurrency(halfAmount)}) before signing a contract. 
            The system is allowing you to preview the contract form. <Link to="/my-fees" className="underline font-bold">Pay first →</Link></p>
          </div>
        </div>
      )}

      {/* Installment Plan Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-bold text-gray-900 mb-1">Step 1: Set Installment Plan</h3>
        <p className="text-sm text-gray-500 mb-4">
          Distribute your remaining balance of <strong>{formatCurrency(remainingBalance)}</strong> across {installmentCount} installments.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: installmentCount }, (_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 border space-y-3">
              <p className="font-bold text-gray-800 text-sm">Installment {i + 1}</p>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={installments[i]?.date || ''}
                  onChange={(e) => updateInstallment(i, 'date', e.target.value)}
                  disabled={isPlanConfirmed}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
                {suggestedDeadlines[i] && (
                  <p className="text-xs text-gray-400 mt-1">Suggested: {suggestedDeadlines[i]}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Amount (RWF)</label>
                <input
                  type="number"
                  value={installments[i]?.amount || ''}
                  onChange={(e) => updateInstallment(i, 'amount', e.target.value)}
                  disabled={isPlanConfirmed}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total check */}
        <div className={`mt-4 p-3 rounded-lg text-sm flex justify-between ${sumEntered === remainingBalance ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <span>Installments total:</span>
          <span className="font-bold">
            {new Intl.NumberFormat('en-RW').format(sumEntered)} / {new Intl.NumberFormat('en-RW').format(remainingBalance)} RWF
            {sumEntered === remainingBalance ? ' ✓' : ` (need ${new Intl.NumberFormat('en-RW').format(remainingBalance - sumEntered)} more)`}
          </span>
        </div>

        <button
          onClick={() => setIsPlanConfirmed(!isPlanConfirmed)}
          disabled={!isAmountsValid && !isPlanConfirmed}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold disabled:bg-gray-300 hover:bg-blue-700 transition-colors"
        >
          {isPlanConfirmed ? '✎ Edit Plan' : '✓ Confirm Plan'}
        </button>
      </div>

      {/* Agreement & Submit */}
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${!isPlanConfirmed && 'opacity-50 pointer-events-none'}`}>
        <h3 className="font-bold text-gray-900 mb-4">Step 2: Agree & Sign</h3>
        <label className="flex gap-3 cursor-pointer">
          <input type="checkbox" checked={hasAccepted} onChange={(e) => setHasAccepted(e.target.checked)} className="w-5 h-5 mt-0.5 rounded" />
          <span className="text-sm text-gray-700">
            I agree to the payment terms outlined in the official contract and understand that missing any installment deadline will incur a strict 5% penalty.
            I commit to paying the remaining balance of <strong>{formatCurrency(remainingBalance)}</strong> in {installmentCount} installments as specified above.
          </span>
        </label>
        <button
          onClick={handleSubmitContract}
          disabled={!canSubmit}
          className="mt-6 w-full bg-[#00447b] text-white py-4 rounded-xl font-bold disabled:bg-gray-300 flex justify-center gap-2 hover:bg-blue-900 transition-colors"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <FileSignature size={20} />}
          Submit Contract
        </button>
      </div>
    </div>
  );
}
