import axios from 'axios';

// Contract System Backend (Port 8088) - for contracts and payments
export const contractApi = axios.create({
  baseURL: import.meta.env.VITE_CONTRACT_API_URL || 'http://localhost:8088',
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

// IMS Registration Backend - for registration, auth, courses
export const imsApi = axios.create({
  baseURL: import.meta.env.VITE_IMS_API_URL || 'https://auca-ims.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-ims-api-key': 'e779dd9128baca1d06ddcbaa32e897057dc8328910539b0162b82f96ca2777ff'
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
  installmentId?: string;
  contractId?: string;
  studentName?: string;
  previousAmount?: number;
  penaltyAmount?: number;
  newAmount?: number;
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
  registrationOpen?: boolean;
  preregistrationOpen?: boolean;
}

export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  fee: number;
  capacity?: number;
  group?: string;
  lecturerCode?: string;
  day?: string;
  startTime?: string;
}

export interface ContractStatusUpdate {
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Local mock API for admin (Port 8085)
export const localMockApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8085',
  headers: {
    'Content-Type': 'application/json',
  },
  responseType: 'json' as const,
});

localMockApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth - IMS API (External for Students)
export const authApi = {
  login: (credentials: any) => imsApi.post('/api/v1/common/auth/signin', credentials),
};

// Admin Auth - Local Mock API
export const adminAuthApi = {
  login: (credentials: any) => localMockApi.post('/api/v1/common/auth/signin', credentials),
};

// Student Dashboard - IMS Backend with X-Student-Id header
export const studentApi = {
  getDashboard: () => {
    const studentId = localStorage.getItem('student_id') || '';
    return imsApi.get('/api/v1/common/student/dashboard', {
      headers: { 'X-Student-Id': studentId }
    });
  },
  createContract: (payload: any) => contractApi.post('/api/contracts', payload),
  getMyContracts: () => contractApi.get('/api/contracts/my-contracts'),
  getMyPenalties: () => contractApi.get('/api/contracts/my-penalties'),
  getTermConfig: async (termId: string) => {
    const res = await contractApi.get('/api/contracts/term-config');
    const config = res.data?.find((c: any) => c.termId === termId);
    if (!config) throw new Error("Config not found");
    return { data: config };
  },
};

// Finance - IMS Backend
export const paymentApi = {
  getMyBalance: (studentId: string) =>
    contractApi.get('/api/payments/my-balance'),
  processPayment: (studentId: string, data: { amount: number; transactionId?: string }) =>
    contractApi.post('/api/payments/confirm', data),
  getStudentFees: (studentId: string) =>
    imsApi.get(`/api/v1/finance/student-payments/${studentId}/fees`),
};

// Registration - IMS Backend
export const registrationApi = {
  getTerm: () => imsApi.get<Term>('/api/v1/registration/term'),
  getMyRegistration: (studentId: string, termId: string) => 
    imsApi.get(`/api/v1/registration/registration?termId=${termId}&studentId=${studentId}`),
  // Map to the new API path for courses in current term (paginated by default, so we might need .data.content)
  getAvailableCourses: () => imsApi.get<any>('/api/v1/registration/course/current-term?size=100'),
  // Map submit to the new API if possible, or leave as is if they just meant Term logic. 
  // Let's assume there's a bulk submit or just keep the old one and see if it works. 
  // I will use /api/v1/registration/registration/add-course-self or keep submit if it's there. 
  // Actually, the new API has /api/v1/registration/registration/add-course-self. Let's keep /submit for now but the user said "use the term from the api". 
  submitRegistration: (studentId: string, courseIds: number[]) =>
    imsApi.post('/api/v1/registration/submit', courseIds, {
      headers: { 'X-Student-Id': studentId }
    }),
};

// Admin Academic - IMS Backend (Colleague's API)
export const adminAcademicApi = {
  getAllTerms: () =>
    imsApi.get('/api/v1/registration/term/all?size=500'),
  addCourse: (course: Partial<Course> & { termId?: string }) => 
    imsApi.post<Course>(`/api/v1/registration/course?termId=${course.termId}`, course),
  activateTerm: (termId: string) => 
    imsApi.post(`/api/v1/registration/term/set-active?id=${termId}`),
  openRegistration: (termId: string) => 
    imsApi.patch(`/api/v1/registration/term/preregistration/open?termId=${termId}`),
  closeRegistration: () => 
    imsApi.patch(`/api/v1/registration/term/preregistration/close`),
  getCourses: (termId: string) => 
    imsApi.get(`/api/v1/registration/registration/terms/${termId}/courses`),
  deleteCourse: (courseId: number) => 
    imsApi.delete(`/api/v1/registration/course?courseId=${courseId}`),
  getAllCourses: () =>
    imsApi.get(`/api/v1/academics/course/all?size=2000`),
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

  getTermConfig: async (termId: string) => {
    const res = await contractApi.get('/api/admin/term-config');
    const config = res.data?.find((c: any) => c.termId === termId);
    if (!config) throw new Error("Config not found");
    return { data: config };
  },
    
  saveTermConfig: (data: { termId: string; maxInstallments: number; penaltyPercentage: number }) =>
    contractApi.post('/api/admin/term-config', data),
};

export default { contractApi, imsApi };