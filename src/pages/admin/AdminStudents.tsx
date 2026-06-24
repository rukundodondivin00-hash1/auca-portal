import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Search, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { StudentSummary } from '@/lib/api';

export default function AdminStudents() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => { searchStudents(); }, [debouncedTerm]);

  const searchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.searchStudents(debouncedTerm);
      setStudents(response.data.content ?? []);
    } catch {
      setError('Failed to load students. Make sure the contract server (port 8083) is running.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount || 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Overview</h1>
          <p className="text-gray-500 mt-1">Student financial summaries (read-only, live data)</p>
        </div>
        <Button variant="outline" onClick={searchStudents} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Students Found</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Fees</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(students.reduce((s, x) => s + (x.totalFeesAcrossContracts || 0), 0))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Paid</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(students.reduce((s, x) => s + (x.totalPaidAcrossContracts || 0), 0))}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
          <CardDescription>Search by student ID or name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Enter student ID or name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={20} /> Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              {error ? 'Failed to load data.' : searchTerm ? 'No students found matching your search.' : 'No students with contracts yet.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Contracts</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Has Active Contract</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.studentName || '—'}</TableCell>
                    <TableCell>{student.contractCount}</TableCell>
                    <TableCell>{formatCurrency(student.totalFeesAcrossContracts)}</TableCell>
                    <TableCell className="text-green-700 font-medium">{formatCurrency(student.totalPaidAcrossContracts)}</TableCell>
                    <TableCell className="text-red-600 font-medium">{formatCurrency(student.totalRemainingAcrossContracts)}</TableCell>
                    <TableCell>
                      {student.hasActiveContract
                        ? <span className="text-green-600 font-semibold">Yes</span>
                        : <span className="text-gray-400">No</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/contracts?student=${student.studentId}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View Contracts
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}