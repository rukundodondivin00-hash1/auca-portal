import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import type { Contract, Installment } from '@/lib/api';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';

export default function AdminContractDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [studentSummary, setStudentSummary] = useState<any>(null);
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

      try {
        const summaryResponse = await adminApi.getStudentSummary(contractResponse.data.studentId);
        setStudentSummary(summaryResponse.data);
      } catch (err) {
        console.error('Failed to fetch student summary:', err);
      }
    } catch (error) {
      console.error('Failed to fetch contract details:', error);
      // Demo data fallback
      const demoContract: Contract = {
        id: id!,
        studentId: '25306',
        studentName: 'John Paul',
        termId: '2025/1',
        academicYear: '2025',
        semester: '1',
        totalFees: 500000,
        balanceAtSigning: 250000,
        amountPaidAtSigning: 250000,
        remainingAtSigning: 250000,
        status: 'ACTIVE',
        agreed: true,
        agreedDate: '2025-01-15',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-15',
        installmentCount: 2,
        totalPaidOnInstallments: 0,
        totalPenaltyOnInstallments: 0,
      };
      setContract(demoContract);
      setInstallments([
        { id: 'inst-1', contractId: id!, amount: 125000, dueDate: '2025-03-15', paidDate: null, status: 'PENDING', penaltyAmount: 0 },
        { id: 'inst-2', contractId: id!, amount: 125000, dueDate: '2025-06-15', paidDate: null, status: 'PENDING', penaltyAmount: 0 },
      ]);
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

  // Use studentSummary.totalPaidAcrossContracts if available, otherwise fallback to contract data
  const totalPaid = studentSummary?.totalPaidAcrossContracts ?? 
    (contract.amountPaidAtSigning + contract.totalPaidOnInstallments);

  // Dynamically calculate installment status and amount paid
  const totalAmount = contract.totalFees || 0;
  const totalInstallmentDue = installments.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  const upfrontRequired = Math.max(0, totalAmount - totalInstallmentDue);
  
  let remainingForInstallments = Math.max(0, totalPaid - upfrontRequired);

  const dynamicInstallments = installments.map((inst: any) => {
    const due = Number(inst.amount || 0);
    let paid = 0;
    let status = inst.status;

    if (remainingForInstallments >= due && due > 0) {
      paid = due;
      remainingForInstallments -= due;
      status = 'PAID';
    } else if (remainingForInstallments > 0) {
      paid = remainingForInstallments;
      remainingForInstallments = 0;
      status = 'PARTIALLY_PAID';
    } else {
      paid = 0;
      if (status !== 'OVERDUE') {
        status = 'PENDING';
      }
    }

    return {
      ...inst,
      amountPaid: paid,
      status: status
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/contracts')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Contract Details</h1>
          <p className="text-gray-500">Viewing contract for {contract.studentName}</p>
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
              <span className="text-gray-500">Paid at Signing</span>
              <span className="font-medium">{formatCurrency(contract.amountPaidAtSigning)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Paid on Installments</span>
              <span className="font-medium">{formatCurrency(contract.totalPaidOnInstallments)}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between text-green-600 font-bold">
                <span>Total Paid</span>
                <span>{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="text-gray-500">Total Penalties</span>
                <span className="font-medium">{formatCurrency(contract.totalPenaltyOnInstallments)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installment Plan</CardTitle>
          <CardDescription>{dynamicInstallments.length} installment(s) scheduled</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dynamicInstallments.map((installment: any) => (
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
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      {formatCurrency(installment.amountPaid)}
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
                    <Badge variant={installment.status === 'PAID' ? 'outline' : 'default'} className={
                      installment.status === 'PAID' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' :
                      installment.status === 'OVERDUE' ? 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' :
                      installment.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200' : ''
                    }>
                      {installment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {dynamicInstallments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No installments scheduled
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {studentSummary?.transactions && studentSummary.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>{studentSummary.transactions.length} transaction(s) recorded</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentSummary.transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.createdAt)}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      +{formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tx.feeType || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{tx.channel || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}