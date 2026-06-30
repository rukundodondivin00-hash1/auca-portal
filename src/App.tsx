import { Routes, Route, Navigate } from "react-router";
import Sidebar from "./components/Sidebar";
import StaffSidebar from "./components/staff/StaffSidebar";
import Header from "./components/Header";
import WelcomeBanner from "./components/WelcomeBanner";
import StatsCards from "./components/StatsCards";
import QuickActions from "./components/QuickActions";
import GpaChart from "./components/GpaChart";
import CreditsChart from "./components/CreditsChart";
import MyFees from "./components/MyFees";
import ContractPage from "./components/ContractPage"; 
import ContractDetails from "./components/ContractDetails";
import MyTranscript from "./components/MyTranscript"; 
import MyRegistration from "./components/MyRegistration"; 
import MyExamPermit from "./components/MyExamPermit";
import MyBulletin from "./components/MyBulletin"; 
import Login from "./components/authentication/Login"; 
import Settings from "./components/Settings";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffContracts from "./pages/staff/StaffContracts";
import StaffContractDetails from "./pages/staff/StaffContractDetails";
import StaffPenalties from "./pages/staff/StaffPenalties";
import StaffTermConfig from "./pages/staff/StaffTermConfig";
import StaffSettings from "./pages/staff/StaffSettings";
import StaffReports from "./pages/staff/StaffReports";
import { Toaster } from "./components/ui/sonner";
import { DashboardProvider } from "./components/DashboardContext";

function StaffAuthWrapper({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
  const isStaff = userRole === 'ROLE_STAFF' || userRole === 'STAFF' || userRole === 'ADMIN';
  
  if (!token) {
    return <Navigate to="/staff/login" replace />;
  }
  
  if (!isStaff) {
    return <Navigate to="/staff/login" replace />;
  }
  
  return <>{children}</>;
}

import { useWebsocketNotifications } from "./hooks/useWebsocketNotifications";

function StudentAuthWrapper({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
  const isStudent = userRole === 'ROLE_STUDENT' || userRole === 'STUDENT';
  const studentId = typeof window !== 'undefined' ? localStorage.getItem('student_id') : null;
  
  useWebsocketNotifications(isStudent ? studentId : null);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole === 'ROLE_STAFF' || userRole === 'STAFF' || userRole === 'ADMIN') {
    return <Navigate to="/staff/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function DashboardHome() {
  return (
    <DashboardProvider>
      <div className="space-y-6">
        <WelcomeBanner />
        <StatsCards />
        <QuickActions />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GpaChart />
          <CreditsChart />
        </div>
      </div>
    </DashboardProvider>
  );
}

export default function App() {
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('jwt_token') : false;
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to={hasToken ? "/student-dashboard" : "/login"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/staff/login" element={<Navigate to="/login" replace />} />

      <Route path="/staff/*" element={
        <StaffAuthWrapper>
          <div className="flex h-screen bg-gray-50 overflow-hidden">
            <StaffSidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto">
                <div className="p-4 lg:p-6 max-w-[1560px] mx-auto">
                  <Routes>
                    <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
                    <Route path="/dashboard" element={<StaffDashboard />} />
                    <Route path="/contracts" element={<StaffContracts />} />
                    <Route path="/contracts/:id" element={<StaffContractDetails />} />
                    <Route path="/penalties" element={<StaffPenalties />} />
                    <Route path="/reports" element={<StaffReports />} />
                    <Route path="/term-config" element={<StaffTermConfig />} />
                    <Route path="/settings" element={<StaffSettings />} />
                  </Routes>
                </div>
              </main>
            </div>
            <Toaster />
          </div>
        </StaffAuthWrapper>
      } />

      <Route path="/*" element={
        <StudentAuthWrapper>
          <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible">
            <Sidebar />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden print:overflow-visible">
              <Header />

              <main className="flex-1 overflow-auto print:overflow-visible">
                <div className="p-4 lg:p-6 max-w-[1560px] mx-auto print:p-0">
                  
                  <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/student-dashboard" element={<DashboardHome />} />
                    <Route path="/dashboard" element={<DashboardHome />} />
                    
                    <Route path="/my-fees" element={<MyFees />} />
                    <Route path="/my-transcript" element={<MyTranscript />} />
                    <Route path="/my-registration" element={<MyRegistration />} />
                    <Route path="/my-exam-permit" element={<MyExamPermit />} />
                    
                    <Route path="/my-bulletin" element={<MyBulletin />} />
                    
<Route path="/contract" element={<ContractPage />} />
                     <Route path="/contract-details" element={<ContractDetails />} />
                     <Route path="/announcements" element={<div className="p-6 bg-white rounded-lg border shadow-sm"><h2 className="text-xl font-bold">Announcements</h2><p className="text-gray-500 mt-2">View important announcements from the university.</p></div>} />
                     <Route path="/chat" element={<div className="p-6 bg-white rounded-lg border shadow-sm"><h2 className="text-xl font-bold">Chat</h2><p className="text-gray-500 mt-2">Communicate with academic advisors and staff.</p></div>} />
                     <Route path="/settings" element={<Settings />} />
                    
                  </Routes>

                </div>
              </main>
            </div>
          </div>
        </StudentAuthWrapper>
      } />
    </Routes>
  );
}