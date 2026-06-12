import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { adminApi, Contract } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export default function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, [currentPage, statusFilter]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = statusFilter === 'all' 
        ? await adminApi.getContracts(currentPage)
        : await adminApi.getContractsByStatus(statusFilter);
      setContracts(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
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
      setTotalPages(1);
      setTotalElements(allContracts.length);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContracts(contracts.map(c => c.id));
    } else {
      setSelectedContracts([]);
    }
  };

  const handleSelectContract = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedContracts([...selectedContracts, id]);
    } else {
      setSelectedContracts(selectedContracts.filter(cid => cid !== id));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (!selectedContracts.length) return;
    try {
      await adminApi.bulkUpdateContractStatus(selectedContracts, status);
      setSelectedContracts([]);
      fetchContracts();
    } catch (error) {
      console.error('Bulk update failed:', error);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contracts Management</h1>
          <p className="text-gray-500 mt-1">View and manage all student payment contracts</p>
        </div>
        <Button variant="outline" onClick={fetchContracts}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Filter contracts by status or search by student</CardDescription>
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

          {selectedContracts.length > 0 && (
            <Select onValueChange={handleBulkStatusUpdate}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={`Bulk update (${selectedContracts.length})`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Set Active</SelectItem>
                <SelectItem value="COMPLETED">Set Completed</SelectItem>
                <SelectItem value="CANCELLED">Set Cancelled</SelectItem>
              </SelectContent>
            </Select>
          )}
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
                    <TableHead>
                      <Checkbox 
                        checked={selectedContracts.length === contracts.length && contracts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Total Fees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agreed</TableHead>
                    <TableHead>Installments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No contracts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedContracts.includes(contract.id)}
                            onCheckedChange={(checked) => handleSelectContract(contract.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{contract.studentId}</TableCell>
                        <TableCell>{contract.studentName}</TableCell>
                        <TableCell>{contract.termId}</TableCell>
                        <TableCell>{formatCurrency(contract.totalFees)}</TableCell>
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
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-gray-500">
                    Page {currentPage + 1} of {totalPages} ({totalElements} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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