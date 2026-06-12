import { AlertTriangle } from 'lucide-react';

export default function DeadlineAlert() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-bold text-amber-800 text-sm">Payment Deadline Approaching</h3>
          <p className="text-amber-700 text-xs mt-1">
            Your next contract payment of <span className="font-bold">200,000 RWF</span> is due in 7 days (30/10/2025). Please complete the payment to avoid the 5% monthly penalty.
          </p>
        </div>
      </div>
    </div>
  );
}