import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wallet, FileText, DollarSign } from 'lucide-react'; // Example icons
import InitiatePaymentModal from '../components/InitiatePaymentModal';

export default function MyFees() {
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

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
              <h2 className="text-2xl font-bold text-blue-600">RWF 0</h2>
              <p className="text-xs text-gray-400 mt-1">Negative = due, positive = credit</p>
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
              <p className="text-sm font-medium text-gray-500">Amount Due</p>
              <h2 className="text-2xl font-bold text-green-600">RWF 0</h2>
              <p className="text-xs text-gray-400 mt-1">Owed when your balance is negative</p>
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
              <p className="text-sm font-medium text-gray-500">Credit Balance</p>
              <h2 className="text-2xl font-bold text-orange-500">RWF 0</h2>
              <p className="text-xs text-gray-400 mt-1">Available when your balance is positive</p>
            </div>
            <div className="p-2 bg-orange-100 rounded text-orange-500">
              <DollarSign size={20} />
            </div>
          </CardContent>
        </Card>
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

      {/* Render the Modal */}
      <InitiatePaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
      />
    </div>
  );
}