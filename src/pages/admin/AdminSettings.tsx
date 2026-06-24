import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Lock, Bell, Globe } from 'lucide-react';

export default function AdminSettings() {
  const adminName = localStorage.getItem('admin_name') || 'Admin';
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your admin preferences and system configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-slate-100 text-slate-900">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600">
            <Globe className="mr-2 h-4 w-4" />
            System
          </Button>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" 
                  disabled
                  defaultValue={adminName} 
                  className="w-full p-2 border rounded-md bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Role</label>
                <input 
                  type="text" 
                  disabled
                  defaultValue="Administrator" 
                  className="w-full p-2 border rounded-md bg-slate-50 text-slate-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
