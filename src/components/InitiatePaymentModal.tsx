import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InitiatePaymentModal({ isOpen, onClose }: PaymentModalProps) {
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
            <Input type="number" placeholder="5" />
            <p className="text-xs text-gray-500">Suggested due: RWF 0<br/>Enter an amount your wallet can cover or top up first.</p>
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-900 text-white hover:bg-blue-800">Initiate Payment</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}