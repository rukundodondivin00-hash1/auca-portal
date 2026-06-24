import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Check, Info } from 'lucide-react';

import { imsApi, contractApi, paymentApi } from '@/lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
  /** If provided, payment goes to contract installments (post-contract). Otherwise it's a pre-payment. */
  hasActiveContract?: boolean;
  totalFees?: number;
}

export default function InitiatePaymentModal({
  isOpen, onClose, onPaymentSuccess, hasActiveContract, totalFees
}: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [channel, setChannel] = useState('MOMO');
  const [feeType, setFeeType] = useState('TUITION_FEE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [registration, setRegistration] = useState<any>(null);

  const studentId = localStorage.getItem('student_id') || '';
  const jwtToken = localStorage.getItem('jwt_token') || '';

  useEffect(() => {
    if (!isOpen) return;

    // Load registration info (for termId + total fees context)
    imsApi.get('/api/v1/registration/my-registration', {
      headers: { 'X-Student-Id': studentId }
    })
      .then(r => r.status === 200 ? r.data : null)
      .then(data => setRegistration(data))
      .catch(() => {});

    // Load total pre-payments made so far
    paymentApi.getMyBalance(studentId)
      .then(r => r.status === 200 ? r.data : null)
      .then(data => {
        if (data?.data?.totalPaid || data?.totalPaid) {
          setTotalPaid(Number(data.data?.totalPaid || data.totalPaid));
        }
      })
      .catch(() => {});
  }, [isOpen, studentId]);



  const handleInitiatePayment = async () => {
    const amount = Number(paymentAmount);
    if (!amount || amount < 1000) {
      alert('Minimum payment is 1,000 RWF.');
      return;
    }

    setIsProcessing(true);
    try {
      const endpoint = hasActiveContract
        ? '/api/payments/confirm'
        : '/api/payments/pre-payment';

      const body: any = {
        amount,
        channel,
        feeType,
        phoneNumber
      };
      if (!hasActiveContract && registration?.termId) {
        body.termId = registration.termId;
      }

      const response = await contractApi.post(endpoint, body);
      const result = response.data;
      const newTotalPaid = result?.data?.totalPaidToDate ?? (totalPaid + amount);
      setTotalPaid(Number(newTotalPaid));

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
          <DialogTitle>{hasActiveContract ? 'Pay Installment' : 'Make a Payment'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-2">

          {/* Context info banner */}
          {hasActiveContract && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-800">
                Paying toward your <strong>active contract installments</strong>.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Amount (RWF)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min={1000}
            />
            <p className="text-xs text-gray-500">Minimum payment: 1,000 RWF</p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Channel</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger><SelectValue placeholder="Select Channel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOMO">Mobile Money (MOMO)</SelectItem>
                  <SelectItem value="BANK">Bank Transfer</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Fee Type</label>
              <Select value={feeType} onValueChange={setFeeType}>
                <SelectTrigger><SelectValue placeholder="Fee Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TUITION_FEE">Tuition Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Phone Number <span className="text-gray-400 text-xs">(optional)</span></label>
            <Input
              type="text"
              placeholder="07XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-gray-500">Local format (07XXXXXXXX or 250XXXXXXXXX)</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p>Student ID: {studentId}</p>
            {registration?.termId && <p>Term: {registration.termId}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button
            className="bg-blue-900 text-white hover:bg-blue-800"
            onClick={handleInitiatePayment}
            disabled={!paymentAmount || Number(paymentAmount) < 1000 || isProcessing}
          >
            {isProcessing
              ? <><Loader2 size={16} className="animate-spin mr-2" /> Processing...</>
              : <><Check size={16} className="mr-2" /> Confirm Payment</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}