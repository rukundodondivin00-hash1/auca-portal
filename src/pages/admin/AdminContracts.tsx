import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { adminApi } from '@/lib/api';
import type { Contract } from '@/lib/api';
import { Search, RefreshCw } from 'lucide-react';

export default function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = statusFilter === 'all'
        ? await adminApi.getContracts()
        : await adminApi.getContractsByStatus(statusFilter);
      setContracts(response.data.content);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      // Demo data fallback
      const demoContracts: Contract[] = [
        { id: 'contract-001', studentId: '25306', studentName: 'John Paul', termId: '2025/1', academicYear: '2025', semester: '1', totalFees: 500000, balanceAtSigning: 250000, amountPaidAtSigning: 250000, remainingAtSigning: 250000, status: 'ACTIVE', agreed: true, agreedDate: '2025-01-15', createdAt: '2025-01-01', updatedAt: '2025-01-15', installmentCount: 2, totalPaidOnInstallments: 0, totalPenaltyOnInstallments: 0 },
        { id: 'contract-002', studentId: '25293', studentName: 'Jane Smith', termId: '2025/1', academicYear: '2025', semester: '1', totalFees: 450000, balanceAtSigning: 450000, amountPaidAtSigning: 0, remainingAtSigning: 450000, status: 'PENDING', agreed: false, agreedDate: null, createdAt: '2025-01-02', updatedAt: '2025-01-02', installmentCount: 0, totalPaidOnInstallments: 0, totalPenaltyOnInstallments: 0 },
        { id: 'contract-003', studentId: '25100', studentName: 'Mike Johnson', termId: '2025/1', academicYear: '2025', semester: '1', totalFees: 500000, balanceAtSigning: 0, amountPaidAtSigning: 500000, remainingAtSigning: 0, status: 'COMPLETED', agreed: true, agreedDate: '2025-01-10', createdAt: '2024-09-01', updatedAt: '2025-01-10', installmentCount: 2, totalPaidOnInstallments: 0, totalPenaltyOnInstallments: 0 },
        { id: 'contract-004', studentId: '25450', studentName: 'Sarah Wilson', termId: '2025/1', academicYear: '2025', semester: '1', totalFees: 500000, balanceAtSigning: 300000, amountPaidAtSigning: 200000, remainingAtSigning: 300000, status: 'OVERDUE', agreed: true, agreedDate: '2025-01-05', createdAt: '2024-09-01', updatedAt: '2025-01-05', installmentCount: 2, totalPaidOnInstallments: 0, totalPenaltyOnInstallments: 15000 },
      ];
      setContracts(demoContracts);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchByStudent(searchTerm);
    }
  };

  const searchByStudent = async (term: string) => {
    setLoading(true);
    try {
      const response = await adminApi.searchStudents(term);
      const contractPromises = response.data.content.map(s => adminApi.getContractsByStudent(s.studentId));
      const contractResponses = await Promise.all(contractPromises);
      const allContracts = contractResponses.flatMap(r => r.data.content);
      setContracts(allContracts);
    } catch (error) {
      console.error('Search failed:', error);
      // Demo search fallback - show matching contracts
      const demoContracts: Contract[] = [
        { id: 'contract-001', studentId: '25306', studentName: 'John Paul', termId: '2025/1', academicYear: '2025', semester: '1', totalFees: 500000, balanceAtSigning: 250000, amountPaidAtSigning: 250000, remainingAtSigning: 250000, status: 'ACTIVE', agreed: true, agreedDate: '2025-01-15', createdAt: '2025-01-01', updatedAt: '2025-01-15', installmentCount: 2, totalPaidOnInstallments: 0, totalPenaltyOnInstallments: 0 },
      ];
      setContracts(demoContracts);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'PENDING': return 'secondary';
      case 'COMPLETED': return 'outline';
      case 'CANCELLED': return 'destructive';
      case 'OVERDUE': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  const totalContracts = contracts.length;
  const pendingContracts = contracts.filter(c => c.status === 'PENDING').length;
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;
  const completedContracts = contracts.filter(c => c.status === 'COMPLETED').length;
  const totalAmount = contracts.reduce((sum, c) => sum + c.totalFees, 0);
  const totalPaid = contracts.reduce((sum, c) => sum + c.amountPaidAtSigning + c.totalPaidOnInstallments, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contract Overview</h1>
          <p className="text-gray-500 mt-1">View all student payment contracts</p>
        </div>
        <Button variant="outline" onClick={fetchContracts}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedContracts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Search contracts by student or filter by status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <Input
              placeholder="Search by student ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contracts</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading contracts...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Total Fees</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agreed</TableHead>
                    <TableHead>Installments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        No contracts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.studentId}</TableCell>
                        <TableCell>{contract.studentName}</TableCell>
                        <TableCell>{contract.termId}</TableCell>
                        <TableCell>{formatCurrency(contract.totalFees)}</TableCell>
                        <TableCell>{formatCurrency(contract.amountPaidAtSigning + contract.totalPaidOnInstallments)}</TableCell>
                        <TableCell>{formatCurrency(contract.remainingAtSigning - contract.totalPaidOnInstallments)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(contract.status) as any}>
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {contract.agreed ? (
                            <span className="text-green-600">Yes ({contract.agreedDate})</span>
                          ) : 'No'}
                        </TableCell>
                        <TableCell>{contract.installmentCount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {contracts.length > 0 && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount: <strong>{formatCurrency(totalAmount)}</strong></span>
                    <span>Total Paid: <strong>{formatCurrency(totalPaid)}</strong></span>
                    <span>Total Balance: <strong>{formatCurrency(totalAmount - totalPaid)}</strong></span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}