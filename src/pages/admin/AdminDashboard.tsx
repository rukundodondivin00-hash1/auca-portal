import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, History, Clock, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Contract } from '@/lib/api';

export default function AdminDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount || 0);

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getContracts(0, 20);
      setContracts(response.data.content ?? []);
    } catch (err: any) {
      setError('Could not load contracts. Is the contract server running on port 8083?');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);

  const pending   = contracts.filter(c => c.status === 'PENDING').length;
  const active    = contracts.filter(c => c.status === 'ACTIVE').length;
  const overdue   = contracts.filter(c => c.status === 'OVERDUE').length;
  const completed = contracts.filter(c => c.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 bg-gray-50/50 min-h-[calc(100vh-4rem)] p-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Contract Management</h1>
          <p className="text-gray-500 mt-1">View and manage student payment contracts.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchContracts}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contracts</CardTitle>
            <FileSignature className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <div className="text-2xl font-bold text-gray-900">{contracts.length}</div>
                <p className="text-xs text-gray-500 mt-1">All registered agreements</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{loading ? '—' : active}</div>
            <p className="text-xs text-green-600 font-medium mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{loading ? '—' : pending}</div>
            <p className="text-xs text-yellow-600 font-medium mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            <History className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{loading ? '—' : overdue}</div>
            <p className="text-xs text-red-600 font-medium mt-1">{completed} completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Contracts</CardTitle>
              <CardDescription>Live data from the contract database</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/contracts')} className="text-xs">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} /> Loading contracts...
            </div>
          ) : contracts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No contracts found.{' '}
              {!error && <span className="text-gray-400">Students who sign contracts will appear here.</span>}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {contracts.slice(0, 8).map(contract => (
                <div key={contract.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Student</p>
                      <p className="text-sm font-bold text-gray-900">{contract.studentName || contract.studentId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ID · Term</p>
                      <p className="text-sm font-bold text-gray-900">{contract.studentId} · {contract.termId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(contract.totalFees)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        contract.status === 'ACTIVE'     ? 'bg-green-100 text-green-700' :
                        contract.status === 'PENDING'    ? 'bg-yellow-100 text-yellow-700' :
                        contract.status === 'OVERDUE'    ? 'bg-red-100 text-red-700' :
                        contract.status === 'COMPLETED'  ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'}`}>
                        {contract.status}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#00447b] hover:bg-[#00335c] text-white ml-4"
                    onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}