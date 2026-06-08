import React, { useState } from 'react';
import { Link, useLocation } from 'react-router'; 
import { 
  Pin, TrendingUp, Award, BookOpen, DollarSign, 
  Bell, MessageSquare, Settings, LogOut, GraduationCap,
  FileSignature, FileText, Calendar 
} from 'lucide-react';

export default function Sidebar() {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const [hasContract, setHasContract] = useState(() => localStorage.getItem('demo_installmentPlan') !== null);

  // Check and sync hasContract state
  React.useEffect(() => {
    const handleStorageChange = () => {
      setHasContract(localStorage.getItem('demo_installmentPlan') !== null);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('paymentUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('paymentUpdated', handleStorageChange);
    };
  }, []);

  const isExpanded = isPinned || isHovered;

  return (
    <aside 
      className={`relative h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col shrink-0 ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo & Pin Section */}
      <div className="flex items-center justify-between p-4 h-16 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="text-blue-900 bg-blue-100 p-1.5 rounded-full min-w-[32px] flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
          <div className={`font-bold text-xs text-blue-900 leading-tight transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            ADVENTIST UNIVERSITY<br/>OF CENTRAL AFRICA
          </div>
        </Link>
        
        {/* Pin Button */}
        {isExpanded && (
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
          >
            <Pin size={16} className={isPinned ? "fill-current text-gray-700" : ""} />
          </button>
        )}
      </div>

      {/* Navigation Links - Scrollable Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-6 p-3 mt-4">
        
        {/* Student Portal Section */}
        <div>
          <p className={`text-xs font-semibold text-gray-400 mb-2 px-2 transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            STUDENT PORTAL
          </p>
          <ul className="space-y-1">
            <NavItem 
              icon={<TrendingUp size={20} />} 
              label="My Dashboard" 
              href="/student-dashboard" 
              isActive={location.pathname === '/student-dashboard' || location.pathname === '/dashboard' || location.pathname === '/'} 
              isExpanded={isExpanded} 
            />
            <NavItem 
              icon={<Award size={20} />} 
              label="Transcript" 
              href="/my-transcript" 
              isActive={location.pathname === '/my-transcript'} 
              isExpanded={isExpanded} 
            />
            <NavItem 
              icon={<Calendar size={20} />} 
              label="Registration" 
              href="/my-registration" 
              isActive={location.pathname === '/my-registration'} 
              isExpanded={isExpanded} 
            />
            <NavItem 
              icon={<BookOpen size={20} />} 
              label="Academic Bulletin" 
              href="/my-bulletin" 
              isActive={location.pathname === '/my-bulletin'} 
              isExpanded={isExpanded} 
            />
            <NavItem 
              icon={<DollarSign size={20} />} 
              label="My Fees" 
              href="/my-fees" 
              isActive={location.pathname === '/my-fees'} 
              isExpanded={isExpanded} 
            />
            {!hasContract && (
              <NavItem 
                icon={<FileSignature size={20} />} 
                label="Sign Contract" 
                href="/contract" 
                isActive={location.pathname === '/contract'} 
                isExpanded={isExpanded} 
              />
            )}
            <NavItem 
              icon={<FileText size={20} />} 
              label="Contract Details" 
              href="/contract-details" 
              isActive={location.pathname === '/contract-details'} 
              isExpanded={isExpanded} 
            />
          </ul>
        </div>

        {/* Communication Section */}
        <div>
          <p className={`text-xs font-semibold text-gray-400 mb-2 px-2 transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            COMMUNICATION
          </p>
          <ul className="space-y-1">
            <NavItem icon={<Bell size={20} />} label="Announcements" href="/announcements" isActive={location.pathname === '/announcements'} isExpanded={isExpanded} />
            <NavItem icon={<MessageSquare size={20} />} label="Chat" href="/chat" isActive={location.pathname === '/chat'} isExpanded={isExpanded} />
          </ul>
        </div>

      </div>

      {/* Footer Links (Settings & Logout) */}
      <div className="p-3 border-t border-gray-200 space-y-1 shrink-0">
        <NavItem icon={<Settings size={20} />} label="Settings" href="/settings" isActive={location.pathname === '/settings'} isExpanded={isExpanded} />
        {/* Updated Logout link to point to /login */}
        <NavItem icon={<LogOut size={20} />} label="Logout" href="/login" isActive={location.pathname === '/login'} isExpanded={isExpanded} />
      </div>
    </aside>
  );
}

// Reusable Navigation Item Component
function NavItem({ icon, label, href = "#", isActive = false, isExpanded }: { icon: React.ReactNode, label: string, href?: string, isActive?: boolean, isExpanded: boolean }) {
  return (
    <li>
      <Link 
        to={href} 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors whitespace-nowrap
          ${isActive 
            ? 'bg-[#00447b] text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
      >
        <span className="min-w-[20px] shrink-0">{icon}</span>
        <span className={`text-sm transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
          {label}
        </span>
      </Link>
    </li>
  );
}