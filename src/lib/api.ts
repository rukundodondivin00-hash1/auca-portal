import axios from 'axios';

// 1. Axios Instance Configuration
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. JWT Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Interfaces (DTOs)
export interface Contract {
  id: string;
  studentId: string;
  studentName: string;
  termId: string;
  academicYear: string;
  semester: string;
  totalFees: number;
  balanceAtSigning: number;
  amountPaidAtSigning: number;
  remainingAtSigning: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  agreed: boolean;
  agreedDate: string | null;
  createdAt: string;
  updatedAt: string;
  installmentCount: number;
  totalPaidOnInstallments: number;
  totalPenaltyOnInstallments: number;
}

export interface Installment {
  id: string;
  contractId: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  penaltyAmount: number;
}

export interface Penalty {
  id: string;
  installmentId: string;
  contractId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface StudentSummary {
  studentId: string;
  studentName: string;
  contractCount: number;
  totalFeesAcrossContracts: number;
  totalPaidAcrossContracts: number;
  totalRemainingAcrossContracts: number;
  hasActiveContract: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ContractStatusUpdate {
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
}

// ==========================================
// 4. API ENDPOINTS
// ==========================================

// --- AUTH API ---
export const authApi = {
  login: (credentials: any) => api.post('/api/auth/login', credentials),
};

// --- STUDENT API ---
export const studentApi = {
  getDashboard: () => api.get('/api/dashboard'),
  createContract: (payload: any) => api.post('/api/contracts', payload),
  getMyContracts: () => api.get('/api/contracts/my-contracts'),
};

// --- ADMIN API ---
export const adminApi = {
  // Contracts
  getContracts: (page = 0, size = 20, sortBy = 'createdAt', direction = 'desc') => 
    api.get<PaginatedResponse<Contract>>('/api/admin/contracts', { params: { page, size, sortBy, direction } }),
  
  getContract: (id: string) => 
    api.get<Contract>(`/api/admin/contracts/${id}`),
  
  getContractsByStudent: (studentId: string) => 
    api.get<Contract[]>(`/api/admin/contracts/student/${studentId}`),
  
  getContractsByStatus: (status: string) => 
    api.get<Contract[]>(`/api/admin/contracts/status/${status}`),

  // Installments
  getInstallments: (page = 0, size = 20, sortBy = 'createdAt', direction = 'desc') => 
    api.get<PaginatedResponse<Installment>>('/api/admin/installments', { params: { page, size, sortBy, direction } }),

  getInstallmentsByContract: (contractId: string) => 
    api.get<Installment[]>(`/api/admin/installments/contract/${contractId}`),

  // Penalties
  getPenalties: (page = 0, size = 20, sortBy = 'createdAt', direction = 'desc') => 
    api.get<PaginatedResponse<Penalty>>('/api/admin/penalties', { params: { page, size, sortBy, direction } }),

  getPenaltiesByInstallment: (installmentId: string) => 
    api.get<Penalty[]>(`/api/admin/penalties/installment/${installmentId}`),

  getPenaltiesByContract: (contractId: string) => 
    api.get<Penalty[]>(`/api/admin/penalties/contract/${contractId}`),

  // Students
  searchStudents: (keyword = '', page = 0, size = 20) => 
    api.get<PaginatedResponse<StudentSummary>>('/api/admin/students', { params: { keyword, page, size } }),

  getStudentSummary: (studentId: string) => 
    api.get<StudentSummary>(`/api/admin/students/${studentId}/summary`),

  // --- MUTATIONS (UPDATE/DELETE) ---
  // Note: These map to standard REST conventions. Ensure your backend has corresponding @PutMapping, @PatchMapping, or @PostMapping endpoints for these.
  updateContractStatus: (id: string, data: ContractStatusUpdate) => 
    api.patch(`/api/admin/contracts/${id}/status`, data),

  deleteContract: (id: string) => 
    api.delete(`/api/admin/contracts/${id}`),

  bulkUpdateContractStatus: (contractIds: string[], status: string) => 
    api.patch('/api/admin/contracts/bulk-status', { contractIds, status }),

  updateInstallmentStatus: (id: string, status: 'PAID' | 'PENDING') => 
    api.patch(`/api/admin/installments/${id}/status`, { status }),

  waiveInstallmentPenalty: (id: string) => 
    api.post(`/api/admin/installments/${id}/waive-penalty`),
};

export default api;