import { useState, useEffect } from 'react';
import { Search, House, ChevronRight, Bell, Calendar, ChevronDown, LogOut } from "lucide-react";
import { useNavigate, useLocation } from 'react-router';

import { imsApi, registrationApi } from '@/lib/api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export interface NotificationMessage {
  title: string;
  message: string;
  type: 'WARNING' | 'PENALTY' | 'INFO';
  contractId: string;
  studentId: string;
  timestamp: string;
}
export default function Header() {
  const userRole = localStorage.getItem('user_role');
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

  const [studentName] = useState(() => {
    if (isAdmin) {
      return localStorage.getItem('admin_name') || 'Administrator';
    }
    return localStorage.getItem('student_name') || 'Student';
  });
  
  const studentId = localStorage.getItem('student_id') || '25306';
  
  const [registeredTermId, setRegisteredTermId] = useState<string | null>(null);
  const [termName, setTermName] = useState<string | null>(null);
  const [termOpen, setTermOpen] = useState<boolean | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>(() => {
    const saved = localStorage.getItem(`notifications_${studentId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (studentId) {
      localStorage.setItem(`notifications_${studentId}`, JSON.stringify(notifications.slice(0, 50))); // keep max 50
    }
  }, [notifications, studentId]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get page name from current route for breadcrumb
  const pageName = (() => {
    const p = location.pathname.replace(/^\//, '') || 'student-dashboard';
    const labels: Record<string, string> = {
      'student-dashboard': 'Dashboard',
      'dashboard': 'Dashboard',
      'my-registration': 'Course Registration',
      'my-fees': 'My Fees',
      'my-transcript': 'My Transcript',
      'contract': 'Sign Contract',
      'contract-details': 'Contract Details',
      'my-bulletin': 'Academic Bulletin',
      'announcements': 'Announcements',
      'chat': 'Chat',
      'settings': 'Settings',
    };
    return labels[p] || p;
  })();

  useEffect(() => {

    const fetchHeaderData = async () => {
      if (isAdmin) return; // Admins don't need to fetch term data for themselves
      try {
        // Get student registration to show their term in the header
        const regRes = await imsApi.get('/api/v1/registration/my-registration', {
          headers: { 'X-Student-Id': studentId }
        });
        if (regRes.status === 200 && regRes.data) {
          setRegisteredTermId(regRes.data.termId || null);
        }

        // Check if term registration is currently open (for badge color)
        const termRes = await registrationApi.getTerm();
        if (termRes.status === 200 && termRes.data) {
          setTermOpen(true);
          setTermName(termRes.data.name || termRes.data.description || termRes.data.id || null);
        } else {
          setTermOpen(false);
        }
      } catch {
        // Silently fail — header badge is non-critical
      }
    };

    fetchHeaderData();
  }, [studentId, isAdmin]);

  useEffect(() => {
    if (isAdmin || !studentId) return;

    const contractApiUrl = import.meta.env.VITE_CONTRACT_API_URL || 'http://localhost:8088';
    
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${contractApiUrl}/ws/notifications`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket notifications');
        stompClient.subscribe(`/topic/notifications/${studentId}`, (msg) => {
          if (msg.body) {
            const newNotification: NotificationMessage = JSON.parse(msg.body);
            setNotifications((prev) => [newNotification, ...prev]);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [isAdmin, studentId]);

  const initials = studentName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('student_id');
    localStorage.removeItem('student_name');
    localStorage.removeItem('admin_name');
    navigate(isAdmin ? '/admin/login' : '/login');
  };

  return (
    <header className="bg-white border-b border-gray-200/80 px-3 lg:px-4 py-2 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-10 lg:pl-0">
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
            <button
              onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/student-dashboard')}
              className="text-gray-400 hover:text-blue-600 transition-colors shrink-0"
            >
              <House size={15} />
            </button>
            <span className="flex items-center gap-1.5 min-w-0">
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
              <span className="font-medium text-gray-900 truncate">{pageName}</span>
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Search */}
          <button className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all text-gray-400 hover:text-gray-600 w-32 sm:w-52 lg:w-64">
            <Search size={14} className="shrink-0 text-gray-400" />
            <span className="flex-1 text-left text-xs text-gray-400 truncate">Search or navigate...</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 font-mono shrink-0">Ctrl+/</kbd>
          </button>

          {/* Term Badge - Hidden for Admins */}
          {!isAdmin && (
            <div className="hidden sm:flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
              <Calendar size={15} className="text-blue-600 shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-900 uppercase">
                  {termName || registeredTermId || '—'}
                </span>
                {registeredTermId && (
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    termOpen
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${termOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {termOpen ? 'Open' : 'Closed'}
                  </span>
                )}
              </div>
            </div>
          )}

          {!isAdmin && <div className="w-px h-7 bg-gray-200 hidden sm:block" />}

          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative p-1.5 rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowDropdown(false);
              }}
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif, idx) => (
                      <div key={idx} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                            notif.type === 'PENALTY' ? 'bg-red-500' :
                            notif.type === 'WARNING' ? 'bg-orange-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(notif.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Student Profile Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 p-1 rounded-lg transition-all duration-150 hover:bg-gray-50"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{studentName}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{isAdmin ? 'Administrator' : 'Student'}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{studentName}</p>
                  {!isAdmin && <p className="text-xs text-gray-500">ID: {studentId}</p>}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
