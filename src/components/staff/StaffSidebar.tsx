import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  Pin, LayoutDashboard, FileSignature, Users, 
  History, Settings, LogOut, GraduationCap, BookOpen, FileText 
} from 'lucide-react';
import aucaLogo from '@/images/AUCA-logo.png';

export default function StaffSidebar() {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('staff_name');
    sessionStorage.clear();
    navigate('/staff/login');
  };

  const isExpanded = isPinned || isHovered;

  return (
    <aside 
      className={`relative h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col shrink-0 print:hidden ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between p-4 h-16 shrink-0">
        <Link to="/staff/dashboard" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="flex items-center justify-center h-8 w-8 min-w-[32px]">
            <img src={aucaLogo} alt="AUCA Logo" className="object-contain w-full h-full" />
          </div>
          <div className={`font-bold text-xs text-blue-900 leading-tight transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            FINANCE STAFF<br/>PORTAL
          </div>
        </Link>
        
        {isExpanded && (
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
          >
            <Pin size={16} className={isPinned ? "fill-current text-gray-700" : ""} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-6 p-3 mt-4">
        <div>
          <p className={`text-xs font-semibold text-gray-400 mb-2 px-2 transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            STAFF PANEL
          </p>
          <ul className="space-y-1">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              href="/staff/dashboard" 
              isActive={location.pathname === '/staff/dashboard'} 
              isExpanded={isExpanded} 
            />
            <NavItem 
              icon={<FileSignature size={20} />} 
              label="Contracts" 
              href="/staff/contracts" 
              isActive={location.pathname === '/staff/contracts'} 
              isExpanded={isExpanded} 
            />
            <NavItem 
              icon={<BookOpen size={20} />} 
              label="Term Config" 
              href="/staff/term-config" 
              isActive={location.pathname === '/staff/term-config'} 
              isExpanded={isExpanded} 
            />
            <NavItem 
              icon={<History size={20} />} 
              label="Penalties" 
              href="/staff/penalties" 
              isActive={location.pathname === '/staff/penalties'} 
              isExpanded={isExpanded} 
            />
            <NavItem 
              icon={<FileText size={20} />} 
              label="Reports" 
              href="/staff/reports" 
              isActive={location.pathname === '/staff/reports'} 
              isExpanded={isExpanded} 
            />
          </ul>
        </div>
      </div>

      <div className="p-3 border-t border-gray-200 space-y-1 shrink-0">
        <NavItem 
          icon={<Settings size={20} />} 
          label="Settings" 
          href="/staff/settings" 
          isActive={location.pathname === '/staff/settings'} 
          isExpanded={isExpanded} 
        />
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