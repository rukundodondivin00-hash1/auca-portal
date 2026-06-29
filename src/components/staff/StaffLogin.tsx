import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { staffAuthApi } from '@/lib/api';
import aucaLogo from '@/images/AUCA-logo.png';

interface LoginResponse {
  token: string;
  role: string;
  username?: string;
  fullName?: string;
  staffName?: string;
}

const generateMockToken = (username: string, role: string) => {
  return btoa(JSON.stringify({ username, role, exp: Date.now() + 3600000 }));
};

export default function StaffLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(location.state?.message || null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await staffAuthApi.login({
        username: email, 
        password: password
      });

      const data: LoginResponse = response.data?.data || response.data || {};
      const token = data?.token;
      const role = data?.role;

      if (role) {
        const mockToken = token || generateMockToken(email, role);
        localStorage.setItem('jwt_token', mockToken);
        const normalizedRole = role === 'STUDENT' ? 'ROLE_STUDENT' : role;
        localStorage.setItem('user_role', normalizedRole);
        if (data.staffName) localStorage.setItem('staff_name', data.staffName);
        else if (data.fullName) localStorage.setItem('staff_name', data.fullName);
        navigate(normalizedRole === 'ROLE_STAFF' || normalizedRole === 'STAFF' || normalizedRole === 'ADMIN' ? '/staff/dashboard' : '/student-dashboard');
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (error: any) {
      setErrorMessage("Invalid staff credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_24%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#020617_100%)] px-4 py-2 sm:px-6 sm:py-4 lg:px-8 lg:py-8">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50 filter brightness-90 contrast-[1.05]" 
          style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/AUCA_Masoro_Campus.jpg/1200px-AUCA_Masoro_Campus.jpg')", transform: "scale(1.02)" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/30 to-slate-950/90"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="animate-fade-in-slow">
          <div className="w-full">
            <div className="relative mx-auto flex max-w-4xl flex-col items-stretch overflow-hidden rounded-3xl bg-transparent lg:flex-row lg:min-h-[420px]">
              
              <div className="relative hidden min-h-[420px] flex-1 items-center justify-center overflow-hidden border-r border-white/20 bg-slate-900/40 lg:flex lg:rounded-l-3xl backdrop-blur-sm">
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 py-8 text-center">
                  <div className="relative h-28 w-28 shrink-0 md:h-32 md:w-32 bg-white rounded-full p-2 flex items-center justify-center shadow-2xl">
                    <img 
                      alt="AUCA logo" 
                      className="object-contain w-full h-full" 
                      src={aucaLogo} 
                    />
                  </div>
                  <div className="mt-6 space-y-1">
                    <h3 className="text-lg font-semibold text-white tracking-wide">AUCA Staff Portal</h3>
                    <p className="text-sm italic text-white/90">Staff Dashboard</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex items-stretch">
                <div className="w-full h-full flex">
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl sm:p-8 lg:rounded-l-none lg:rounded-r-3xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
                    
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.04),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.02),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(30,41,59,0.2),transparent_38%)]"></div>
                    
                    <div className="relative z-10 w-full flex-1 flex flex-col justify-center">
                      
                      <div className="mb-6 flex items-center justify-center lg:hidden">
                        <div className="relative h-16 w-16 bg-blue-50 rounded-full p-2">
                          <img 
                            alt="logo" 
                            className="object-contain w-full h-full" 
                            src={aucaLogo} 
                          />
                        </div>
                      </div>

                      <div className="mx-auto w-full max-w-[400px]">
                        <div className="mb-6 text-center">
                          <h2 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">Staff Sign In</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Access staff portal</p>
                        </div>
                        
                        <div className="mb-6 h-px bg-slate-200/80 dark:bg-slate-800/80"></div>

                        {message && (
                          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-start gap-2 text-sm">
                            <AlertCircle className="shrink-0 mt-0.5" size={16} />
                            <p>{message}</p>
                          </div>
                        )}

                        {errorMessage && (
                          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
                            <AlertCircle className="shrink-0 mt-0.5" size={16} />
                            <p>{errorMessage}</p>
                          </div>
                        )}
                        
                        <form onSubmit={handleLogin} className="space-y-5">
                          <div>
                            <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-300">
                              Staff Email
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                              <input 
                                id="email" 
                                type="text" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required 
                                placeholder="Enter staff email"
                                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500" 
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-300">
                              Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                              <input 
                                id="password" 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required 
                                placeholder="Enter your password"
                                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-12 pr-12 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500" 
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50 dark:hover:text-slate-200 transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>

                          <button 
                            type="submit" 
                            disabled={isLoading}
                            className="group mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-600 hover:to-blue-500 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Authenticating...
                              </>
                            ) : (
                              <>
                                Sign In
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                          Don't have a staff account?{' '}
                          <button 
                            onClick={() => navigate('/signup')} 
                            className="font-medium text-blue-600 hover:text-blue-700"
                          >
                            Sign up
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} AUCA • Staff Portal
          </p>
        </div>
      </div>
    </div>
  );
}