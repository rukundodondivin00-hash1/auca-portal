import { Routes, Route } from "react-router"; 
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import WelcomeBanner from "./components/WelcomeBanner";
import StatsCards from "./components/StatsCards";
import QuickActions from "./components/QuickActions";
import GpaChart from "./components/GpaChart";
import CreditsChart from "./components/CreditsChart";
import MyFees from "./components/MyFees";
import ContractPage from "./components/ContractPage"; 
import ContractDetails from "./components/ContractDetails"; // 1. Import the new details page
import MyTranscript from "./components/MyTranscript"; 
import MyRegistration from "./components/MyRegistration"; 
import Login from "./components/authentication/Login"; 

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

      <Route path="/*" element={
        <div className="flex h-screen bg-gray-50 overflow-hidden">
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