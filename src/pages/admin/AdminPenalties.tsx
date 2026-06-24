import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, Loader2, AlertTriangle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Penalty } from '@/lib/api';

export default function AdminPenalties() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchPenalties(); }, []);

  const fetchPenalties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getPenalties();
      setPenalties(response.data.content ?? []);
    } catch {
      setError('Failed to load penalties. Make sure the contract server (port 8083) is running.');
      setPenalties([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount || 0);

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const filtered = penalties.filter(p =>
    !searchTerm ||
    p.contractId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.installmentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPenaltyAmount = filtered.reduce((s, p) => s + (p.penaltyAmount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Penalties History</h1>
          <p className="text-gray-500 mt-1">Automatic 5% monthly penalty applied to overdue installments</p>
        </div>
        <Button variant="outline" onClick={fetchPenalties} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-2">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Penalty Logic</p>
          <p className="mt-0.5">Penalties are automatically applied daily at midnight to installments that are <strong>PENDING</strong> and past their deadline. Each penalty adds 5% to the outstanding amount. Students must have a contract to be subject to penalties.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Penalties</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loading ? '—' : filtered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Penalty Amount</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loading ? '—' : formatCurrency(totalPenaltyAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Penalties</CardTitle>
          <CardDescription>Filter by contract ID or installment ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by contract or installment ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={20} /> Loading penalties...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              <AlertTriangle className="mx-auto mb-3 text-gray-300" size={32} />
              {error ? 'Failed to load data.' : 'No penalty records found. Penalties appear when students with contracts miss their installment deadlines.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Installment ID</TableHead>
                  <TableHead>Penalty Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((penalty, idx) => (
                  <TableRow key={penalty.id}>
                    <TableCell className="text-gray-400">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{penalty.contractId}</TableCell>
                    <TableCell className="font-mono text-xs">{penalty.installmentId}</TableCell>
                    <TableCell className="text-red-600 font-semibold">{formatCurrency(penalty.penaltyAmount || 0)}</TableCell>
                    <TableCell>{penalty.reason}</TableCell>
                    <TableCell>{formatDate(penalty.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}