export const DEMO_MODE_KEY = 'auca_demo_mode';
export const DEMO_DEBT_KEY = 'auca_demo_debt';

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

export function setDemoMode(enabled: boolean) {
  localStorage.setItem(DEMO_MODE_KEY, enabled ? 'true' : 'false');
}

export interface DemoStudent {
  studentName: string;
  studentId: string;
}

export interface DemoFinancial {
  totalFees: number;
  amountPaid: number;
  remainingBalance: number;
  paidPercentage: number;
  activeTerm: string;
  isEligibleForContract: boolean;
}

export interface DemoInstallment {
  id: string;
  contractId: string;
  installmentNumber: number;
  deadlineDate: string;
  amountDue: number;
  amountPaid: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  penaltyAmount: number;
  paidDate?: string;
}

export interface DemoContract {
  id: string;
  studentId: string;
  studentName: string;
  termId: string;
  academicYear: string;
  semester: string;
  totalFees: number;
  balanceAtSigning: number;
  amountPaidAtSigning: number;
  signaturePayment: number;
  remainingAtSigning: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  agreed: boolean;
  agreedDate: string | null;
  createdAt: string;
  installments: DemoInstallment[];
}

export function getDemoPaymentMade(): number {
  const raw = localStorage.getItem(DEMO_DEBT_KEY);
  return raw ? Number(JSON.parse(raw).amountPaid) : 0;
}

export function setDemoPaymentMade(amount: number) {
  localStorage.setItem(DEMO_DEBT_KEY, JSON.stringify({ amountPaid: amount }));
}

export function resetDemoPayment() {
  localStorage.removeItem(DEMO_DEBT_KEY);
}

export function getDemoDashboard(): { student: DemoStudent; financial: DemoFinancial; contract: { hasContract: boolean } } {
  const paymentMade = getDemoPaymentMade();
  const totalFees = 1500000;
  const remainingBalance = totalFees - paymentMade;
  const paidPercentage = Math.round((paymentMade / totalFees) * 100);
  
  return {
    student: {
      studentName: 'Jean Baptiste Nkurunziza',
      studentId: '25306',
    },
    financial: {
      totalFees,
      amountPaid: paymentMade,
      remainingBalance,
      paidPercentage,
      activeTerm: '2025/1',
      isEligibleForContract: paidPercentage >= 50,
    },
    contract: { hasContract: false },
  };
}

export function createDemoContract(installments: { amount: string; date: string }[]): DemoContract {
  const student = getDemoDashboard().student;
  const financial = getDemoDashboard().financial;
  const now = new Date().toISOString();
  const contractId = crypto.randomUUID();

const mappedInstallments: DemoInstallment[] = installments.map((inst, i) => ({
    id: crypto.randomUUID(),
    contractId,
    installmentNumber: i + 1,
    deadlineDate: inst.date,
    amountDue: Number(inst.amount),
    amountPaid: 0,
    status: 'PENDING',
    penaltyAmount: 0,
  }));

  const contract: DemoContract = {
    id: contractId,
    studentId: student.studentId,
    studentName: student.studentName,
    termId: '2025/1',
    academicYear: '2025',
    semester: 'September',
    totalFees: financial.totalFees,
    balanceAtSigning: -financial.remainingBalance,
    amountPaidAtSigning: financial.amountPaid,
    signaturePayment: financial.amountPaid,
    remainingAtSigning: financial.remainingBalance,
    status: 'ACTIVE',
    agreed: true,
    agreedDate: now.split('T')[0],
    createdAt: now,
    installments: mappedInstallments,
  };

  localStorage.setItem('auca_demo_contract', JSON.stringify(contract));
  return contract;
}

export function getDemoContract(): DemoContract | null {
  const raw = localStorage.getItem('auca_demo_contract');
  return raw ? (JSON.parse(raw) as DemoContract) : null;
}

export function simulateDemoPayment(installmentId: string): DemoContract | null {
  const contract = getDemoContract();
  if (!contract) return null;

  const installment = contract.installments.find(i => i.id === installmentId);
  if (!installment || installment.status === 'PAID') return contract;

installment.status = 'PAID';
  installment.amountPaid = installment.amountDue;
  installment.paidDate = new Date().toISOString();

  const allPaid = contract.installments.every(i => i.status === 'PAID');
  if (allPaid) {
    contract.status = 'COMPLETED';
  }

  localStorage.setItem('auca_demo_contract', JSON.stringify(contract));
  return contract;
}

export function resetDemoMode() {
  localStorage.removeItem('auca_demo_contract');
  localStorage.removeItem(DEMO_MODE_KEY);
  localStorage.removeItem(DEMO_DEBT_KEY);
}
