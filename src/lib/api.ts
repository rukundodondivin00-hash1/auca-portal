import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
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

const mockStudents: Record<string, {password: string; paymentMade: number; hasContract: boolean; studentName: string; studentId: string}> = {
  "25306": { password: "password", paymentMade: 220000, hasContract: false, studentName: "Musengimana Fabrice", studentId: "25306" },
  "25307": { password: "password", paymentMade: 300000, hasContract: true, studentName: "Ishimwe Alice", studentId: "25307" },
  "25308": { password: "password", paymentMade: 566103, hasContract: false, studentName: "Nkundimana Bob", studentId: "25308" },
  "25309": { password: "password", paymentMade: 0, hasContract: false, studentName: "Uwimana Claire", studentId: "25309" },
  "25310": { password: "password", paymentMade: 283051, hasContract: false, studentName: "Mugisha David", studentId: "25310" },
};

const generateDemoContracts = (): Contract[] => {
  const contracts: Contract[] = [];
  Object.values(mockStudents).forEach((student, index) => {
    const totalFees = 566103;
    const paymentMade = student.paymentMade;
    const hasContract = student.hasContract || index % 2 === 0;
    
    contracts.push({
      id: `contract-${student.studentId}`,
      studentId: student.studentId,
      studentName: student.studentName,
      termId: "2025/1",
      academicYear: "2025",
      semester: "1",
      totalFees,
      balanceAtSigning: hasContract ? totalFees - Math.floor(totalFees * 0.5) : totalFees,
      amountPaidAtSigning: hasContract ? Math.floor(totalFees * 0.5) : 0,
      remainingAtSigning: hasContract ? Math.floor(totalFees * 0.5) : totalFees,
      status: hasContract ? 'ACTIVE' : (index % 3 === 0 ? 'PENDING' : (index % 3 === 1 ? 'OVERDUE' : 'COMPLETED')),
      agreed: hasContract,
      agreedDate: hasContract ? '2025-01-15' : null,
      createdAt: '2025-01-10T10:00:00',
      updatedAt: '2025-01-15T14:30:00',
      installmentCount: hasContract ? 2 : 0,
      totalPaidOnInstallments: hasContract ? paymentMade - Math.floor(totalFees * 0.5) : paymentMade,
      totalPenaltyOnInstallments: hasContract && index % 4 === 0 ? 7500 : 0,
    });
  });
  return contracts;
};

const demoContracts = generateDemoContracts();

const generateDemoInstallments = (contractId: string): Installment[] => {
  const contract = demoContracts.find(c => c.id === contractId);
  if (!contract?.agreed) return [];
  
  return [
    {
      id: `installment-${contractId}-1`,
      contractId,
      amount: Math.floor(contract.remainingAtSigning / 2),
      dueDate: '2025-06-30',
      paidDate: null,
      status: 'PENDING' as const,
      penaltyAmount: 3000,
    },
    {
      id: `installment-${contractId}-2`,
      contractId,
      amount: Math.ceil(contract.remainingAtSigning / 2),
      dueDate: '2025-07-31',
      paidDate: null,
      status: 'PENDING' as const,
      penaltyAmount: 0,
    },
  ];
};

const demoInstallments = demoContracts
  .filter(c => c.agreed)
  .flatMap(c => generateDemoInstallments(c.id));

const demoPenalties: Penalty[] = demoInstallments
  .filter(i => i.penaltyAmount > 0)
  .map((i, idx) => ({
    id: `penalty-${idx}`,
    installmentId: i.id,
    contractId: i.contractId,
    amount: i.penaltyAmount,
    reason: 'Late payment',
    createdAt: '2025-06-15T10:00:00',
  }));

