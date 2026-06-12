import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { studentApi } from '@/lib/api';

export default function DeadlineAlert() {
  const [nextInstallment, setNextInstallment] = useState<any>(null);

  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const response = await studentApi.getDashboard();
        const installments = response.data.data?.contract?.installments || [];
        
        // Find the first unpaid installment
        const pending = installments.find((inst: any) => inst.status === 'PENDING');
        if (pending) setNextInstallment(pending);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDeadline();
  }, []);

  if (!nextInstallment) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-bold text-amber-800 text-sm">Payment Deadline Approaching</h3>
          <p className="text-amber-700 text-xs mt-1">
            Your next contract payment of <span className="font-bold">{nextInstallment.amount.toLocaleString()} RWF</span> is due on <span className="font-bold">{nextInstallment.dueDate}</span>. Please complete the payment to avoid the 5% monthly penalty.
          </p>
        </div>
      </div>
    </div>
  );
}