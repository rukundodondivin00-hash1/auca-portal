import axios from 'axios';

// Contract System Backend (Port 8083) - for contracts and payments
const contractApi = axios.create({
  baseURL: import.meta.env.VITE_CONTRACT_API_URL || 'http://localhost:8083',
  headers: {
    'Content-Type': 'application/json',
  },
  responseType: 'json' as const,
});

contractApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// IMS Registration Backend (Port 8080) - for registration, auth, courses
const imsApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  responseType: 'json' as const,
});

imsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID';
  penaltyAmount: number;
}

export interface Penalty {
  id: string;
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

export interface Term {
  id: string;
  active: boolean;
}

export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  fee: number;
}

export interface ContractStatusUpdate {
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Auth - IMS Backend
export const authApi = {
  login: (credentials: any) => imsApi.post('/api/auth/login', credentials),
};

export const adminAuthApi = {
  login: (credentials: any) => contractApi.post('/api/admin/login', credentials),
};

// Student Dashboard - IMS Backend with X-Student-Id header
export const studentApi = {
  getDashboard: () => {
    const studentId = localStorage.getItem('student_id') || '';
    return imsApi.get('/api/auth/login', {
      headers: { 'X-Student-Id': studentId }
    });
  },
  createContract: (payload: any) => contractApi.post('/api/contracts', payload),
  getMyContracts: () => contractApi.get('/api/contracts/my-contracts'),
};

// Finance - IMS Backend
export const paymentApi = {
  getMyBalance: (studentId: string) => 
    imsApi.get('/api/v1/finance/student-payments/my-balance', {
      headers: { 'X-Student-Id': studentId }
    }),
  processPayment: (studentId: string, data: { amount: number; transactionId?: string }) => 
    imsApi.post('/api/v1/finance/student-payments/pay', data, {
      headers: { 'X-Student-Id': studentId }
    }),
};

// Registration - IMS Backend
export const registrationApi = {
  getTerm: () => imsApi.get<Term>('/api/v1/registration/term'),
  getAvailableCourses: () => imsApi.get<Course[]>('/api/v1/registration/available-courses'),
  submitRegistration: (studentId: string, courseIds: number[]) => 
    imsApi.post('/api/v1/registration/submit', courseIds, {
      headers: { 'X-Student-Id': studentId }
    }),
};

// Admin Academic - IMS Backend
export const adminAcademicApi = {
  addCourse: (course: Partial<Course>) => imsApi.post<Course>('/api/v1/admin/academic/courses', course),
  activateTerm: (termId: string) => imsApi.put(`/api/v1/admin/academic/terms/${termId}/activate`),
};

// Admin - Contract System Backend
export const adminApi = {
  getContracts: (page = 0, size = 20, sortBy = 'createdAt', direction = 'desc') =>
    contractApi.get<PaginatedResponse<Contract>>('/api/admin/contracts', { params: { page, size, sortBy, direction } }),

  getContract: (id: string) =>
    contractApi.get<Contract>(`/api/admin/contracts/${id}`),

  getContractsByStudent: (studentId: string) =>
    contractApi.get<PaginatedResponse<Contract>>(`/api/admin/contracts/student/${studentId}`),

  getContractsByStatus: (status: string) =>
    contractApi.get<PaginatedResponse<Contract>>(`/api/admin/contracts/status/${status}`),

  getInstallments: (page = 0, size = 20) =>
    contractApi.get<PaginatedResponse<Installment>>('/api/admin/installments', { params: { page, size } }),

  getInstallmentsByContract: (contractId: string) =>
    contractApi.get<Installment[]>(`/api/admin/installments/contract/${contractId}`),

  getPenalties: (page = 0, size = 20) =>
    contractApi.get<PaginatedResponse<Penalty>>('/api/admin/penalties', { params: { page, size } }),

  getPenaltiesByContract: (contractId: string) =>
    contractApi.get<Penalty[]>(`/api/admin/penalties/contract/${contractId}`),

  searchStudents: (keyword = '', page = 0, size = 20) =>
    contractApi.get<PaginatedResponse<StudentSummary>>('/api/admin/students', { params: { keyword, page, size } }),

  getStudentSummary: (studentId: string) =>
    contractApi.get<StudentSummary>(`/api/admin/students/${studentId}/summary`),

  updateContractStatus: (id: string, data: ContractStatusUpdate) =>
    contractApi.patch(`/api/admin/contracts/${id}/status`, data),

  deleteContract: (id: string) =>
    contractApi.delete(`/api/admin/contracts/${id}`),

  updateInstallmentStatus: (id: string, status: 'PAID' | 'PENDING') =>
    contractApi.patch(`/api/admin/installments/${id}/status`, { status }),

  waiveInstallmentPenalty: (id: string) =>
    contractApi.post(`/api/admin/installments/${id}/waive-penalty`),
};

export default { contractApi, imsApi };