import { useState, useEffect } from 'react';
import { AlertCircle, FileText, CheckCircle2, Lock, Unlock, FileSignature, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router'; 
import axios from 'axios';

export default function ContractPage() {
  // Get student info from localStorage or use defaults
  const studentName = localStorage.getItem('demo_studentName') || "Musengimana Fabrice";
  const studentId = localStorage.getItem('demo_studentId') || "25306";
  const totalAmount = 566103;
  
  // Load paymentMade from localStorage or use default
  const getInitialPaymentMade = () => {
    const stored = localStorage.getItem('demo_paymentMade');
    return stored ? Number(stored) : 220000;
  };
  const [paymentMade, setPaymentMade] = useState(getInitialPaymentMade);
  
  // Listen for payment updates from other components via custom event
  useEffect(() => {
    const handlePaymentUpdate = () => {
      const stored = localStorage.getItem('demo_paymentMade');
      if (stored) {
        setPaymentMade(Number(stored));
      }
    };
    
    // Custom event for same-tab updates
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    // Storage event for cross-tab updates  
    window.addEventListener('storage', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
      window.removeEventListener('storage', handlePaymentUpdate);
    };
  }, []);
  const remainingBalance = totalAmount - paymentMade;
  const credits = 116;
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  // Eligibility threshold (50%)
  const requiredPercentage = 0.5;
  const requiredAmount = totalAmount * requiredPercentage;
  const isEligible = paymentMade >= requiredAmount;
  const isFullyPaid = paymentMade >= totalAmount;
  const shortfallAmount = Math.ceil(requiredAmount - paymentMade);
  
  // --- STATE ---
  const [month1, setMonth1] = useState<string>('');
  const [month2, setMonth2] = useState<string>('');
  
  // Dates mapped to exactly what Spring Boot expects (YYYY-MM-DD)
  const deadline1 = "2026-06-30";
  const deadline2 = "2026-07-30";
  
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  
  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasContract, setHasContract] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Load hasContract state from localStorage on mount
  useEffect(() => {
    setHasContract(localStorage.getItem('demo_installmentPlan') !== null);
  }, []);
  
  // --- LOGIC ---
  const sumEntered = (Number(month1) || 0) + (Number(month2) || 0);
  const isAmountsValid = sumEntered === remainingBalance && sumEntered > 0;
  const canSubmit = isPlanConfirmed && hasAccepted && !isSubmitting;
  
  // Calculate current payment percentage
  const paymentPercentage = Math.min(100, Math.round((paymentMade / totalAmount) * 100));
  
  const handleSubmitContract = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    const payload = {
      installments: [
        {
          amount: Number(month1),
          deadlineDate: deadline1
        },
        {
          amount: Number(month2),
          deadlineDate: deadline2
        }
      ]
    };
    
    try {
      const token = localStorage.getItem('jwt_token'); 
      
      // Try real API, fallback to demo mode success on failure
      try {
        await axios.post('http://localhost:8080/api/contracts', payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch {
        // Demo mode: simulate successful submission
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Store the installment plan for ContractDetails to display
      const installmentPlan = [
        { month: "June", date: "30/06/2026", amount: Number(month1), status: "Pending" },
        { month: "July", date: "31/07/2026", amount: Number(month2), status: "Pending" }
      ];
      localStorage.setItem('demo_installmentPlan', JSON.stringify(installmentPlan));
      
      setHasContract(true);
    } catch (error: unknown) {
      console.error("Error submitting contract:", error);
      setSubmitError("Failed to submit contract. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // =========================================================
  // SUCCESS VIEW - Contract already exists
  // =========================================================
  if (hasContract) {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-6 animate-fade-in-slow">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Contract Already Signed</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            You have already submitted your payment contract for <strong>{totalAmount.toLocaleString()} RWF</strong>. 
            You made a promise to honor the payment schedule. Keep your commitment as agreed in your contract.
          </p>
          <div className="pt-6 border-t border-gray-100 mt-4">
            <Link 
              to="/contract-details" 
              className="inline-flex w-full items-center justify-center gap-2 bg-[#00447b] text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
            >
              View Contract Details
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // =========================================================
  // INELIGIBLE VIEW - Student hasn't paid 50%
  // =========================================================
  if (!isEligible) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="max-w-4xl mx-auto space-y-6 pt-6">
          
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Payment Contract Setup
            </h1>
            <p className="text-gray-500 mt-1">Configure your installment plan and submit your official contract.</p>
          </div>
          
          {/* Financial Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center text-xl font-bold">
                MF
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{studentName}</h2>
                <p className="text-sm text-gray-500">ID: {studentId} • IT / {credits} Credits</p>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 flex-1 md:flex-none">
                <p className="text-xs text-gray-500 font-semibold mb-1">Total Fee</p>
                <p className="font-bold text-gray-900">{totalAmount.toLocaleString()} RWF</p>
              </div>
              <div className="bg-red-50 px-4 py-3 rounded-lg border border-red-100 flex-1 md:flex-none">
                <p className="text-xs text-red-600 font-semibold mb-1">Remaining Balance</p>
                <p className="font-bold text-red-700">{remainingBalance.toLocaleString()} RWF</p>
              </div>
              <div className="bg-amber-50 px-4 py-3 rounded-lg border border-amber-100 flex-1 md:flex-none">
                <p className="text-xs text-amber-600 font-semibold mb-1">Payment Progress</p>
                <p className="font-bold text-amber-700">{paymentPercentage}%</p>
                <p className="text-xs text-gray-500">of total required</p>
              </div>
            </div>
          </div>
          
          {/* Ineligibility Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-red-700">Not Eligible for Contract</h3>
            <p className="text-gray-600 max-w-md">
              You must pay at least <strong>50% of total fees ({requiredAmount.toLocaleString()} RWF)</strong> before taking a contract.
            </p>
            <p className="text-sm text-gray-500">
              You need to pay <strong>{shortfallAmount.toLocaleString()} RWF</strong> more to become eligible.
            </p>
            
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm"
            >
              Go to Dashboard to Make Payment
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // =========================================================
  // FULLY PAID VIEW - Student has paid 100% 
  // =========================================================
  if (isFullyPaid) {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-6 animate-fade-in-slow">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Complete</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            You have paid the full amount of <strong>{totalAmount.toLocaleString()} RWF</strong>. 
            No contract is needed since you have already settled all fees.
          </p>
          <Link 
            to="/my-fees" 
            className="inline-flex w-full items-center justify-center gap-2 bg-[#00447b] text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
          >
            View Payment Summary
          </Link>
        </div>
      </div>
    );
  }
  
  // =========================================================
  // STANDARD FORM VIEW
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">{submitError}</p>
          </div>
        )}
        
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Payment Contract Setup
          </h1>
          <p className="text-gray-500 mt-1">Configure your installment plan and submit your official contract.</p>
        </div>
        
        {/* Financial Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center text-xl font-bold">
              MF
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{studentName}</h2>
              <p className="text-sm text-gray-500">ID: {studentId} • IT / {credits} Credits</p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 flex-1 md:flex-none">
              <p className="text-xs text-gray-500 font-semibold mb-1">Total Fee</p>
              <p className="font-bold text-gray-900">{totalAmount.toLocaleString()} RWF</p>
            </div>
            <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-100 flex-1 md:flex-none">
              <p className="text-xs text-green-600 font-semibold mb-1">Payment Made</p>
              <p className="font-bold text-green-700">{paymentMade.toLocaleString()} RWF</p>
            </div>
            <div className="bg-red-50 px-4 py-3 rounded-lg border border-red-100 flex-1 md:flex-none">
              <p className="text-xs text-red-600 font-semibold mb-1">Remaining Balance</p>
              <p className="font-bold text-red-700">{remainingBalance.toLocaleString()} RWF</p>
            </div>
            <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 flex-1 md:flex-none">
              <p className="text-xs text-blue-600 font-semibold mb-1">Payment Progress</p>
              <p className="font-bold text-blue-700">{paymentPercentage}%</p>
              <p className="text-xs text-gray-500">eligible for contract</p>
            </div>
          </div>
        </div>
        
        {/* Installment Plan Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
          <div className={`px-6 py-4 flex justify-between items-center ${isPlanConfirmed ? 'bg-green-700' : 'bg-[#00447b]'}`}>
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                Step 1: Set Installment Plan
                {isPlanConfirmed && <CheckCircle2 size={18} className="text-green-300" />}
              </h3>
              <p className="text-blue-200 text-sm mt-0.5">Divide your remaining balance across the next two months.</p>
            </div>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">June 30, 2026</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={month1}
                    onChange={(e) => setMonth1(e.target.value)}
                    disabled={isPlanConfirmed || isSubmitting}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder={`Suggested: ${(remainingBalance / 2).toLocaleString()}`}
                  />
                  <span className="absolute right-4 top-3 text-gray-400 font-semibold">RWF</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">July 31, 2026</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={month2}
                    onChange={(e) => setMonth2(e.target.value)}
                    disabled={isPlanConfirmed || isSubmitting}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder={`Suggested: ${(remainingBalance / 2).toLocaleString()}`}
                  />
                  <span className="absolute right-4 top-3 text-gray-400 font-semibold">RWF</span>
                </div>
              </div>
            </div>
            
            {/* Quick Fill Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setMonth1(String(Math.floor(remainingBalance / 2))); setMonth2(String(Math.ceil(remainingBalance / 2))); }}
                disabled={isPlanConfirmed || isSubmitting}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50"
              >
                Split Equally
              </button>
              <button
                onClick={() => { setMonth1(String(remainingBalance)); setMonth2('0'); }}
                disabled={isPlanConfirmed || isSubmitting}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50"
              >
                Pay All Now
              </button>
            </div>
            
            {/* Validation Feedback */}
            <div className="mt-4">
              {!isPlanConfirmed && (month1 || month2) && !isAmountsValid && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>Your installments equal <strong>{sumEntered.toLocaleString()} RWF</strong>. They must exactly match the remaining balance of <strong>{remainingBalance.toLocaleString()} RWF</strong>.</span>
                </div>
              )}
            </div>
            
            {/* Step 1: Submit / Edit Button */}
            <div className="mt-6 flex justify-end border-t border-gray-100 pt-6">
              {!isPlanConfirmed ? (
                <button
                  onClick={() => setIsPlanConfirmed(true)}
                  disabled={!isAmountsValid}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm
                    ${isAmountsValid ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <Lock size={16} /> Confirm Installment Plan
                </button>
              ) : (
                <button
                  onClick={() => { setIsPlanConfirmed(false); setHasAccepted(false); }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  <Unlock size={16} /> Edit Plan
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Terms and Submission */}
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${isPlanConfirmed ? 'border-gray-200 opacity-100' : 'border-gray-100 opacity-50 pointer-events-none'}`}>
          
          {/* RESTORED TERMS AND CONDITIONS BLOCK */}
          <div className="p-6 bg-gray-50 border-b border-gray-200 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-900 mb-2">Step 2: Review and Accept Terms</p>
            That I <span className="font-bold text-gray-900">{studentName}</span> hereby acknowledge that as of <span className="font-bold text-gray-900">{currentDate}</span>, I registered with the Adventist University of Central Africa in Information Technology with <span className="font-bold text-gray-900">{credits}</span> Credits and I promise to pay the total amount of the school fees on installment payment at the dates specified above.
            <br /><br />
            That I accept and fully understand that tuition and fees paid upon registration is not refundable on whatever reason and that a 5% penalty per month on the amount due will be charged on delayed payments.
          </div>
          
          <div className="p-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  checked={hasAccepted}
                  onChange={(e) => setHasAccepted(e.target.checked)}
                  disabled={!isPlanConfirmed || isSubmitting}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                I have reviewed the installment plan and agree to the payment terms outlined in the official contract. I understand this serves as my digital signature.
              </span>
            </label>
            
            <button 
              onClick={handleSubmitContract}
              disabled={!canSubmit}
              className={`mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all shadow-sm
                ${canSubmit 
                  ? 'bg-[#00447b] text-white hover:bg-blue-800 cursor-pointer hover:shadow-md' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <FileSignature size={20} /> Submit Payment Contract
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}