import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InitiatePaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const totalAmount = 566103;
  const paymentMade = localStorage.getItem('demo_paymentMade');
  const remainingBalance = totalAmount - Number(paymentMade || 0);
  const requiredAmount = totalAmount * 0.5;
  const isEligible = Number(paymentMade || 0) >= requiredAmount;
  const shortfall = Math.ceil(requiredAmount - Number(paymentMade || 0));

  const handleInitiatePayment = () => {
    if (!paymentAmount) return;
    setIsProcessing(true);
    
    const amount = Number(paymentAmount);
    
    setTimeout(() => {
      // Load and update payment
      const currentPaymentMade = Number(localStorage.getItem('demo_paymentMade') || '0');
      const newPaymentMade = currentPaymentMade + amount;
      localStorage.setItem('demo_paymentMade', String(newPaymentMade));
      
      // Track installment payments for ContractDetails
      const plan = JSON.parse(localStorage.getItem('demo_installmentPlan') || '[]');
      const existingPayments = JSON.parse(localStorage.getItem('demo_installmentPayments') || '{}');
      
      if (plan.length > 0 && remainingBalance > 0) {
        let remaining = amount;
        const updatedPayments = { ...existingPayments };
        
        plan.forEach((inst: {amount: number}, idx: number) => {
          if (remaining <= 0) return;
          const stillOwed = inst.amount - (Number(existingPayments[idx]) || 0);
          if (stillOwed > 0) {
            updatedPayments[idx] = (Number(existingPayments[idx]) || 0) + Math.min(remaining, stillOwed);
            remaining -= Math.min(remaining, stillOwed);
          }
        });
        
        localStorage.setItem('demo_installmentPayments', JSON.stringify(updatedPayments));
      }
      
      setPaymentAmount('');
      setIsProcessing(false);
      onClose();
      window.dispatchEvent(new CustomEvent('paymentUpdated'));
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initiate Payment</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          {/* Amount Input */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Amount (RWF)</label>
            <Input 
              type="number" 
              placeholder={!isEligible ? String(shortfall) : "Enter amount"}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {!isEligible 
                ? `Minimum to become eligible: ${shortfall.toLocaleString()} RWF`
                : 'Payment amount toward remaining balance'}
            </p>
          </div>

          <div className="flex gap-4">
            {/* Channel Select */}
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Channel</label>
              <Select defaultValue="momo">
                <SelectTrigger><SelectValue placeholder="Select Channel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="momo">MOMO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fee Type Select */}
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Fee Type</label>
              <Select defaultValue="tuition">
                <SelectTrigger><SelectValue placeholder="Select Fee Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tuition">TUITION_FEE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
            <Input type="text" placeholder="e.g. 0781234567" />
            <p className="text-xs text-gray-500">Digits only - Local format (07XXXXXXXX or 250XXXXXXXXX)</p>
          </div>

          {/* Read-only Payer Info */}
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p>Payer code: 25306</p>
            <p>Payer email: rukundodivin91@gmail.com</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button 
            className="bg-blue-900 text-white hover:bg-blue-800"
            onClick={handleInitiatePayment}
            disabled={!paymentAmount || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Check size={16} /> Confirm Payment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}