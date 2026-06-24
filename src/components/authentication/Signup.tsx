import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, ChevronRight, GraduationCap, Building } from 'lucide-react';
import { authApi, adminAuthApi } from '../../lib/api';

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      if (role === 'STUDENT') {
        await authApi.signup({
          username,
          fullName,
          email,
          password,
          role: 'STUDENT'
        });
        navigate('/login', { state: { message: "Registration successful. Please log in." } });
      } else {
        await adminAuthApi.signup({
          username,
          fullName,
          email,
          password,
          role: 'ADMIN'
        });
        navigate('/login', { state: { message: "Admin registration successful. Please log in." } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create an Account</h1>
            <p className="text-slate-500">Join the AUCA ecosystem</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                role === 'ADMIN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building className="w-4 h-4" />
              Administrator
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-3">
              <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-red-500" /></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                placeholder="John Doe"
              />
            </div>
            
            {role === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Student ID
                </label>
                <input
                  type="text"
                  required={role === 'STUDENT'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="24500"
                />
              </div>
            )}

            {role === 'ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required={role === 'ADMIN'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="admin_john"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                role === 'STUDENT' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 shadow-lg' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 shadow-lg'
              } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
              {!isLoading && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button 
              onClick={() => navigate(role === 'STUDENT' ? '/login' : '/admin/login')} 
              className={`font-medium ${role === 'STUDENT' ? 'text-blue-600 hover:text-blue-700' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
      
      <div className={`hidden md:flex w-1/2 p-12 items-center justify-center relative overflow-hidden transition-colors duration-500 ${
        role === 'STUDENT' ? 'bg-blue-600' : 'bg-indigo-600'
      }`}>
        <div className="relative z-10 max-w-lg text-white text-center">
          <h2 className="text-4xl font-bold mb-6">Join AUCA Today</h2>
          <p className="text-lg opacity-90 leading-relaxed mb-8">
            Create an account to access the Contract System, track your academic progress, and manage your financial records efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}
