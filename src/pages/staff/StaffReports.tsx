import { useState, useEffect } from 'react';
import { staffApi, registrationApi } from '@/lib/api';
import { 
  FileText, Search, Loader2, Printer, Filter, AlertCircle, 
  CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { format } from 'date-fns';

export default function StaffReports() {
  const [activeTab, setActiveTab] = useState<'payments' | 'contracts' | 'penalties'>('payments');
  const [studentIdFilter, setStudentIdFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  
  // Advanced filters
  const [balanceFilter, setBalanceFilter] = useState('');
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [payments, setPayments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [studentDepartments, setStudentDepartments] = useState<Record<string, string>>({});

  // Add debounce to the filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(studentIdFilter.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [studentIdFilter]);

  useEffect(() => {
    fetchData();
  }, [activeTab, debouncedFilter, balanceFilter, overdueFilter, departmentFilter, academicYearFilter, dateFilter]);

  const loadDepartmentsForStudents = async (studentIds: string[], termId: string = '2025/1') => {
    const uniqueIds = Array.from(new Set(studentIds)).filter(id => id && !studentDepartments[id]);
    if (uniqueIds.length === 0) return;
    
    try {
      const newDepts: Record<string, string> = { ...studentDepartments };
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const regRes = await registrationApi.getMyRegistration(id, termId);
            if (regRes.data?.studentDepartment) {
              newDepts[id] = regRes.data.studentDepartment;
            } else {
              newDepts[id] = 'Unknown';
            }
          } catch (e) {
             newDepts[id] = 'Unknown';
          }
        })
      );
      setStudentDepartments(newDepts);
    } catch (e) {
      console.error('Error fetching departments', e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contracts') {
        let fetchedContracts = [];
        if (debouncedFilter) {
          const res = await staffApi.getContractsByStudent(debouncedFilter);
          fetchedContracts = res.data.content || [];
        } else {
          const res = await staffApi.getContracts(0, 100, 'createdAt', 'desc');
          fetchedContracts = res.data.content || [];
        }
        
        // Fetch departments
        await loadDepartmentsForStudents(fetchedContracts.map((c: any) => c.studentId));
        
        // Apply local filters
        if (balanceFilter) {
          const targetBalance = parseFloat(balanceFilter);
          if (!isNaN(targetBalance)) {
             // Let's filter contracts with balance <= target balance for flexibility, or exact. The user said "a balance of 500K". Let's do exact match or within 1 RWF due to float.
             // Actually, doing exact match.
             fetchedContracts = fetchedContracts.filter((c: any) => Math.abs(c.totalFees - (c.totalPaidOnInstallments || 0) - targetBalance) < 1 || Math.abs(c.totalFees - targetBalance) < 1);
          }
        }
        if (overdueFilter) {
          fetchedContracts = fetchedContracts.filter((c: any) => c.status === 'OVERDUE');
        }
        if (departmentFilter) {
          const q = departmentFilter.toLowerCase();
          fetchedContracts = fetchedContracts.filter((c: any) => {
             const dept = studentDepartments[c.studentId] || '';
             return dept.toLowerCase().includes(q);
          });
        }
        if (academicYearFilter) {
          const q = academicYearFilter.toLowerCase();
          fetchedContracts = fetchedContracts.filter((c: any) => 
            (c.academicYear && c.academicYear.toLowerCase().includes(q)) || 
            (c.termId && c.termId.toLowerCase().includes(q))
          );
        }
        if (dateFilter) {
          fetchedContracts = fetchedContracts.filter((c: any) => {
             const date = c.createdAt || '';
             return date.startsWith(dateFilter);
          });
        }
        
        setContracts(fetchedContracts);

      } else if (activeTab === 'penalties') {
        const res = await staffApi.getPenalties(0, 100);
        let fetchedPenalties = res.data.content || [];
        if (debouncedFilter) {
          const q = debouncedFilter.toLowerCase();
          fetchedPenalties = fetchedPenalties.filter((p: any) => 
            (p.studentId && p.studentId.toLowerCase().includes(q)) || 
            (p.studentName && p.studentName.toLowerCase().includes(q))
          );
        }
        
        await loadDepartmentsForStudents(fetchedPenalties.map((p: any) => p.studentId));
        if (departmentFilter) {
          const q = departmentFilter.toLowerCase();
          fetchedPenalties = fetchedPenalties.filter((p: any) => {
             const dept = studentDepartments[p.studentId] || '';
             return dept.toLowerCase().includes(q);
          });
        }
        if (academicYearFilter) {
          const q = academicYearFilter.toLowerCase();
          fetchedPenalties = fetchedPenalties.filter((p: any) => 
            (p.academicYear && p.academicYear.toLowerCase().includes(q)) || 
            (p.termId && p.termId.toLowerCase().includes(q))
          );
        }
        if (dateFilter) {
          fetchedPenalties = fetchedPenalties.filter((p: any) => {
             const date = p.createdAt || '';
             return date.startsWith(dateFilter);
          });
        }
        setPenalties(fetchedPenalties);
        
      } else if (activeTab === 'payments') {
        const res = await staffApi.getInstallments(0, 100);
        let fetchedInstallments = res.data.content || [];
        if (debouncedFilter) {
          const q = debouncedFilter.toLowerCase();
          fetchedInstallments = fetchedInstallments.filter((i: any) => 
            (i.studentId && i.studentId.toLowerCase().includes(q)) || 
            (i.studentName && i.studentName.toLowerCase().includes(q))
          );
        }
        
        await loadDepartmentsForStudents(fetchedInstallments.map((i: any) => i.studentId));
        
        if (overdueFilter) {
          fetchedInstallments = fetchedInstallments.filter((i: any) => i.status === 'OVERDUE');
        }
        if (departmentFilter) {
          const q = departmentFilter.toLowerCase();
          fetchedInstallments = fetchedInstallments.filter((i: any) => {
             const dept = studentDepartments[i.studentId] || '';
             return dept.toLowerCase().includes(q);
          });
        }
        if (academicYearFilter) {
          const q = academicYearFilter.toLowerCase();
          fetchedInstallments = fetchedInstallments.filter((i: any) => 
            (i.academicYear && i.academicYear.toLowerCase().includes(q)) || 
            (i.termId && i.termId.toLowerCase().includes(q))
          );
        }
        if (dateFilter) {
          fetchedInstallments = fetchedInstallments.filter((i: any) => {
             const date = i.paidAt || i.dueDate || i.createdAt || '';
             return date.startsWith(dateFilter);
          });
        }
        
        setPayments(fetchedInstallments);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID':
      case 'ACTIVE':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> {status}</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Clock size={12} /> {status}</span>;
      case 'OVERDUE':
      case 'APPLIED':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><AlertCircle size={12} /> {status}</span>;
      case 'WAIVED':
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><XCircle size={12} /> {status}</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in print:max-w-none print:m-0 print:p-0 print:space-y-4">
      {/* Header - Hides on print to replace with a cleaner print header */}
      <div className="bg-[#00447b] text-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText size={24} /> System Reports</h1>
          <p className="text-blue-100 text-sm mt-1">View and print student financial records</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-white text-[#00447b] px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
        >
          <Printer size={18} /> Print Report
        </button>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block text-center border-b-2 border-[#00447b] pb-4 mb-6">
        <h1 className="text-2xl font-bold text-[#00447b] uppercase">AUCA Financial Report</h1>
        <p className="text-gray-500 font-medium mt-1">
          {activeTab === 'payments' && 'Payment History Report'}
          {activeTab === 'contracts' && 'Contracts Taken Report'}
          {activeTab === 'penalties' && 'Penalties Provided Report'}
        </p>
        {debouncedFilter && <p className="text-sm font-bold mt-1 text-gray-800">Filtered by Student ID: {debouncedFilter}</p>}
        <p className="text-xs text-gray-400 mt-1">Generated on: {format(new Date(), 'PPpp')}</p>
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4 print:hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'payments' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Payment History
            </button>
            <button 
              onClick={() => setActiveTab('contracts')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'contracts' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Contracts Taken
            </button>
            <button 
              onClick={() => setActiveTab('penalties')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'penalties' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Penalties Provided
            </button>
          </div>

          <div className="relative w-full lg:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by Student ID or Name..."
              value={studentIdFilter}
              onChange={(e) => setStudentIdFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {studentIdFilter && (
              <button 
                onClick={() => setStudentIdFilter('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 items-end">
          <div className="flex items-center gap-2 text-gray-600 mr-2">
            <Filter size={16} />
            <span className="text-sm font-medium">Advanced Filters:</span>
          </div>
          
          <div className="flex flex-col gap-1 w-48">
            <label className="text-xs text-gray-500 font-medium">Department</label>
            <input
              type="text"
              placeholder="e.g. Software Engineering"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {(activeTab === 'contracts' || activeTab === 'payments') && (
            <div className="flex flex-col gap-1 w-32">
              <label className="text-xs text-gray-500 font-medium">Balance (exact)</label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-1 w-32">
            <label className="text-xs text-gray-500 font-medium">Academic Year</label>
            <input
              type="text"
              placeholder="e.g. 2024"
              value={academicYearFilter}
              onChange={(e) => setAcademicYearFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1 w-40">
            <label className="text-xs text-gray-500 font-medium">Specific Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
            />
          </div>

          <div className="flex items-center gap-2 pb-1.5 ml-2">
            <input
              type="checkbox"
              id="overdueFilter"
              checked={overdueFilter}
              onChange={(e) => setOverdueFilter(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="overdueFilter" className="text-sm text-gray-700 cursor-pointer select-none">
              Show Overdue Only
            </label>
          </div>
          
          {(departmentFilter || balanceFilter || overdueFilter || academicYearFilter || dateFilter) && (
            <button
              onClick={() => {
                setDepartmentFilter('');
                setBalanceFilter('');
                setOverdueFilter(false);
                setAcademicYearFilter('');
                setDateFilter('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 ml-auto pb-1 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none">
        
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p>Generating report data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* PAYMENTS TABLE */}
            {activeTab === 'payments' && (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 print:bg-white print:border-b-2 print:border-gray-800 print:text-black">
                  <tr>
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Installment</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                  {payments.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No payment records found.</td></tr>
                  ) : (
                    payments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                        <td className="px-6 py-3 font-medium text-blue-600 print:text-black">{p.studentId || '-'}</td>
                        <td className="px-6 py-3 text-gray-900 print:text-black">{p.studentName || '-'}</td>
                        <td className="px-6 py-3 text-gray-600 print:text-black">Inst. #{p.installmentNumber}</td>
                        <td className="px-6 py-3 font-medium text-gray-900 print:text-black">{formatCurrency(p.amount)}</td>
                        <td className="px-6 py-3 print:hidden">{getStatusBadge(p.status)}</td>
                        <td className="px-6 py-3 hidden print:table-cell">{p.status}</td>
                        <td className="px-6 py-3 text-gray-600 print:text-black">{formatDate(p.paidAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* CONTRACTS TABLE */}
            {activeTab === 'contracts' && (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 print:bg-white print:border-b-2 print:border-gray-800 print:text-black">
                  <tr>
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Term</th>
                    <th className="px-6 py-4">Total Fees</th>
                    <th className="px-6 py-4">Signed Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                  {contracts.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No contracts found.</td></tr>
                  ) : (
                    contracts.map((c, idx) => (
                      <tr key={c.id || idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                        <td className="px-6 py-3 font-medium text-blue-600 print:text-black">{c.studentId}</td>
                        <td className="px-6 py-3 text-gray-900 print:text-black">{c.studentName}</td>
                        <td className="px-6 py-3 text-gray-600 print:text-black">{c.termId}</td>
                        <td className="px-6 py-3 font-medium text-gray-900 print:text-black">{formatCurrency(c.totalFees)}</td>
                        <td className="px-6 py-3 text-gray-600 print:text-black">{formatDate(c.createdAt)}</td>
                        <td className="px-6 py-3 print:hidden">{getStatusBadge(c.status)}</td>
                        <td className="px-6 py-3 hidden print:table-cell">{c.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* PENALTIES TABLE */}
            {activeTab === 'penalties' && (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 print:bg-white print:border-b-2 print:border-gray-800 print:text-black">
                  <tr>
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Penalty Amount</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Total Due</th>
                    <th className="px-6 py-4">Date Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                  {penalties.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No penalty records found.</td></tr>
                  ) : (
                    penalties.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                        <td className="px-6 py-3 font-medium text-blue-600 print:text-black">{p.studentId || '-'}</td>
                        <td className="px-6 py-3 text-gray-900 print:text-black">{p.studentName || '-'}</td>
                        <td className="px-6 py-3 font-medium text-red-600 print:text-black">{formatCurrency(p.penaltyAmount)}</td>
                        <td className="px-6 py-3 text-gray-600 print:text-black max-w-xs truncate" title={p.reason}>{p.reason}</td>
                        <td className="px-6 py-3 text-gray-900 print:text-black font-semibold">{formatCurrency(p.newAmount)}</td>
                        <td className="px-6 py-3 text-gray-600 print:text-black">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      
      <div className="hidden print:block mt-8 text-center text-sm text-gray-500">
        --- End of Report ---
      </div>
    </div>
  );
}
