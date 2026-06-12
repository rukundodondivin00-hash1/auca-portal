import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import type { Contract, Installment } from '@/lib/api';
import { ArrowLeft, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminContractDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchContractDetails();
    }
  }, [id]);

  const fetchContractDetails = async () => {
    setLoading(true);
    try {
      const contractResponse = await adminApi.getContract(id!);
      setContract(contractResponse.data);
      const installmentsResponse = await adminApi.getInstallmentsByContract(id!);
      setInstallments(installmentsResponse.data);
    } catch (error) {
      console.error('Failed to fetch contract details:', error);
      toast.error('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContractStatus = async (status: string) => {
    if (!contract) return;
    try {
      await adminApi.updateContractStatus(contract.id, { status });
      setContract({ ...contract, status: status as any });
      toast.success('Contract status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateInstallmentStatus = async (installmentId: string, status: 'PAID' | 'PENDING') => {
    try {
      await adminApi.updateInstallmentStatus(installmentId, status);
      setInstallments(installments.map(inst => 
        inst.id === installmentId ? { ...inst, status } : inst
      ));
      toast.success('Installment status updated');
    } catch (error) {
      toast.error('Failed to update installment status');
    }
  };

  const handleWaivePenalty = async (installmentId: string) => {
    if (!window.confirm('Are you sure you want to waive the penalty for this installment?')) return;
    try {
      await adminApi.waiveInstallmentPenalty(installmentId);
      setInstallments(installments.map(inst => 
        inst.id === installmentId ? { ...inst, penaltyAmount: 0 } : inst
      ));
      toast.success('Penalty waived successfully');
    } catch (error) {
      toast.error('Failed to waive penalty');
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
        <div className="text-center py-12">Loading contract details...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Contract not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/contracts')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Contract Details</h1>
          <p className="text-gray-500">Contract ID: {contract.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Student Information
              <Badge variant={contract.status === 'ACTIVE' ? 'default' : 
                contract.status === 'COMPLETED' ? 'outline' : 'secondary'}>
                {contract.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Student ID</p>
              <p className="font-medium">{contract.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Student Name</p>
              <p className="font-medium">{contract.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Term</p>
              <p className="font-medium">{contract.termId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Academic Year</p>
              <p className="font-medium">{contract.academicYear} - Semester {contract.semester}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Agreed</p>
              <p className="font-medium">
                {contract.agreed ? `Yes on ${contract.agreedDate}` : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{formatDate(contract.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Fees</span>
              <span className="font-bold">{formatCurrency(contract.totalFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Balance at Signing</span>
              <span className="font-medium">{formatCurrency(contract.balanceAtSigning)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Paid at Signing</span>
              <span className="font-medium">{formatCurrency(contract.amountPaidAtSigning)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Remaining at Signing</span>
              <span className="font-medium">{formatCurrency(contract.remainingAtSigning)}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-gray-500">Total on Installments</span>
                <span className="font-medium">{formatCurrency(contract.totalPaidOnInstallments)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="text-gray-500">Total Penalties</span>
                <span className="font-medium">{formatCurrency(contract.totalPenaltyOnInstallments)}</span>
              </div>
            </div>

            <div className="pt-4">
              <Select 
                value={contract.status} 
                onValueChange={handleUpdateContractStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Set Pending</SelectItem>
                  <SelectItem value="ACTIVE">Set Active</SelectItem>
                  <SelectItem value="COMPLETED">Set Completed</SelectItem>
                  <SelectItem value="CANCELLED">Set Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installment Plan</CardTitle>
          <CardDescription>{installments.length} installment(s) scheduled</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map((installment) => (
                <TableRow key={installment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(installment.dueDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      {formatCurrency(installment.amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {installment.penaltyAmount > 0 ? (
                      <span className="text-red-600 font-medium">
                        {formatCurrency(installment.penaltyAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={installment.status === 'PAID' ? 'outline' : 'default'}>
                      {installment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Select
                      value={installment.status}
                      onValueChange={(value) => handleUpdateInstallmentStatus(installment.id, value as 'PAID' | 'PENDING')}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {installment.penaltyAmount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWaivePenalty(installment.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Waive
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}