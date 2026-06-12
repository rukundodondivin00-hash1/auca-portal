import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { adminApi, StudentSummary, Contract } from '@/lib/api';
import { ArrowLeft, Users, FileSignature, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminStudentDetails() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [summaryRes, contractsRes] = await Promise.all([
        adminApi.getStudentSummary(studentId!),
        adminApi.getContractsByStudent(studentId!)
      ]);
      setSummary(summaryRes.data);
      setContracts(contractsRes.data.content);
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading student details...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Student not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Student Details</h1>
          <p className="text-gray-500">Student ID: {summary.studentId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileSignature className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.contractCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalFeesAcrossContracts)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Has Active Contract</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {summary.hasActiveContract ? (
              <Badge className="bg-green-100 text-green-700">Yes</Badge>
            ) : (
              <Badge variant="outline">No</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Summary of payments across all contracts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-bold text-green-600">{formatCurrency(summary.totalPaidAcrossContracts)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Remaining</span>
            <span className="font-medium text-orange-600">{formatCurrency(summary.totalRemainingAcrossContracts)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Contracts</CardTitle>
          <CardDescription>All contracts for {summary.studentName}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Total Fees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agreed Date</TableHead>
                <TableHead>Installments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No contracts found
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.id.substring(0, 8)}...</TableCell>
                    <TableCell>{contract.termId}</TableCell>
                    <TableCell>{formatCurrency(contract.totalFees)}</TableCell>
                    <TableCell>
                      <Badge variant={contract.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{contract.agreedDate || '-'}</TableCell>
                    <TableCell>{contract.installmentCount}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}