import { useState, useEffect } from 'react';
import { FileText, CheckCircle2, TrendingUp, CalendarClock, Loader2, Check, AlertCircle, Printer } from 'lucide-react';
import aucaLogo from '@/images/AUCA-logo.png';
import { QRCodeSVG } from 'qrcode.react';
import { studentApi, paymentApi } from '@/lib/api';

export default function ContractDetails() {
  const [data, setData] = useState<any>(null);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const studentId = localStorage.getItem('student_id') || '25306';
      
      const [contractRes, balRes, penaltiesRes] = await Promise.all([
        studentApi.getMyContracts().catch(() => ({ data: { data: [] } })),
        paymentApi.getMyBalance(studentId).catch(() => ({ data: { data: { totalPaid: 0 } } })),
        studentApi.getMyPenalties().catch(() => ({ data: { data: [] } }))
      ]);

      const contracts: any[] = contractRes.data?.data || [];
      const contract = contracts.length > 0 ? contracts[0] : null;
      const prePaid = Number(balRes.data?.data?.totalPaid || balRes.data?.totalPaid || 0);
      
      setPenalties(penaltiesRes.data?.data || []);

      setData(contract ? { contract, prePaid } : null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-900" size={32} /></div>;

  const contract: any = data?.contract || data;
  const rawInstallments = contract?.installments || [];

  if (!contract || !contract.id) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} /></div>
          <h2 className="text-2xl font-bold">No Active Contract</h2>
          <p className="text-gray-500 mt-2">You have not signed a contract for this term yet.</p>
        </div>
      </div>
    );
  }

  const totalAmount = contract.totalFees || 0;
  const prePaidAmount = data?.prePaid || 0;
  const installmentPaid = rawInstallments.reduce((s: number, i: any) => s + (i.amountPaid || 0), 0) || 0;
  const paymentMade = prePaidAmount + installmentPaid;
  const progressPercentage = totalAmount > 0 ? Math.min(Math.round((paymentMade / totalAmount) * 100), 100) : 0;
  const balance = totalAmount - paymentMade;

  // Dynamically calculate installment status and amount paid
  const totalInstallmentDue = rawInstallments.reduce((s: number, i: any) => s + (Number(i.amountDue) || 0), 0);
  const upfrontRequired = Math.max(0, totalAmount - totalInstallmentDue);
  
  let remainingForInstallments = Math.max(0, paymentMade - upfrontRequired);

  const installments = rawInstallments.map((inst: any) => {
    const due = Number(inst.amountDue || 0);
    let paid = 0;
    let status = inst.status;

    if (remainingForInstallments >= due && due > 0) {
      paid = due;
      remainingForInstallments -= due;
      status = 'PAID';
    } else if (remainingForInstallments > 0) {
      paid = remainingForInstallments;
      remainingForInstallments = 0;
      status = 'PARTIALLY_PAID';
    } else {
      paid = 0;
      if (status !== 'OVERDUE') {
        status = 'PENDING';
      }
    }

    return {
      ...inst,
      amountPaid: paid,
      status: status
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  // Determine permit status for printing
  let permitStatus: 'FULL' | 'PARTIAL' | 'PENDING' = 'PENDING';
  if (balance <= 0) {
    permitStatus = 'FULL';
  } else if (installments.some((i: any) => i.status === 'PAID' || i.status === 'PARTIALLY_PAID')) {
    permitStatus = 'PARTIAL';
  }

  // Generate QR code content for printing
  const qrContent = contract ? JSON.stringify({
    id: contract.id,
    student: contract.studentId,
    term: contract.termId,
    status: permitStatus
  }) : '';

  return (
    <>
      {/* SCREEN UI: Hidden when printing */}
      <div className="space-y-6 animate-fade-in-slow pb-12 print:hidden">
        
        {/* Actions Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-slate-800 hidden sm:block">Contract Overview</h1>
          <button 
            onClick={() => window.print()}
            className="bg-[#00447b] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors flex items-center gap-2 ml-auto"
          >
            <Printer size={18} />
            Download Contract
          </button>
        </div>

        <div className="bg-[#00447b] rounded-lg p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><FileText /> Contract Details</h1>
            <p className="text-blue-200 text-sm mt-1">Status: {contract.status}</p>
          </div>
          <div className="text-right text-sm text-blue-100">
            <p>Student: {contract.studentName}</p>
            <p>ID: {contract.studentId}</p>
            <p className="text-blue-200">Term: {contract.termId} · {contract.semester}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6"><TrendingUp className="text-blue-600" /> Financial Progress</h2>

          <div className="relative h-8 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all flex items-center justify-end pr-2" style={{ width: `${progressPercentage}%` }}>
              <span className="text-white text-xs font-bold">{progressPercentage}%</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-between mt-3 text-sm font-medium gap-2">
            <span className="text-green-600">Paid: {paymentMade.toLocaleString()} RWF</span>
            <span className="text-gray-600">Remaining: {(totalAmount - paymentMade).toLocaleString()} RWF</span>
            <span className="text-gray-900 font-bold">Total: {totalAmount.toLocaleString()} RWF</span>
          </div>
        </div>

        {contract.status === 'COMPLETED' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-500 text-2xl">🎉</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-green-800">
                  Congratulations, {contract.studentName}!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You have successfully paid off your entire contract for this semester.
                  Your account is fully cleared!
                </p>
                {balance > 0 && (
                  <p className="text-sm text-green-700 font-semibold mt-2">
                    Note: You have an overpayment credit of {formatCurrency(balance)}.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
            <CalendarClock className="text-gray-500" />
            <h2 className="font-bold text-gray-900">Installment Schedule</h2>
          </div>
          {installments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No installments found for this contract.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-semibold uppercase">#</th>
                    <th className="px-6 py-3 font-semibold uppercase">Deadline Date</th>
                    <th className="px-6 py-3 font-semibold uppercase text-right">Amount Due</th>
                    <th className="px-6 py-3 font-semibold uppercase text-right">Amount Paid</th>
                    <th className="px-6 py-3 font-semibold uppercase text-right text-red-600">Penalty</th>
                    <th className="px-6 py-3 font-semibold uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {installments.map((inst: any) => (
                    <tr key={inst.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">{inst.installmentNumber}</td>
                      <td className="px-6 py-4 text-gray-600">{inst.deadlineDate}</td>
                      <td className="px-6 py-4 text-right font-bold">{Number(inst.amountDue || 0).toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-right">{Number(inst.amountPaid || 0).toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">
                        {Number(inst.penaltyAmount || 0) > 0 ? `+${Number(inst.penaltyAmount).toLocaleString()} RWF` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${inst.status === 'PAID' ? 'bg-green-100 text-green-700' : inst.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : inst.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' : 'bg-amber-100 text-amber-700'}`}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {penalties.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-6">
            <div className="px-6 py-4 border-b bg-red-50 flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              <h2 className="font-bold text-red-900">Penalty History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-semibold uppercase">Date Applied</th>
                    <th className="px-6 py-3 font-semibold uppercase text-right">Original Amount</th>
                    <th className="px-6 py-3 font-semibold uppercase text-right text-red-600">Penalty Amount</th>
                    <th className="px-6 py-3 font-semibold uppercase text-right">New Balance</th>
                    <th className="px-6 py-3 font-semibold uppercase">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {penalties.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(p.previousAmount)}</td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">+{formatCurrency(p.penaltyAmount)}</td>
                      <td className="px-6 py-4 text-right font-bold">{formatCurrency(p.newAmount)}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{p.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* PRINT UI: Hidden on screen, visible when printing */}
      <div className="hidden print:block w-full max-w-5xl mx-auto space-y-6 pb-20 print:space-y-0 print:pb-0">
        <div className="bg-white mx-auto print:shadow-none print:border-none" style={{ width: '100%', maxWidth: '900px' }}>
          
          {/* Header Section */}
          <div className="flex justify-between items-center border-b-4 border-[#00447b] pb-6 mb-6">
            <div className="flex items-center gap-6">
              <img src={aucaLogo} alt="AUCA Logo" className="w-24 h-24 object-contain" />
              <div>
                <h1 className="text-2xl font-black text-[#00447b] uppercase tracking-wide">Adventist University of Central Africa</h1>
                <h2 className="text-lg font-bold text-slate-700 uppercase mt-1">Finance Department</h2>
                <h3 className="text-md font-semibold text-slate-600 mt-1">Student Financial Contract</h3>
                <p className="text-xs text-slate-500 mt-2 font-medium">PRINT DATE: {new Date().toLocaleString().toUpperCase()}</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <QRCodeSVG value={qrContent} size={80} level="M" includeMargin={false} />
            </div>
          </div>

          {/* Blue Title Bar */}
          <div className="bg-[#00447b] text-white text-center py-2 font-bold uppercase tracking-widest text-lg mb-8" style={{ backgroundColor: '#00447b', color: 'white', WebkitPrintColorAdjust: 'exact' }}>
            Financial Contract
          </div>

          {/* Student Info Area */}
          <div className="grid grid-cols-12 gap-x-4 gap-y-3 text-sm mb-8 border-b-2 border-dashed border-gray-300 pb-8">
            <div className="col-span-3 font-bold text-slate-700">FULL NAME:</div>
            <div className="col-span-9 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1">{contract.studentName}</div>

            <div className="col-span-3 font-bold text-slate-700">STUDENT NO:</div>
            <div className="col-span-3 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1">{contract.studentId}</div>
            
            <div className="col-span-2 font-bold text-slate-700 text-right">TERM:</div>
            <div className="col-span-4 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1">{contract.termId} · {contract.semester}</div>

            <div className="col-span-3 font-bold text-slate-700 mt-2">TOTAL FEES:</div>
            <div className="col-span-3 font-semibold text-slate-900 border-b border-dotted border-gray-400 pb-1 mt-2">{formatCurrency(totalAmount)}</div>

            <div className="col-span-2 font-bold text-slate-700 text-right mt-2">FEES BAL DUE:</div>
            <div className="col-span-4 font-bold text-red-600 border-b border-dotted border-gray-400 pb-1 mt-2">{formatCurrency(balance)}</div>

            <div className="col-span-3 font-bold text-slate-700 mt-2">CONTRACT TYPE:</div>
            <div className="col-span-9 border-b border-dotted border-gray-400 pb-1 mt-2 flex items-center">
              <span className={`font-black text-sm uppercase px-2 py-0.5 rounded ${permitStatus === 'FULL' ? 'bg-green-100 text-green-800' : permitStatus === 'PARTIAL' ? 'bg-orange-100 text-orange-800' : 'bg-gray-200 text-gray-800'}`} style={{ WebkitPrintColorAdjust: 'exact' }}>
                {permitStatus === 'FULL' ? 'FULL CONTRACT (CLEARED FOR FINAL EXAMS)' : permitStatus === 'PARTIAL' ? 'PARTIAL CONTRACT (MIDTERM EXAMS ONLY)' : 'PENDING CONTRACT'}
              </span>
            </div>
          </div>

          {/* Installments Title */}
          <div className="text-center font-bold text-[#00447b] tracking-wider mb-4">
            INSTALLMENT SCHEDULE
          </div>

          {/* Installments Table */}
          <table className="w-full text-sm border border-slate-300 mb-8">
            <thead className="bg-slate-100 border-b-2 border-slate-300" style={{ backgroundColor: '#f1f5f9', WebkitPrintColorAdjust: 'exact' }}>
              <tr>
                <th className="py-2 px-3 text-center font-bold text-slate-800 border-r border-slate-300 w-12">#</th>
                <th className="py-2 px-3 text-left font-bold text-slate-800 border-r border-slate-300">DEADLINE</th>
                <th className="py-2 px-3 text-right font-bold text-slate-800 border-r border-slate-300">AMOUNT DUE</th>
                <th className="py-2 px-3 text-right font-bold text-slate-800 border-r border-slate-300">AMOUNT PAID</th>
                <th className="py-2 px-3 text-right font-bold text-slate-800 border-r border-slate-300">PENALTY</th>
                <th className="py-2 px-3 text-center font-bold text-slate-800">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {installments.length > 0 ? (
                installments.map((inst: any) => (
                  <tr key={inst.id} className="border-b border-slate-200">
                    <td className="py-2 px-3 border-r border-slate-300 text-center font-bold text-slate-700">{inst.installmentNumber}</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-medium text-slate-900">{inst.deadlineDate}</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-right font-bold">{Number(inst.amountDue || 0).toLocaleString()} RWF</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-right">{Number(inst.amountPaid || 0).toLocaleString()} RWF</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-right text-red-600 font-bold">
                      {Number(inst.penaltyAmount || 0) > 0 ? `+${Number(inst.penaltyAmount).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`font-black text-[11px] uppercase ${inst.status === 'PAID' ? 'text-green-700' : inst.status === 'OVERDUE' ? 'text-red-700' : inst.status === 'PARTIALLY_PAID' ? 'text-orange-600' : 'text-slate-600'}`}>
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 italic">No installments found for this contract.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer Info */}
          <p className="text-xs text-justify text-slate-700 leading-tight mb-16 italic">
            <span className="font-bold underline">NOTES:</span> This contract certifies the agreed payment plan for the stated term. This document is official and must be produced to the finance office upon request. You are bound to fulfill the installment schedule above. Failure to meet deadlines may result in penalties or revocation of exam permits. <strong>For Partial Contracts, the permit is valid for midterm examinations only. Full clearance is required for final exams.</strong>
          </p>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-12 pb-4">
            <div className="font-bold text-sm text-slate-800 uppercase">
              SIGNED BY: <span className="font-normal ml-2">{contract.studentName}</span>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-800 mb-1"></div>
              <p className="font-bold text-sm text-slate-800 uppercase">FINANCE OFFICER</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}