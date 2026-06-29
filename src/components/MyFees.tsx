import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, FileText, DollarSign, Loader2, FileSignature } from 'lucide-react';
import { studentApi, imsApi, paymentApi, registrationApi, contractApi } from '@/lib/api';
import InitiatePaymentModal from './InitiatePaymentModal';
import { Link, useNavigate } from 'react-router';

export default function MyFees() {
  const [contract, setContract] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [termConfig, setTermConfig] = useState<any>(null);
  const [prePaidAmount, setPrePaidAmount] = useState(0);
  const [paymentsHistory, setPaymentsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const studentId = localStorage.getItem('student_id') || '25306';

  const fetchData = async () => {
    setLoading(true);
    try {
      const contractRes = await studentApi.getMyContracts();
      const contracts: any[] = contractRes.data?.data || [];
      setContract(contracts.length > 0 ? contracts[0] : null);
    } catch {
      setContract(null);
    }

    try {
      const termRes = await registrationApi.getTerm();
      if (termRes.data && termRes.data.id) {
        const regRes = await registrationApi.getMyRegistration(studentId, termRes.data.id);
        if (regRes.status === 200 && regRes.data) {
          setRegistration(regRes.data);
        }
        try {
          const configRes = await studentApi.getTermConfig(termRes.data.id);
          if (configRes.data) {
            setTermConfig(configRes.data);
          }
        } catch {}
      }
    } catch {
      setRegistration(null);
      setTermConfig(null);
    }

    try {
      const balRes = await paymentApi.getMyBalance(studentId);
      if (balRes.status === 200 && balRes.data) {
        setPrePaidAmount(Number(balRes.data.data?.totalPaid || balRes.data.totalPaid || 0));
        setPaymentsHistory(balRes.data.data?.payments || balRes.data.payments || []);
      }
    } catch {}

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount || 0);

  if (loading) {
    return <div className="p-12 flex justify-center items-center text-blue-900"><Loader2 className="animate-spin" size={32} /></div>;
  }

  const totalAmount = contract?.totalFees || registration?.totalFee || 0;
  
  let paymentMade = 0;
  if (contract) {
    const installmentPaid = contract.installments?.reduce((s: number, i: any) => s + (i.amountPaid || 0), 0) || 0;
    paymentMade = prePaidAmount + installmentPaid;
  } else {
    paymentMade = prePaidAmount;
  }

  const balance = paymentMade - totalAmount;
  const progressPercentage = totalAmount > 0 ? Math.min(Math.round((paymentMade / totalAmount) * 100), 100) : (paymentMade > 0 ? 100 : 0);

  const initialPaymentPercentage = termConfig?.initialPaymentPercentage !== undefined ? Number(termConfig.initialPaymentPercentage) : 100;
  const minRequiredTotal = totalAmount > 0 ? (totalAmount * initialPaymentPercentage / 100) : 0;
  
  let minPaymentAmount = 1000;
  if (!contract && minRequiredTotal > 0) {
    const shortfall = minRequiredTotal - prePaidAmount;
    if (shortfall > 0) {
      minPaymentAmount = shortfall;
    }
  }

  const handlePaymentSuccess = () => {
    fetchData();
    if (!contract && initialPaymentPercentage < 100) {
      navigate('/contract');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-slow">
      <div className="bg-blue-900 text-white p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Fees</h1>
          <p className="text-blue-100 text-sm mt-1">Track your balance, fee obligations, and payment history</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm hover:bg-gray-50 cursor-pointer"
        >
          Pay Now
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
          <span>Payment Progress</span>
          <span className="font-bold text-blue-600">{progressPercentage}%</span>
        </div>
        <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Paid: {formatCurrency(paymentMade)}</span>
          <span>Total: {formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <h2 className="text-2xl font-bold text-blue-600">{formatCurrency(balance)}</h2>
            </div>
            <div className="p-2 bg-blue-100 rounded text-blue-600"><Wallet size={20} /></div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Amount Due</p>
              <h2 className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</h2>
            </div>
            <div className="p-2 bg-green-100 rounded text-green-600"><FileText size={20} /></div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-400 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Paid Amount</p>
              <h2 className="text-2xl font-bold text-orange-500">{formatCurrency(paymentMade)}</h2>
            </div>
            <div className="p-2 bg-orange-100 rounded text-orange-500"><DollarSign size={20} /></div>
          </CardContent>
        </Card>
      </div>

      {!registration && (
        <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-yellow-700">No Registration Found</h2>
          <p className="mt-2 text-yellow-600">You have not registered for any courses yet. Once registered, your total fees will appear above.</p>
          <Link to="/my-registration" className="mt-4 inline-block bg-[#00447b] text-white px-6 py-2 rounded-lg font-bold text-sm">
            Go to Registration
          </Link>
        </div>
      )}

      {paymentsHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
            <DollarSign className="text-blue-600" size={18} />
            <h2 className="font-bold text-gray-800">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 border-b">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Channel</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentsHistory.map((p: any, idx: number) => (
                  <tr key={p.id ?? idx} className="hover:bg-blue-50/30">
                    <td className="px-5 py-3 text-gray-600">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-800">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3 text-gray-600">{p.channel || 'DIRECT'}</td>
                    <td className="px-5 py-3 text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{p.feeType || 'TUITION'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {registration && !contract && balance > 0 && (
        <div className="bg-[#00447b] text-white rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Want to pay in installments?</h3>
            <p className="text-blue-200 text-sm mt-1">
              Pay {initialPaymentPercentage}% upfront and sign a payment contract to cover the remaining balance.
            </p>
          </div>
          <Link
            to="/contract"
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
          >
            <FileSignature size={18} /> Sign Contract
          </Link>
        </div>
      )}

      <InitiatePaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        hasActiveContract={!!contract}
        totalFees={totalAmount}
        minRequiredAmount={minPaymentAmount}
      />
    </div>
  );
}