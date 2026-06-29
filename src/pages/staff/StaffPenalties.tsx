import { useState, useEffect } from 'react';
import { staffApi } from '@/lib/api';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StaffPenalties() {
  const [penalties, setPenalties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    setLoading(true);
    try {
      const res = await staffApi.getPenalties();
      setPenalties(res.data.content || res.data.data.content || res.data.data || res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load penalties');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Penalties</h1>
          <p className="text-sm text-slate-500">View all penalties applied to student installments.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by student ID..."
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#00447b]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex justify-center text-slate-500">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-red-500">
            <AlertCircle size={32} className="mb-2 text-red-400" />
            <p>{error}</p>
          </div>
        ) : penalties.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No penalties have been recorded yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Applied</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Contract ID</TableHead>
                <TableHead>Original Amount</TableHead>
                <TableHead className="text-red-600 font-bold">Penalty Amount</TableHead>
                <TableHead>New Balance</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penalties.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(p.createdAt)}</TableCell>
                  <TableCell className="font-semibold text-slate-700">{p.studentName || '—'}</TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">{p.contractId?.slice(0,8)}...</TableCell>
                  <TableCell>{formatCurrency(p.previousAmount)}</TableCell>
                  <TableCell className="font-bold text-red-600">+{formatCurrency(p.penaltyAmount)}</TableCell>
                  <TableCell className="font-medium text-slate-800">{formatCurrency(p.newAmount)}</TableCell>
                  <TableCell className="text-xs text-slate-500 max-w-xs truncate" title={p.reason}>{p.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}