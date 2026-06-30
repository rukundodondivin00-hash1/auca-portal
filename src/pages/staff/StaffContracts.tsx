import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { staffApi } from '@/lib/api';
import type { Contract } from '@/lib/api';
import { Search, RefreshCw, Loader2, FileBadge } from 'lucide-react';
import StaffGrantPermitModal from '@/components/staff/StaffGrantPermitModal';

export default function StaffContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchContracts(); }, [statusFilter]);

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = statusFilter === 'all'
        ? await staffApi.getContracts()
        : await staffApi.getContractsByStatus(statusFilter);
      setContracts(response.data.content ?? []);
    } catch (err: any) {
      setError('Failed to load contracts. Make sure the backend server is running.');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) searchByStudent(searchTerm.trim());
    else fetchContracts();
  };

  const searchByStudent = async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await staffApi.getContractsByStudent(term);
      setContracts(response.data.content ?? []);
    } catch {
      setError('Search failed. Try again.');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount || 0);

  const statusColor = (s: string) =>
    s === 'ACTIVE' ? 'bg-green-100 text-green-700' :
    s === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
    s === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
    s === 'OVERDUE' ? 'bg-red-100 text-red-700' :
    s === 'CANCELLED' ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-700';

  const totalContracts  = contracts.length;
  const totalAmount     = contracts.reduce((s, c) => s + (c.totalFees || 0), 0);
  const totalPaid       = contracts.reduce((s, c) => s + (c.amountPaidAtSigning || 0) + (c.totalPaidOnInstallments || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contract Overview</h1>
          <p className="text-gray-500 mt-1">Live contract data from the database</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsPermitModalOpen(true)} className="bg-[#00447b] hover:bg-blue-800 text-white shadow-sm">
            <FileBadge className="h-4 w-4 mr-2" /> Grant Exam Permit
          </Button>
          <Button variant="outline" onClick={fetchContracts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: totalContracts, color: 'text-gray-900' },
          { label: 'Active', value: contracts.filter(c => c.status === 'ACTIVE').length, color: 'text-green-700' },
          { label: 'Pending', value: contracts.filter(c => c.status === 'PENDING').length, color: 'text-yellow-700' },
          { label: 'Overdue', value: contracts.filter(c => c.status === 'OVERDUE').length, color: 'text-red-700' },
        ].map(s => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{s.label}</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Search by student ID, or filter by status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <Input
              placeholder="Student ID or name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline" disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
            {searchTerm && (
              <Button type="button" variant="ghost" onClick={() => { setSearchTerm(''); fetchContracts(); }}>
                Clear
              </Button>
            )}
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
            <div className="p-12 text-center flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={20} /> Loading contracts...
            </div>
          ) : contracts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              {error ? 'Failed to load data.' : 'No contracts found matching your criteria.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Total Fees</TableHead>
                    <TableHead>Paid at Signing</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Installments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.studentId}</TableCell>
                      <TableCell>{c.studentName || '—'}</TableCell>
                      <TableCell>{c.termId}</TableCell>
                      <TableCell>{formatCurrency(c.totalFees)}</TableCell>
                      <TableCell>{formatCurrency(c.amountPaidAtSigning)}</TableCell>
                      <TableCell>{formatCurrency((c.remainingAtSigning || 0) - (c.totalPaidOnInstallments || 0))}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell>{c.installmentCount ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/staff/contracts/${c.id}`)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {contracts.length > 0 && (
                <div className="p-4 border-t bg-gray-50 flex justify-between text-sm text-gray-600">
                  <span>Total: <strong>{formatCurrency(totalAmount)}</strong></span>
                  <span>Total Paid: <strong className="text-green-700">{formatCurrency(totalPaid)}</strong></span>
                  <span>Outstanding: <strong className="text-red-600">{formatCurrency(totalAmount - totalPaid)}</strong></span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <StaffGrantPermitModal 
        isOpen={isPermitModalOpen} 
        onClose={() => setIsPermitModalOpen(false)} 
      />
    </div>
  );
}