export const adminApi = {
  getContracts: (page = 0, size = 20): Promise<{ data: PaginatedResponse<Contract> }> => {
    const all = [...demoContracts];
    const start = page * size;
    return Promise.resolve({
      data: {
        content: all.slice(start, start + size),
        totalElements: all.length,
        totalPages: Math.ceil(all.length / size),
        number: page,
        size,
      }
    });
  },

  getContract: (id: string): Promise<{ data: Contract }> => {
    const contract = demoContracts.find(c => c.id === id);
    return Promise.resolve({ data: contract! });
  },

  getContractsByStudent: (studentId: string): Promise<{ data: PaginatedResponse<Contract> }> => {
    const all = demoContracts.filter(c => c.studentId === studentId);
    return Promise.resolve({
      data: {
        content: all,
        totalElements: all.length,
        totalPages: 1,
        number: 0,
        size: 20,
      }
    });
  },

  getContractsByStatus: (status: string): Promise<{ data: PaginatedResponse<Contract> }> => {
    const all = demoContracts.filter(c => c.status === status);
    return Promise.resolve({
      data: {
        content: all,
        totalElements: all.length,
        totalPages: 1,
        number: 0,
        size: 20,
      }
    });
  },

  updateContractStatus: (id: string, data: ContractStatusUpdate): Promise<any> => {
    const idx = demoContracts.findIndex(c => c.id === id);
    if (idx >= 0) demoContracts[idx].status = data.status;
    return Promise.resolve({ data: null });
  },

  deleteContract: (id: string): Promise<any> => {
    const idx = demoContracts.findIndex(c => c.id === id);
    if (idx >= 0) demoContracts.splice(idx, 1);
    return Promise.resolve({ data: null });
  },

  bulkUpdateContractStatus: (contractIds: string[], status: string): Promise<any> => {
    contractIds.forEach(id => {
      const idx = demoContracts.findIndex(c => c.id === id);
      if (idx >= 0) demoContracts[idx].status = status as any;
    });
    return Promise.resolve({ data: null });
  },

  getInstallments: (): Promise<{ data: PaginatedResponse<Installment> }> => {
    return Promise.resolve({
      data: {
        content: demoInstallments,
        totalElements: demoInstallments.length,
        totalPages: 1,
        number: 0,
        size: 20,
      }
    });
  },

  getInstallmentsByContract: (contractId: string): Promise<{ data: Installment[] }> => {
    return Promise.resolve({ data: demoInstallments.filter(i => i.contractId === contractId) });
  },

  updateInstallmentStatus: (id: string, status: 'PAID' | 'PENDING'): Promise<any> => {
    const idx = demoInstallments.findIndex(i => i.id === id);
    if (idx >= 0) demoInstallments[idx].status = status;
    return Promise.resolve({ data: null });
  },

  waiveInstallmentPenalty: (id: string): Promise<any> => {
    const idx = demoInstallments.findIndex(i => i.id === id);
    if (idx >= 0) demoInstallments[idx].penaltyAmount = 0;
    return Promise.resolve({ data: null });
  },

  getPenalties: (): Promise<{ data: PaginatedResponse<Penalty> }> => {
    return Promise.resolve({
      data: {
        content: demoPenalties,
        totalElements: demoPenalties.length,
        totalPages: 1,
        number: 0,
        size: 20,
      }
    });
  },

  getPenaltiesByInstallment: (installmentId: string): Promise<{ data: Penalty[] }> => {
    return Promise.resolve({ data: demoPenalties.filter(p => p.installmentId === installmentId) });
  },

  getPenaltiesByContract: (contractId: string): Promise<{ data: Penalty[] }> => {
    return Promise.resolve({ data: demoPenalties.filter(p => p.contractId === contractId) });
  },

  searchStudents: (keyword = ''): Promise<{ data: PaginatedResponse<StudentSummary> }> => {
    const all = Object.values(mockStudents)
      .filter(s => s.studentId.includes(keyword) || s.studentName.toLowerCase().includes(keyword.toLowerCase()))
      .map(s => {
        const contract = demoContracts.find(c => c.studentId === s.studentId);
        return {
          studentId: s.studentId,
          studentName: s.studentName,
          contractCount: contract ? 1 : 0,
          totalFeesAcrossContracts: contract?.totalFees || 0,
          totalPaidAcrossContracts: contract?.amountPaidAtSigning + contract?.totalPaidOnInstallments || 0,
          totalRemainingAcrossContracts: contract?.remainingAtSigning - contract?.totalPaidOnInstallments || 0,
          hasActiveContract: !!contract?.agreed && contract.status === 'ACTIVE',
        };
      });
    return Promise.resolve({
      data: {
        content: all,
        totalElements: all.length,
        totalPages: 1,
        number: 0,
        size: 20,
      }
    });
  },

  getStudentSummary: (studentId: string): Promise<{ data: StudentSummary }> => {
    const student = mockStudents[studentId];
    const contract = demoContracts.find(c => c.studentId === studentId);
    if (!student) throw new Error('Student not found');
    return Promise.resolve({
      data: {
        studentId: student.studentId,
        studentName: student.studentName,
        contractCount: contract ? 1 : 0,
        totalFeesAcrossContracts: contract?.totalFees || 0,
        totalPaidAcrossContracts: contract ? contract.amountPaidAtSigning + contract.totalPaidOnInstallments : 0,
        totalRemainingAcrossContracts: contract ? contract.remainingAtSigning - contract.totalPaidOnInstallments : 0,
        hasActiveContract: !!contract?.agreed && contract.status === 'ACTIVE',
      }
    });
  },
};

export default api;