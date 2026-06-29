import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, AlertTriangle, FileSignature } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { imsApi, studentApi, paymentApi, registrationApi } from '@/lib/api';

interface TermInstallmentConfig {
  installmentNumber: number;
  percentage: number;
  deadlineDate: string;
}

export default function ContractPage() {
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<any>(null);
  const [externalFeesData, setExternalFeesData] = useState<any>(null);
  const [existingContract, setExistingContract] = useState<any>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [configInstallments, setConfigInstallments] = useState<TermInstallmentConfig[]>([]);
  const [penaltyPercentage, setPenaltyPercentage] = useState<number>(5);
  const navigate = useNavigate();

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

        // 1c. Get term config
        try {
          const termRes = await registrationApi.getTerm();
          if (termRes.data?.id) {
             const configRes = await studentApi.getTermConfig(termRes.data.id);
             if (configRes.data) {
                setPenaltyPercentage(Number(configRes.data.penaltyPercentage) * 100);
                if (configRes.data.installments) {
                  setConfigInstallments(configRes.data.installments.sort((a: any, b: any) => a.installmentNumber - b.installmentNumber));
                }
             }
          }
        } catch (err) {
          console.error("Could not fetch term config", err);
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

  const termId: string = externalFeesData?.termId || registration?.termId || '';
  const termParts = termId ? termId.split('/').map(Number) : [0, 0];
  const semester: number = termParts[1] || 0;

  const totalFees = externalFeesData?.totalFee || registration?.totalFee || 0;
  const halfAmount = totalFees / 2;
  const isEligible = paidAmount >= halfAmount;
  const remainingBalance = totalFees - paidAmount;

  // Calculate generated installments based on percentages
  let totalAllocated = 0;
  const generatedInstallments = configInstallments.map((inst, index) => {
    let amountDue;
    if (index === configInstallments.length - 1) {
      amountDue = remainingBalance - totalAllocated;
    } else {
      amountDue = Math.round((remainingBalance * inst.percentage) / 100);
      totalAllocated += amountDue;
    }
    return {
      ...inst,
      amount: amountDue
    };
  });

  const canSubmit = hasAccepted && !isSubmitting && configInstallments.length > 0;

  const handleSubmitContract = async () => {
    if (!canSubmit) return;
    
    if (!isEligible) {
      setSubmitError(`First payment required: You must pay at least 50% (${formatCurrency(halfAmount)}) of your total fees before submitting the contract.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Send an empty array for installments, the backend will auto-generate them
      const payload = {
        studentId,
        termId,
        totalFees,
        installments: [] 
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
        setSubmitError('Network error: Cannot reach the backend server.');
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
        <p className="text-blue-200 text-sm mt-1">Term: {termId} — Semester {semester}</p>
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
          <p className="font-bold">Sem {semester}</p>
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
        <h3 className="font-bold text-gray-900 mb-1">Step 1: Installment Plan Review</h3>
        <p className="text-sm text-gray-500 mb-4">
          The following schedule has been defined by the administration for your remaining balance of <strong>{formatCurrency(remainingBalance)}</strong>.
        </p>

        {configInstallments.length === 0 ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm">The staff has not yet configured the installment schedule for this term. Please contact the registrar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedInstallments.map((inst, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 border flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 shrink-0">
                  #{inst.installmentNumber}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Deadline Date</p>
                  <p className="font-bold text-gray-800">{inst.deadlineDate}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Amount Due ({inst.percentage}%)</p>
                  <p className="font-bold text-gray-800">{formatCurrency(inst.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agreement & Submit */}
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${configInstallments.length === 0 && 'opacity-50 pointer-events-none'}`}>
        <h3 className="font-bold text-gray-900 mb-4">Step 2: Agree & Sign</h3>
        <label className="flex gap-3 cursor-pointer">
          <input type="checkbox" checked={hasAccepted} onChange={(e) => setHasAccepted(e.target.checked)} className="w-5 h-5 mt-0.5 rounded" />
          <span className="text-sm text-gray-700">
            I agree to the payment terms outlined in the official contract and understand that missing any installment deadline will incur a strict {penaltyPercentage}% penalty.
            I commit to paying the remaining balance of <strong>{formatCurrency(remainingBalance)}</strong> as scheduled above.
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
