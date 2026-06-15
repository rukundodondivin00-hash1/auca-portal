import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, History, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Contract } from '@/lib/api';

export default function AdminDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const response = await adminApi.getContracts();
        setContracts(response.data.content);
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
        // Demo data fallback
        const demoContracts: Contract[] = [
          { id: 'contract-001', studentId: '25306', studentName: 'John Paul', termId: '2025/1', academicYear: '2025', semester: '1', totalFees: 500000, balanceAtSigning: 250000, amountPaidAtSigning: 250000, remainingAtSigning: 250000, status: 'ACTIVE', agreed: true, agreedDate: '2025-01-15', createdAt: '2025-01-01', updatedAt: '2025-01-15', installmentCount: 2, totalPaidOnInstallments: 250000, totalPenaltyOnInstallments: 0 },
          { id: 'contract-002', studentId: '25293', studentName: 'Jane Smith', termId: '2025/1', academicYear: '2025', semester: '1', totalFees: 450000, balanceAtSigning: 450000, amountPaidAtSigning: 0, remainingAtSigning: 450000, status: 'PENDING', agreed: false, agreedDate: null, createdAt: '2025-01-02', updatedAt: '2025-01-02', installmentCount: 0, totalPaidOnInstallments: 0, totalPenaltyOnInstallments: 0 },
          { id: 'contract-003', studentId: '25100', studentName: 'Mike Johnson', termId: '2025/1', academicYear: '2025', semester: '1', totalFees: 500000, balanceAtSigning: 0, amountPaidAtSigning: 500000, remainingAtSigning: 0, status: 'COMPLETED', agreed: true, agreedDate: '2025-01-10', createdAt: '2024-09-01', updatedAt: '2025-01-10', installmentCount: 2, totalPaidOnInstallments: 500000, totalPenaltyOnInstallments: 0 },
          { id: 'contract-004', studentId: '25450', studentName: 'Sarah Wilson', termId: '2025/1', academicYear: '2025', semester: '1', totalFees: 500000, balanceAtSigning: 300000, amountPaidAtSigning: 200000, remainingAtSigning: 300000, status: 'OVERDUE', agreed: true, agreedDate: '2025-01-05', createdAt: '2024-09-01', updatedAt: '2025-01-05', installmentCount: 2, totalPaidOnInstallments: 200000, totalPenaltyOnInstallments: 5000 },
        ];
        setContracts(demoContracts);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const pendingContracts = contracts.filter(c => c.status === 'PENDING');
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
  const overdueContracts = contracts.filter(c => c.status === 'OVERDUE');
  const totalPenalties = contracts.reduce((sum, c) => sum + c.totalPenaltyOnInstallments, 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Contract Management</h1>
        <p className="text-gray-500 mt-1">View and manage student payment contracts.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contracts</CardTitle>
            <FileSignature className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{contracts.length}</div>
            <p className="text-xs text-gray-500 mt-1">All registered agreements</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingContracts.length}</div>
            <p className="text-xs text-yellow-600 font-medium mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeContracts.length}</div>
            <p className="text-xs text-green-600 font-medium mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Penalties</CardTitle>
            <History className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPenalties)}</div>
            <p className="text-xs text-red-600 font-medium mt-1">{overdueContracts.length} overdue accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* All Contracts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Contracts</CardTitle>
              <CardDescription>List of all student contracts</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/contracts')} className="text-xs">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {contracts.length === 0 && !loading ? (
              <div className="p-8 text-center text-gray-500 text-sm">No contracts found.</div>
            ) : (
              contracts.slice(0, 6).map(contract => (
                <div key={contract.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1 grid grid-cols-4 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Student</p>
                      <p className="text-sm font-bold text-gray-900">{contract.studentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ID • Term</p>
                      <p className="text-sm font-bold text-gray-900">{contract.studentId} • {contract.termId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total • Paid</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(contract.totalFees)} • {formatCurrency(contract.amountPaidAtSigning)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${contract.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : contract.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : contract.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {contract.status}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-[#00447b] hover:bg-[#00335c] text-white"
                    onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))
            )}
            {loading && <div className="p-8 text-center text-sm text-gray-500">Loading...</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}