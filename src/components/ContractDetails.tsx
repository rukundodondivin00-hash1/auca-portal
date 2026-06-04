import React from 'react';
import { 
  FileText, AlertTriangle, CalendarClock, Wallet, 
  CheckCircle2, TrendingUp, Clock, Receipt, 
  ShieldCheck, AlertOctagon // Added icons for the penalty states
} from 'lucide-react';

export default function ContractDetails() {
  // --- MOCK DATA ---
  const studentName = "Musengimana Fabrice";
  const studentId = "25306";
  const totalAmount = 566103;
  const paymentMade = 420000; 
  const remainingBalance = totalAmount - paymentMade;
  
  // Progress Calculation
  const progressPercentage = Math.min(Math.round((paymentMade / totalAmount) * 100), 100);

  // Deadline Mock Data
  const daysRemaining = 7;
  const nextPaymentAmount = 146103;
  const nextDeadline = "30/11/2025";

  // --- PENALTY LOGIC ---
  // Change this to 'true' to see what the red penalty card looks like!
  const hasPenalty = false; 
  const penaltyAmount = 7305; // Example: 5% of a delayed payment

  // Installment Schedule
  const installments = [
    { month: "October", date: "30/10/2025", amount: 200000, status: "Paid" },
    { month: "November", date: "30/11/2025", amount: 146103, status: "Pending" },
  ];

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

      {/* Deadline Notification Alert */}
      {daysRemaining <= 7 && remainingBalance > 0 && (
        <div className="flex items-start gap-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 shadow-sm">
          <div className="bg-red-100 p-2 rounded-full shrink-0 mt-0.5">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-800">Action Required: Payment Deadline Approaching</h3>
            <p className="text-sm text-red-700 mt-1 leading-relaxed">
              You have <strong>{daysRemaining} days</strong> left to pay your next installment of <strong>{nextPaymentAmount.toLocaleString()} RWF</strong>. 
              Please ensure payment is made by <strong>{nextDeadline}</strong> to avoid a 5% late penalty.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Progress Section (Takes up 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* The "Tall Bar" Progress Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              Financial Progress
            </h2>
            
            {/* Custom Thick Progress Bar */}
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
                  {installments.map((inst, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{inst.month}</td>
                      <td className="px-6 py-4 text-gray-600">{inst.date}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-700">{inst.amount.toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-center">
                        {inst.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                            <CheckCircle2 size={12} /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-100 rounded-full">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panel (Cards) */}
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