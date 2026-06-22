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
  onPaymentSuccess?: () => void;
}

export default function InitiatePaymentModal({ isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [channel, setChannel] = useState('MOMO');
  const [feeType, setFeeType] = useState('TUITION_FEE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      studentApi.getDashboard()
        .then(res => setDashboardData(res.data.data))
        .catch(() => {
          setDashboardData(null);
        });
    }
  }, [isOpen]);

  const totalAmount = dashboardData?.financial?.totalFees || 0;
  const paymentMade = dashboardData?.financial?.paidAmount || 0;
  const isEligible = dashboardData?.financial?.isEligibleForContract ?? false;
  const shortfall = Math.ceil((totalAmount * 0.5) - paymentMade);

  const handleInitiatePayment = async () => {
    if (!paymentAmount) return;
    setIsProcessing(true);
    
    const currentStudentId = dashboardData?.student?.studentId || dashboardData?.student?.id || '25307';
    
    // Explicitly define the backend URL
    const backendUrl = 'http://localhost:8083';

    try {
      const response = await fetch(`${backendUrl}/api/payments/confirm`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'X-Student-Id': currentStudentId,
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          channel,
          feeType,
          phoneNumber
        })
      });

      if (!response.ok) {
        // Try to get a helpful error message from the backend
        const errorText = await response.text();
        throw new Error(errorText || `Payment failed (Status: ${response.status})`);
      }
      
      setPaymentAmount('');
      setPhoneNumber('');
      onClose();
      onPaymentSuccess?.();
    } catch (error: any) {
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger><SelectValue placeholder="Select Channel" /></SelectTrigger>
                <SelectContent><SelectItem value="MOMO">MOMO</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Fee Type</label>
              <Select value={feeType} onValueChange={setFeeType}>
                <SelectTrigger><SelectValue placeholder="Select Fee Type" /></SelectTrigger>
                <SelectContent><SelectItem value="TUITION_FEE">TUITION_FEE</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
            <Input type="text" placeholder="e.g. 0781234567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            <p className="text-xs text-gray-500">Digits only - Local format (07XXXXXXXX or 250XXXXXXXXX)</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p>Payer code: {dashboardData?.student?.studentId || '25307'}</p>
            <p>Payer name: {dashboardData?.student?.studentName || 'Demo Student'}</p>
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