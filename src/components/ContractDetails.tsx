import { useState, useEffect } from 'react';
import { FileText, CheckCircle2, TrendingUp, CalendarClock, Loader2, Check } from 'lucide-react';
import { studentApi } from '@/lib/api';

export default function ContractDetails() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await studentApi.getDashboard();
        setData(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, []);

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-900" size={32} /></div>;

  const contract = data?.contract;
  const installments = contract?.installments || [];
  
  if (!contract) {
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

  const totalAmount = data?.financials?.totalFees || 0;
  const paymentMade = data?.financials?.amountPaid || 0;
  const progressPercentage = Math.min(Math.round((paymentMade / totalAmount) * 100), 100);

  return (
    <div className="space-y-6 animate-fade-in-slow pb-12">
      <div className="bg-[#00447b] rounded-lg p-5 text-white flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><FileText /> Contract Details</h1>
          <p className="text-blue-200 text-sm mt-1">Status: {contract.status}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6"><TrendingUp className="text-blue-600" /> Financial Progress</h2>
        
        <div className="relative h-8 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all flex items-center justify-end pr-2" style={{ width: `${progressPercentage}%` }}>
            <span className="text-white text-xs font-bold">{progressPercentage}%</span>
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-sm font-medium">
          <span className="text-green-600">Paid: {paymentMade.toLocaleString()} RWF</span>
          <span className="text-gray-600">Total: {totalAmount.toLocaleString()} RWF</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
          <CalendarClock className="text-gray-500" />
          <h2 className="font-bold text-gray-900">Installment Schedule</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold uppercase">Deadline Date</th>
              <th className="px-6 py-3 font-semibold uppercase text-right">Amount</th>
              <th className="px-6 py-3 font-semibold uppercase text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {installments.map((inst: any) => (
              <tr key={inst.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-600">{inst.dueDate}</td>
                <td className="px-6 py-4 text-right font-bold">{inst.amount.toLocaleString()} RWF</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${inst.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inst.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}