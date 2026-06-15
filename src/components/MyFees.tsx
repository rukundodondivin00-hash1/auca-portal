import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, FileText, DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { getDemoDashboard, getDemoPaymentMade } from '@/lib/demo-mode';

export default function MyFees() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const response = await studentApi.getDashboard();
        const apiData = response.data?.data;
        setData(apiData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setData(getDemoDashboard());
      } finally {
        setLoading(false);
      }
    };
    fetchFinances();
  }, []);

  if (loading) {
    return <div className="p-12 flex justify-center items-center text-blue-900"><Loader2 className="animate-spin" size={32} /></div>;
  }

  const totalAmount = data?.financial?.totalFees || 0;
  const paymentMade = getDemoPaymentMade();
  const remainingBalance = totalAmount - paymentMade;
  const paymentPercentage = totalAmount > 0 ? Math.round((paymentMade / totalAmount) * 100) : 0;
  const isEligible = paymentPercentage >= 50;

  if (totalAmount === 0) {
    return (
      <div className="p-6 space-y-6 animate-fade-in-slow">
        <div className="bg-blue-900 text-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold">My Fees</h1>
          <p className="text-blue-100 text-sm mt-1">Track your balance, fee obligations, and payment history</p>
        </div>

        <div className="flex items-center justify-center min-h-[200px]">
          <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl shadow-sm text-center">
            <h2 className="text-xl font-bold text-yellow-700">No Registration Found</h2>
            <p className="mt-2 text-yellow-600">You have not registered for courses. Please apply for registration first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-slow">
      <div className="bg-blue-900 text-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold">My Fees</h1>
        <p className="text-blue-100 text-sm mt-1">Track your balance, fee obligations, and payment history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <h2 className="text-2xl font-bold text-blue-600">RWF {remainingBalance.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-blue-100 rounded text-blue-600"><Wallet size={20} /></div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Progress</p>
              <h2 className="text-2xl font-bold text-green-600">{paymentPercentage}%</h2>
              <p className="text-xs text-gray-400 mt-1">{isEligible ? 'Eligible for contract' : 'Pay 50% to take contract'}</p>
            </div>
            <div className="p-2 bg-green-100 rounded text-green-600"><FileText size={20} /></div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-400 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Paid Amount</p>
              <h2 className="text-2xl font-bold text-orange-500">RWF {paymentMade.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-orange-100 rounded text-orange-500"><DollarSign size={20} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
