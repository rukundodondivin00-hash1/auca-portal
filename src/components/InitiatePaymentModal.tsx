import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Check } from 'lucide-react';
import { studentApi } from '@/lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InitiatePaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      studentApi.getDashboard().then(res => setDashboardData(res.data.data)).catch(console.error);
    }
  }, [isOpen]);

  const totalAmount = dashboardData?.financials?.totalFees || 566103;
  const paymentMade = dashboardData?.financials?.amountPaid || 0;
  const remainingBalance = dashboardData?.financials?.remainingBalance || totalAmount;
  const requiredAmount = totalAmount * 0.5;
  const isEligible = paymentMade >= requiredAmount;
  const shortfall = Math.ceil(requiredAmount - paymentMade);

  const handleInitiatePayment = () => {
    if (!paymentAmount) return;
    setIsProcessing(true);
    
    // Simulate payment processing since no backend endpoint exists for MoMo yet
    setTimeout(() => {
      setPaymentAmount('');
      setIsProcessing(false);
      onClose();
      // Reload page to reflect new backend state if API was real
      window.location.reload(); 
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initiate Payment</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Amount (RWF)</label>
            <Input 
              type="number" 
              placeholder={!isEligible ? String(shortfall) : "Enter amount"}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {!isEligible ? `Minimum to become eligible: ${shortfall.toLocaleString()} RWF` : 'Payment amount toward remaining balance'}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Channel</label>
              <Select defaultValue="momo">
                <SelectTrigger><SelectValue placeholder="Select Channel" /></SelectTrigger>
                <SelectContent><SelectItem value="momo">MOMO</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Fee Type</label>
              <Select defaultValue="tuition">
                <SelectTrigger><SelectValue placeholder="Select Fee Type" /></SelectTrigger>
                <SelectContent><SelectItem value="tuition">TUITION_FEE</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
            <Input type="text" placeholder="e.g. 0781234567" />
            <p className="text-xs text-gray-500">Digits only - Local format (07XXXXXXXX or 250XXXXXXXXX)</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p>Payer code: {dashboardData?.student?.studentId || 'N/A'}</p>
            <p>Payer name: {dashboardData?.student?.studentName || 'N/A'}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button className="bg-blue-900 text-white hover:bg-blue-800" onClick={handleInitiatePayment} disabled={!paymentAmount || isProcessing}>
            {isProcessing ? <><Loader2 size={16} className="animate-spin mr-2" /> Processing...</> : <><Check size={16} className="mr-2"/> Confirm Payment</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}