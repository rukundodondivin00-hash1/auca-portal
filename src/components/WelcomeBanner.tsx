import { useState } from "react";
import { ArrowUpRight, FileSignature } from "lucide-react";
import { Link } from "react-router"; 
import InitiatePaymentModal from "./InitiatePaymentModal";

export default function WelcomeBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white overflow-hidden shadow-sm">
      <div className="p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
            R
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">Welcome back, Rukundo!</h1>
            <p className="text-blue-100 text-sm">Student ID: 25306</p>
            <p className="text-blue-100 text-xs mt-0.5">
              Networks and Communication Systems • NET
            </p>
          </div>
          
          {/* Action Buttons Container */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            
            {/* New Contract Button */}
            <Link
              to="/contract"
              className="inline-flex items-center gap-2 rounded-md border border-blue-300/30 bg-blue-800/50 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700/50 cursor-pointer"
            >
              <FileSignature size={16} />
              Sign Contract
            </Link>

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