import { useState, useEffect } from 'react';
import { 
  FileText, AlertTriangle, CalendarClock, Wallet, 
  CheckCircle2, TrendingUp, Clock, Receipt, 
  ShieldCheck, AlertOctagon, Check
} from 'lucide-react';

export default function ContractDetails() {
  // Get student info from localStorage
  const studentName = localStorage.getItem('demo_studentName') || "Musengimana Fabrice";
  const studentId = localStorage.getItem('demo_studentId') || "25306";
  const totalAmount = 566103;
  
  // Load paymentMade from localStorage
  const getInitialPaymentMade = () => {
    const stored = localStorage.getItem('demo_paymentMade');
    return stored ? Number(stored) : 220000;
  };
  const [paymentMade, setPaymentMade] = useState(getInitialPaymentMade);
  const remainingBalance = totalAmount - paymentMade;
  
  // Load installment plan from localStorage (set when contract is submitted)
  const getInstallmentPlan = () => {
    const stored = localStorage.getItem('demo_installmentPlan');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  };
  
  const [installmentPlan, setInstallmentPlan] = useState(getInstallmentPlan);
  
  // Sync paymentMade and plan with localStorage updates
  useEffect(() => {
    const handlePaymentUpdate = () => {
      const stored = localStorage.getItem('demo_paymentMade');
      if (stored) {
        setPaymentMade(Number(stored));
      }
      const plan = localStorage.getItem('demo_installmentPlan');
      if (plan) {
        setInstallmentPlan(JSON.parse(plan));
      }
    };
    
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    window.addEventListener('storage', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
      window.removeEventListener('storage', handlePaymentUpdate);
    };
  }, []);
  
  // Calculate installments based on payment progress
  const calculateInstallmentStatus = () => {
    if (!installmentPlan || installmentPlan.length === 0) return [];
    
    const storedPayments = localStorage.getItem('demo_installmentPayments');
    const paidAmounts: {[key: number]: number} = storedPayments ? JSON.parse(storedPayments) : {};
    
    return installmentPlan.map((inst: {month: string; date: string; amount: number; status: string}, idx: number) => {
      const paidForThis = Number(paidAmounts[idx]) || 0;
      let status = "Pending";
      if (paidForThis >= inst.amount) {
        status = "Paid";
      }
      
      return { ...inst, status };
    });
  };
  
  const installments = calculateInstallmentStatus();
  
  // Progress Calculation
  const progressPercentage = Math.min(Math.round((paymentMade / totalAmount) * 100), 100);
  
  // Deadline Mock Data
  const deadlineDate = "2026-06-30T00:00:00";
  const nextPaymentAmount = installments.find((inst: {month: string; date: string; amount: number; status: string}) => inst.status !== "Paid")?.amount || 0;
  
  // --- PENALTY LOGIC ---
  const hasPenalty = false; 
  const penaltyAmount = 7305;
  
  // Countdown Timer State
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const deadline = new Date(deadlineDate).getTime();
      const now = new Date().getTime();
      const difference = deadline - now;
      
      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };
    
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Only show countdown if there's remaining balance
  const showCountdown = remainingBalance > 0;
  
  // Check if contract exists AFTER all hooks are called
  const hasContract = installmentPlan !== null;
  
  // If no contract exists, show "promise kept" message
  if (!hasContract) {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-6 animate-fade-in-slow">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
            <Check size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">No Active Contract</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            You have not yet taken a payment contract. After making your initial 50% payment, you can sign a contract to pay the remaining balance in installments.
          </p>
        </div>
      </div>
    );
  }
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "Paid") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
          <CheckCircle2 size={12} /> Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-100 rounded-full">
        <Clock size={12} /> Pending
      </span>
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in-slow pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#00447b] rounded-lg shadow-sm p-4 md:p-5 text-white">
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight flex items-center gap-2">
            <FileText size={24} className="text-blue-300" />
            Contract Details & Progress
          </h1>
          <p className="text-blue-100 font-light mt-1 text-sm">
            Student ID: {studentId} • {studentName}
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
          <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-0.5">Status</p>
          <p className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Active Contract
          </p>
        </div>
      </div>
      
      {/* Countdown Timer - Only shown when there's remaining balance */}
      {showCountdown && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-full shrink-0 mt-0.5">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-800">Payment Deadline Countdown</h3>
                <p className="text-sm text-red-700 mt-1 leading-relaxed">
                  Your next installment of <strong>{nextPaymentAmount.toLocaleString()} RWF</strong> is due on 30/06/2026.
                </p>
              </div>
            </div>
            <div className="text-right bg-white/50 px-4 py-2 rounded-lg">
              <p className="text-xs text-red-600 font-semibold uppercase">Time Remaining</p>
              <div className="font-bold text-red-800 text-lg">
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Progress Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Financial Progress Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              Financial Progress
            </h2>
            
            {/* Thick Progress Bar */}
            <div className="relative h-12 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-400 transition-all duration-1000 ease-out flex items-center justify-end pr-4"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 15 && (
                  <span className="text-white font-bold text-sm shadow-sm">{progressPercentage}%</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-4 text-sm font-medium">
              <div className="text-emerald-600">
                <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Paid</span>
                {paymentMade.toLocaleString()} RWF
              </div>
              <div className="text-right text-gray-900">
                <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Total</span>
                {totalAmount.toLocaleString()} RWF
              </div>
            </div>
          </div>
          
          {/* Installment Schedule Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <CalendarClock className="text-gray-500" size={20} />
              <h2 className="text-md font-bold text-gray-900">Installment Schedule</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold uppercase">Month</th>
                    <th className="px-6 py-3 font-semibold uppercase">Deadline</th>
                    <th className="px-6 py-3 font-semibold uppercase text-right">Amount</th>
                    <th className="px-6 py-3 font-semibold uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {installments.map((inst, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{inst.month}</td>
                      <td className="px-6 py-4 text-gray-600">{inst.date}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-700">{inst.amount.toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={inst.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="space-y-4">
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-600">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Contract</p>
              <p className="text-xl font-bold text-gray-900">{totalAmount.toLocaleString()} RWF</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Paid</p>
              <p className="text-xl font-bold text-gray-900">{paymentMade.toLocaleString()} RWF</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp size={24} className="rotate-180" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remaining Balance</p>
              <p className="text-xl font-bold text-amber-600">{remainingBalance.toLocaleString()} RWF</p>
            </div>
          </div>
          
          {/* Dynamic Penalty Card */}
          {hasPenalty ? (
            <div className="bg-red-50/50 p-5 rounded-xl border border-red-200 shadow-sm flex items-center gap-4 border-l-4 border-l-red-600">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <AlertOctagon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Late Penalty (5%)</p>
                <p className="text-xl font-bold text-red-600">{penaltyAmount.toLocaleString()} RWF</p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Account Standing</p>
                <p className="text-lg font-bold text-emerald-600">Good Standing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}