import { useState, useEffect } from "react";
import { ArrowUpRight, FileSignature, Loader2 } from "lucide-react";
import { Link } from "react-router"; 
import InitiatePaymentModal from "./InitiatePaymentModal";
import { studentApi } from "@/lib/api";
import { getDemoContract, isDemoMode } from "@/lib/demo-mode";

export default function WelcomeBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [hasContract, setHasContract] = useState(false);

  const fetchData = () => {
    if (isDemoMode()) {
      const demoContract = getDemoContract();
      setHasContract(!!demoContract);
      setStudentName('Demo Student');
      setStudentId('25307');
      setTotalAmount(1500000);
      setLoading(false);
      return;
    }

    studentApi.getDashboard()
      .then(res => {
        const data = res.data?.data;
        const student = data?.student || data;
        const contract = data?.contract;
        
        setStudentName(student?.studentName || student?.name || student?.fullName || data?.studentName || data?.fullName || localStorage.getItem('student_name') || "");
        setStudentId(student?.studentId || student?.id || student?.username || data?.studentId || data?.id || data?.username || localStorage.getItem('student_id') || "");
        setTotalAmount(data?.financial?.totalFees || 0);
        setHasContract(contract && (contract.hasContract || contract.id));
      })
      .catch(() => {
        const demoContract = getDemoContract();
        setHasContract(!!demoContract);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white p-5 flex justify-center items-center h-24">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white overflow-hidden shadow-sm">
      <div className="p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">Welcome back, {studentName.split(' ')[0]}!</h1>
            <p className="text-blue-100 text-sm">Student ID: {studentId}</p>
            <p className="text-blue-100 text-xs mt-0.5">
              Networks and Communication Systems • NET
            </p>
          </div>
          
          <div className="ml-auto flex items-center gap-3 shrink-0">
            {!hasContract && (
              <Link
                to="/contract"
                className="inline-flex items-center gap-2 rounded-md border border-blue-300/30 bg-blue-800/50 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700/50 cursor-pointer"
              >
                <FileSignature size={16} />
                Sign Contract
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm transition-colors hover:bg-gray-50 cursor-pointer"
            >
              Pay Now
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <InitiatePaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onPaymentSuccess={() => {
          setTimeout(fetchData, 100);
        }}
      />
    </div>
  );
}