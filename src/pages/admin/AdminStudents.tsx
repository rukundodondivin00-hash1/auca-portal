import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Search, RefreshCw, Eye } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { StudentSummary } from '@/lib/api';

export default function AdminStudents() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm) {
      searchStudents();
    }
  }, [debouncedTerm]);

  const searchStudents = async () => {
    if (!debouncedTerm.trim()) return;
    setLoading(true);
    try {
      const response = await adminApi.searchStudents(debouncedTerm);
      setStudents(response.data.content);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  const totalStudents = students.length;
  const totalFees = students.reduce((sum, s) => sum + s.totalFeesAcrossContracts, 0);
  const totalPaid = students.reduce((sum, s) => sum + s.totalPaidAcrossContracts, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Overview</h1>
          <p className="text-gray-500 mt-1">View student financial summaries (read-only)</p>
        </div>
        <Button variant="outline" onClick={searchStudents} disabled={!debouncedTerm.trim()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Statistics */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Students Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            </CardContent>
          </Card>
        </div>
      )}

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">Loading students...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Contracts</TableHead>
                      <TableHead>Total Fees</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Has Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{student.studentId}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.contractCount}</TableCell>
                        <TableCell>{formatCurrency(student.totalFeesAcrossContracts)}</TableCell>
                        <TableCell>{formatCurrency(student.totalPaidAcrossContracts)}</TableCell>
                        <TableCell>{formatCurrency(student.totalRemainingAcrossContracts)}</TableCell>
                        <TableCell>
                          {student.hasActiveContract ? (
                            <span className="text-green-600 font-medium">Yes</span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/admin/students/${student.studentId}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && students.length === 0 && debouncedTerm && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No students found matching "{debouncedTerm}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}