import { Routes, Route, Navigate } from "react-router";
import { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import AdminSidebar from "./components/admin/AdminSidebar";
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
import Login from "./components/authentication/Login"; 
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContracts from "./pages/admin/AdminContracts";
import AdminContractDetails from "./pages/admin/AdminContractDetails";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStudentDetails from "./pages/admin/AdminStudentDetails";
import AdminPenalties from "./pages/admin/AdminPenalties";
import { Toaster } from "./components/ui/sonner";

// Auth wrapper component
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 'ROLE_ADMIN') {
    return <Navigate to="/student-dashboard" replace />;
  }
  
  return <>{children}</>;
}

function StudentAuthWrapper({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole === 'ROLE_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Reset demo state on fresh page load (not soft navigation)
function DemoReset() {
  useEffect(() => {
    const isFreshLoad = sessionStorage.getItem('demo_initialized');
    if (!isFreshLoad) {
      localStorage.removeItem('demo_paymentMade');
      localStorage.removeItem('demo_installmentPlan');
      localStorage.removeItem('demo_installmentPayments');
      sessionStorage.setItem('demo_initialized', 'true');
    }
  }, []);
  return null;
}

// Create a small component for your Dashboard content to keep the routes clean
function DashboardHome() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <StatsCards />
      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GpaChart />
        <CreditsChart />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Routes - Protected by admin role */}
      <Route path="/admin/*" element={
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          <AdminSidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <main className="flex-1 overflow-auto">
              <div className="p-4 lg:p-6 max-w-[1560px] mx-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/contracts" element={<AdminContracts />} />
                  <Route path="/contracts/:id" element={<AdminContractDetails />} />
                  <Route path="/students" element={<AdminStudents />} />
                  <Route path="/students/:studentId" element={<AdminStudentDetails />} />
                  <Route path="/penalties" element={<AdminPenalties />} />
                </Routes>
              </div>
            </main>
          </div>
          <Toaster />
        </div>
      } />

      <Route path="/*" element={
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          <DemoReset />
          <Sidebar />

          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header />

            <main className="flex-1 overflow-auto">
              <div className="p-4 lg:p-6 max-w-[1560px] mx-auto">
                
                <Routes>
                  {/* Dashboard Routes */}
                  <Route path="/" element={<DashboardHome />} />
                  <Route path="/student-dashboard" element={<DashboardHome />} />
                  <Route path="/dashboard" element={<DashboardHome />} />
                  
                  {/* Core Student Pages */}
                  <Route path="/my-fees" element={<MyFees />} />
                  <Route path="/my-transcript" element={<MyTranscript />} />
                  <Route path="/my-registration" element={<MyRegistration />} />
                  
                  {/* Bulletin Placeholder */}
                  <Route path="/my-bulletin" element={
                    <div className="p-6 bg-white rounded-lg border shadow-sm">
                      <h2 className="text-xl font-bold">Academic Bulletin</h2>
                      <p className="text-gray-500 mt-2">This section allows you to view the detailed academic bulletin.</p>
                    </div>
                  } />
                  
                  {/* Contract Routes */}
                  <Route path="/contract" element={<ContractPage />} />
                  
                  {/* 2. Link the actual ContractDetails page here */}
                  <Route path="/contract-details" element={<ContractDetails />} />
                  
                </Routes>

              </div>
            </main>
          </div>
        </div>
      } />
    </Routes>
  );
}