import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wallet, FileText, DollarSign } from 'lucide-react';

export default function MyFees() {
  const totalAmount = 566103;
  
  // Load paymentMade from localStorage
  const getInitialPaymentMade = () => {
    const stored = localStorage.getItem('demo_paymentMade');
    return stored ? Number(stored) : 220000;
  };
  const [paymentMade, setPaymentMade] = useState(getInitialPaymentMade);
  const remainingBalance = totalAmount - paymentMade;
  
  // Sync to localStorage when paymentMade changes (from other components)
  useEffect(() => {
    const handlePaymentUpdate = () => {
      const stored = localStorage.getItem('demo_paymentMade');
      if (stored) {
        setPaymentMade(Number(stored));
      }
    };
    
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    window.addEventListener('storage', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
      window.removeEventListener('storage', handlePaymentUpdate);
    };
  }, []);
  
  const paymentPercentage = Math.min(100, Math.round((paymentMade / totalAmount) * 100));
  const requiredAmount = totalAmount * 0.5;
  const isEligible = paymentMade >= requiredAmount;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-blue-900 text-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold">My Fees</h1>
        <p className="text-blue-100 text-sm mt-1">Track your balance, fee obligations, and payment history</p>
      </div>

      {/* Info Notice */}
      <p className="text-sm text-gray-500">
        This section uses finance payment endpoints directly to show your live ledger: balance, fee obligations per term, and payment history.
      </p>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Balance Card */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <h2 className="text-2xl font-bold text-blue-600">RWF {remainingBalance.toLocaleString()}</h2>
              <p className="text-xs text-gray-400 mt-1">Amount remaining to pay</p>
            </div>
            <div className="p-2 bg-blue-100 rounded text-blue-600">
              <Wallet size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Amount Due Card */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Progress</p>
              <h2 className="text-2xl font-bold text-green-600">{paymentPercentage}%</h2>
              <p className="text-xs text-gray-400 mt-1">{isEligible ? 'Eligible for contract' : 'Pay 50% to take contract'}</p>
            </div>
            <div className="p-2 bg-green-100 rounded text-green-600">
              <FileText size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Credit Balance Card */}
        <Card className="border-l-4 border-l-orange-400 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Paid Amount</p>
              <h2 className="text-2xl font-bold text-orange-500">RWF {paymentMade.toLocaleString()}</h2>
              <p className="text-xs text-gray-400 mt-1">of {totalAmount.toLocaleString()} RWF total</p>
            </div>
            <div className="p-2 bg-orange-100 rounded text-orange-500">
              <DollarSign size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Pay Section - Removed payment button, now just display info */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Quick Payment</h3>
          {!isEligible && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Pay {(requiredAmount - paymentMade).toLocaleString()} RWF to become eligible</span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          To make payments, use the "Pay Now" button on the dashboard. Your payment progress will update automatically.
        </p>
      </div>

      {/* Fee Obligations Table Area */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Fee Obligations</h3>
          <Input type="search" placeholder="Search..." className="w-64" />
        </div>
        <div className="border rounded-md overflow-hidden bg-white">
          <div className="bg-blue-900 text-white text-xs font-semibold p-3 grid grid-cols-3">
            <div>TERM</div>
            <div>TOTAL FEE</div>
            <div>DUE</div>
          </div>
          <div className="p-12 text-center text-gray-400 text-sm flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-gray-200 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl text-gray-300">🔍</span>
            </div>
            <p>No results found</p>
            <p className="text-xs">No fee obligations found</p>
          </div>
        </div>
      </div>

      {/* Payment History Table Area */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Payment History</h3>
          <Input type="search" placeholder="Search..." className="w-64" />
        </div>
        <div className="border rounded-md overflow-hidden bg-white">
          <div className="bg-blue-900 text-white text-xs font-semibold p-3 grid grid-cols-6">
            <div>TRANSACTION ID</div>
            <div>REFERENCE</div>
            <div>FEE TYPE</div>
            <div>STATUS</div>
            <div>AMOUNT</div>
            <div>PAID AT</div>
          </div>
          <div className="p-12 text-center text-gray-400 flex justify-center items-center">
             <div className="w-10 h-10 border-2 border-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xl text-gray-300">🔍</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}