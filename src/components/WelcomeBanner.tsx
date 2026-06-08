import { useState, useEffect } from "react";
import { ArrowUpRight, FileSignature } from "lucide-react";
import { Link } from "react-router"; 
import InitiatePaymentModal from "./InitiatePaymentModal";

export default function WelcomeBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasContract, setHasContract] = useState(() => localStorage.getItem('demo_installmentPlan') !== null);
  
  // Get student info from localStorage (set during login)
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('demo_studentName') || "Rukundo";
  });
  const [studentId, setStudentId] = useState(() => {
    return localStorage.getItem('demo_studentId') || "25306";
  });
  
  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setHasContract(localStorage.getItem('demo_installmentPlan') !== null);
      const name = localStorage.getItem('demo_studentName');
      const id = localStorage.getItem('demo_studentId');
      if (name) setStudentName(name);
      if (id) setStudentId(id);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('paymentUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('paymentUpdated', handleStorageChange);
    };
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white overflow-hidden shadow-sm">
      <div className="p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
            {studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">Welcome back, {studentName}!</h1>
            <p className="text-blue-100 text-sm">Student ID: {studentId}</p>
            <p className="text-blue-100 text-xs mt-0.5">
              Networks and Communication Systems • NET
            </p>
          </div>
          
{/* Action Buttons Container */}
           <div className="ml-auto flex items-center gap-3 shrink-0">
            
            {/* Sign Contract Button - Only shown if no contract exists */}
            {!hasContract && (
              <Link
                to="/contract"
                className="inline-flex items-center gap-2 rounded-md border border-blue-300/30 bg-blue-800/50 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700/50 cursor-pointer"
              >
                <FileSignature size={16} />
                Sign Contract
              </Link>
            )}

            {/* Existing Pay Now Button */}
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
      />
    </div>
  );
}