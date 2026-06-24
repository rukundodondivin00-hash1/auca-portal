import { useState, useEffect } from 'react';
import { User, Lock, Bell, Palette, Shield, Save, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const studentName = localStorage.getItem('student_name') || 'Student Name';
  const studentId = localStorage.getItem('student_id') || 'N/A';
  
  // Profile State
  const [email, setEmail] = useState(localStorage.getItem('student_email') || `${studentId}@auca.ac.rw`);
  const [phone, setPhone] = useState(localStorage.getItem('student_phone') || '+250 780 000 000');

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Notifications State
  const [notifyGrades, setNotifyGrades] = useState(localStorage.getItem('notify_grades') !== 'false');
  const [notifyReg, setNotifyReg] = useState(localStorage.getItem('notify_reg') !== 'false');
  const [notifyPay, setNotifyPay] = useState(localStorage.getItem('notify_pay') !== 'false');
  const [notifyInst, setNotifyInst] = useState(localStorage.getItem('notify_inst') !== 'false');

  useEffect(() => {
    // Apply theme on mount and when it changes
    const root = window.document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    localStorage.setItem('student_email', email);
    localStorage.setItem('student_phone', phone);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Fake password save
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleToggleNotification = (key: string, value: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(!value);
    localStorage.setItem(key, (!value).toString());
  };

  return (
    <div className="space-y-6 animate-fade-in-slow pb-12 max-w-5xl">
      <div className="bg-[#00447b] text-white p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-blue-100 text-sm mt-1">Manage your profile, security, and preferences</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'profile' 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User size={18} /> Personal Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'security' 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lock size={18} /> Password & Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bell size={18} /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'appearance' 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Palette size={18} /> Appearance
          </button>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="shadow-sm border-gray-200 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">Personal Information</CardTitle>
                <CardDescription className="dark:text-slate-400">Update your photo and personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-sm">
                      {studentName.charAt(0)}
                    </div>
                    <div>
                      <button type="button" className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        Change Photo
                      </button>
                      <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={studentName}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                        readOnly
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">To change your legal name, please contact the registrar.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Registration Number</label>
                      <input 
                        type="text" 
                        defaultValue={studentId}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-not-allowed focus:outline-none" 
                        readOnly 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-slate-800 flex justify-end items-center gap-4">
                    {showSuccess && <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1"><CheckCircle2 size={16}/> Saved successfully</span>}
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-[#00447b] text-white px-5 py-2 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-70"
                    >
                      {isSaving ? <span className="animate-spin text-xl">↻</span> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="shadow-sm border-gray-200 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">Password & Security</CardTitle>
                <CardDescription className="dark:text-slate-400">Manage your password and security preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSecurity} className="space-y-6">
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">New Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-slate-800 flex justify-end items-center gap-4">
                    {showSuccess && <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1"><CheckCircle2 size={16}/> Saved successfully</span>}
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-[#00447b] text-white px-5 py-2 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-70"
                    >
                      {isSaving ? <span className="animate-spin text-xl">↻</span> : <Save size={16} />}
                      Update Password
                    </button>
                  </div>
                </form>

                <div className="mt-8 border-t dark:border-slate-800 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2"><Shield size={18} className="text-blue-600 dark:text-blue-400"/> Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-slate-200">Authenticator App</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Use an app like Google Authenticator to secure your account.</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="shadow-sm border-gray-200 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">Notification Preferences</CardTitle>
                <CardDescription className="dark:text-slate-400">Choose what updates you want to receive.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-300 uppercase tracking-wider">Academic Updates</h3>
                    
                    <div className="flex items-start justify-between">
                      <div className="pr-4">
                        <p className="font-medium text-gray-800 dark:text-slate-200">Grade Postings</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Get notified when new grades are published to your transcript.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" className="sr-only peer" checked={notifyGrades} onChange={() => handleToggleNotification('notify_grades', notifyGrades, setNotifyGrades)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="pr-4">
                        <p className="font-medium text-gray-800 dark:text-slate-200">Course Registration</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Reminders for upcoming registration deadlines and waitlist updates.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" className="sr-only peer" checked={notifyReg} onChange={() => handleToggleNotification('notify_reg', notifyReg, setNotifyReg)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t dark:border-slate-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-300 uppercase tracking-wider">Financial Updates</h3>
                    
                    <div className="flex items-start justify-between">
                      <div className="pr-4">
                        <p className="font-medium text-gray-800 dark:text-slate-200">Payment Confirmations</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Receive receipts when a payment is processed successfully.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" className="sr-only peer" checked={notifyPay} onChange={() => handleToggleNotification('notify_pay', notifyPay, setNotifyPay)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="pr-4">
                        <p className="font-medium text-gray-800 dark:text-slate-200">Installment Reminders</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Get alerted 3 days before a contract installment is due.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" className="sr-only peer" checked={notifyInst} onChange={() => handleToggleNotification('notify_inst', notifyInst, setNotifyInst)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="shadow-sm border-gray-200 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">Appearance</CardTitle>
                <CardDescription className="dark:text-slate-400">Customize how the AUCA Portal looks on your device.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-slate-200 mb-4">Theme Preference</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div onClick={() => handleThemeChange('light')} className={`relative flex flex-col items-center cursor-pointer transition-opacity ${theme !== 'light' ? 'opacity-60 hover:opacity-100' : ''}`}>
                        <div className={`w-full h-24 rounded-lg border-2 ${theme === 'light' ? 'border-blue-600' : 'border-transparent'} bg-gray-50 flex items-center justify-center shadow-sm`}>
                          <div className="w-3/4 h-3/4 bg-white shadow-sm rounded-md border flex flex-col p-2 gap-2">
                            <div className="h-2 w-full bg-gray-200 rounded"></div>
                            <div className="h-2 w-2/3 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <span className={`mt-2 text-sm font-medium ${theme === 'light' ? 'text-blue-600 font-bold flex items-center gap-1' : 'text-gray-600 dark:text-slate-400'}`}>
                          {theme === 'light' && <CheckCircle2 size={14} />} Light
                        </span>
                      </div>

                      <div onClick={() => handleThemeChange('dark')} className={`relative flex flex-col items-center cursor-pointer transition-opacity ${theme !== 'dark' ? 'opacity-60 hover:opacity-100' : ''}`}>
                        <div className={`w-full h-24 rounded-lg border-2 ${theme === 'dark' ? 'border-blue-600' : 'border-transparent'} bg-gray-900 flex items-center justify-center`}>
                          <div className="w-3/4 h-3/4 bg-gray-800 shadow-sm rounded-md border border-gray-700 flex flex-col p-2 gap-2">
                            <div className="h-2 w-full bg-gray-600 rounded"></div>
                            <div className="h-2 w-2/3 bg-gray-600 rounded"></div>
                          </div>
                        </div>
                        <span className={`mt-2 text-sm font-medium ${theme === 'dark' ? 'text-blue-600 font-bold flex items-center gap-1' : 'text-gray-600 dark:text-slate-400'}`}>
                           {theme === 'dark' && <CheckCircle2 size={14} />} Dark
                        </span>
                      </div>

                      <div onClick={() => handleThemeChange('system')} className={`relative flex flex-col items-center cursor-pointer transition-opacity ${theme !== 'system' ? 'opacity-60 hover:opacity-100' : ''}`}>
                        <div className={`w-full h-24 rounded-lg border-2 ${theme === 'system' ? 'border-blue-600' : 'border-transparent'} bg-gradient-to-br from-gray-50 to-gray-900 flex items-center justify-center`}>
                          <div className="w-10 h-10 rounded-full border-4 border-white shadow-sm overflow-hidden flex">
                            <div className="w-1/2 h-full bg-gray-100"></div>
                            <div className="w-1/2 h-full bg-gray-800"></div>
                          </div>
                        </div>
                        <span className={`mt-2 text-sm font-medium ${theme === 'system' ? 'text-blue-600 font-bold flex items-center gap-1' : 'text-gray-600 dark:text-slate-400'}`}>
                           {theme === 'system' && <CheckCircle2 size={14} />} System
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
