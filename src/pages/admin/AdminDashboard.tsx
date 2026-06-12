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

  // Calculate dynamic metrics for the workflow
  const totalContracts = contracts.length;
  const pendingContracts = contracts.filter(c => c.status === 'PENDING');
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
  const overdueContracts = contracts.filter(c => c.status === 'OVERDUE');
  const totalPenalties = contracts.reduce((sum, c) => sum + c.totalPenaltyOnInstallments, 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Finance Overview</h1>
        <p className="text-gray-500 mt-1">Review pending requests and monitor student payment compliance.</p>
      </div>

      {/* KPI Cards: Focused on Workflow States */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contracts</CardTitle>
            <FileSignature className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalContracts}</div>
            <p className="text-xs text-gray-500 mt-1">All registered agreements</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingContracts.length}</div>
            <p className="text-xs text-yellow-600 font-medium mt-1">Awaiting your approval</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Contracts</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeContracts.length}</div>
            <p className="text-xs text-green-600 font-medium mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Penalties</CardTitle>
            <History className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPenalties)}</div>
            <p className="text-xs text-red-600 font-medium mt-1">{overdueContracts.length} overdue accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Pending Contracts (Highest Priority Workflow) */}
        <Card className="border-yellow-100 shadow-sm">
          <CardHeader className="bg-yellow-50/50 border-b border-yellow-100 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Action Required</CardTitle>
                <CardDescription>New student contract requests awaiting review</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/contracts')} className="text-xs">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {pendingContracts.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500 text-sm">No pending requests at the moment.</div>
              )}
              {pendingContracts.slice(0, 5).map(contract => (
                <div key={contract.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{contract.studentName}</p>
                      <p className="text-xs text-gray-500">ID: {contract.studentId} • Term: {contract.termId}</p>
                    </div>
                  </div>
<Button 
                     size="sm" 
                     className="bg-[#00447b] hover:bg-[#00335c] text-white"
                     onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                   >
                     View Details
                   </Button>
                </div>
              ))}
              {loading && <div className="p-8 text-center text-sm text-gray-500">Loading requests...</div>}
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: Overdue Contracts (Secondary Priority Workflow) */}
        <Card className="border-red-100 shadow-sm">
          <CardHeader className="bg-red-50/50 border-b border-red-100 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Attention Required</CardTitle>
                <CardDescription>Active contracts with overdue installments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {overdueContracts.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500 text-sm">All active accounts are up to date.</div>
              )}
              {overdueContracts.slice(0, 5).map(contract => (
                <div key={contract.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{contract.studentName}</p>
                      <p className="text-xs text-gray-500">Remaining: {formatCurrency(contract.remainingAtSigning)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                  >
                    Details
                  </Button>
                </div>
              ))}
              {loading && <div className="p-8 text-center text-sm text-gray-500">Loading overdue accounts...</div>}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}