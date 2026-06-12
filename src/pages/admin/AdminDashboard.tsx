import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, FileSignature, History, TrendingUp } from 'lucide-react';
import { adminApi, Contract } from '@/lib/api';

export default function AdminDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const response = await adminApi.getContracts();
        setContracts(response.data.content);
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;
  const totalStudents = contracts.length;
  const totalPenalties = contracts.reduce((sum, c) => sum + c.totalPenaltyOnInstallments, 0);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        <p className="text-gray-500 mt-1">Payment contracts overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileSignature className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
            <p className="text-xs text-gray-500">All payment contracts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileSignature className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts}</div>
            <p className="text-xs text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students with Contracts</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-gray-500">In system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Penalties</CardTitle>
            <History className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPenalties)}</div>
            <p className="text-xs text-gray-500">Outstanding</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest contract updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.slice(0, 4).map(contract => (
                <div key={contract.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{contract.studentName} ({contract.studentId})</p>
                    <p className="text-xs text-gray-500">Status: {contract.status}</p>
                  </div>
                  <span className="text-xs text-gray-400">{contract.termId}</span>
                </div>
              ))}
              {loading && <div className="text-center py-4">Loading...</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue Contracts</CardTitle>
            <CardDescription>Contracts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.filter(c => c.status === 'OVERDUE').slice(0, 4).map(contract => (
                <div key={contract.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{contract.studentName} ({contract.studentId})</p>
                    <p className="text-xs text-gray-500">Term: {contract.termId}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(contract.remainingAtSigning)}</span>
                </div>
              ))}
              {!loading && contracts.filter(c => c.status === 'OVERDUE').length === 0 && (
                <p className="text-sm text-gray-500">No overdue contracts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}