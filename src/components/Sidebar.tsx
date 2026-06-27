import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Pin, TrendingUp, Award, BookOpen, DollarSign, Bell, MessageSquare, Settings, LogOut, GraduationCap, FileSignature, FileText, Calendar, CreditCard } from 'lucide-react';
import { studentApi, registrationApi } from '@/lib/api';
import aucaLogo from '@/images/AUCA-logo.png';

export default function Sidebar() {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [hasContract, setHasContract] = useState(false);
  const [loadingContract, setLoadingContract] = useState(true);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  useEffect(() => {
    const checkContractStatus = async () => {
      try {
        const studentId = localStorage.getItem('student_id') || '';
        const response = await studentApi.getDashboard();
        const data = response.data?.data || response.data;
        setHasContract(!!data?.contract);
      } catch (error) {
        setHasContract(false);
      } finally {
        setLoadingContract(false);
      }
    };

    const checkRegistrationStatus = async () => {
      try {
        const response = await registrationApi.getTerm();
        if (response.data && response.data.active) {
          setIsRegistrationOpen(true);
        }
      } catch (error) {
        setIsRegistrationOpen(false);
      }
    };

    checkContractStatus();
    checkRegistrationStatus();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('student_id');
    localStorage.removeItem('student_name');
    sessionStorage.clear();
    navigate('/login');
  };

  const isExpanded = isPinned || isHovered;

  return (
    <aside 
      className={`relative h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col shrink-0 ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between p-4 h-16 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="flex items-center justify-center h-8 w-8 min-w-[32px]">
            <img src={aucaLogo} alt="AUCA Logo" className="object-contain w-full h-full" />
          </div>
          <div className={`font-bold text-xs text-blue-900 leading-tight transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            ADVENTIST UNIVERSITY<br/>OF CENTRAL AFRICA
          </div>
        </Link>
        {isExpanded && (
          <button onClick={() => setIsPinned(!isPinned)} className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0">
            <Pin size={16} className={isPinned ? "fill-current text-gray-700" : ""} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-6 p-3 mt-4">
        <div>
          <p className={`text-xs font-semibold text-gray-400 mb-2 px-2 transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>STUDENT PORTAL</p>
          <ul className="space-y-1">
            <NavItem icon={<TrendingUp size={20} />} label="My Dashboard" href="/student-dashboard" isActive={['/student-dashboard', '/dashboard', '/'].includes(location.pathname)} isExpanded={isExpanded} />
            <NavItem icon={<Award size={20} />} label="Transcript" href="/my-transcript" isActive={location.pathname === '/my-transcript'} isExpanded={isExpanded} />
            
            {isRegistrationOpen && (
              <NavItem icon={<Calendar size={20} />} label="Registration" href="/my-registration" isActive={location.pathname === '/my-registration'} isExpanded={isExpanded} />
            )}
            
            <NavItem icon={<BookOpen size={20} />} label="Academic Bulletin" href="/my-bulletin" isActive={location.pathname === '/my-bulletin'} isExpanded={isExpanded} />
            <NavItem icon={<DollarSign size={20} />} label="My Fees" href="/my-fees" isActive={location.pathname === '/my-fees'} isExpanded={isExpanded} />
            {!loadingContract && !hasContract && (
              <NavItem icon={<FileSignature size={20} />} label="Sign Contract" href="/contract" isActive={location.pathname === '/contract'} isExpanded={isExpanded} />
            )}
            <NavItem icon={<FileText size={20} />} label="Contract Details" href="/contract-details" isActive={location.pathname === '/contract-details'} isExpanded={isExpanded} />
            <NavItem icon={<CreditCard size={20} />} label="Exam Permit" href="/my-exam-permit" isActive={location.pathname === '/my-exam-permit'} isExpanded={isExpanded} />
          </ul>
        </div>
      </div>

      <div className="p-3 border-t border-gray-200 space-y-1 shrink-0">
        <NavItem icon={<Settings size={20} />} label="Settings" href="/settings" isActive={location.pathname === '/settings'} isExpanded={isExpanded} />
        <button onClick={handleLogout} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors whitespace-nowrap text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full`}>
          <span className="min-w-[20px] shrink-0"><LogOut size={20} /></span>
          <span className={`text-sm transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, href = "#", isActive = false, isExpanded }: { 
  icon: React.ReactNode, 
  label: string, 
  href?: string, 
  isActive?: boolean, 
  isExpanded: boolean 
}) {
  return (
    <li>
      <Link to={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors whitespace-nowrap ${isActive ? 'bg-[#00447b] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
        <span className="min-w-[20px] shrink-0">{icon}</span>
        <span className={`text-sm transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>{label}</span>
      </Link>
    </li>
  );
}