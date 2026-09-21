import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, User, ChevronRight, PlusCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const PatientDashboardLayout: React.FC = () => {
  const location = useLocation();
  const { profile, user } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Appointments', path: '/dashboard/appointments', icon: Calendar },
    { label: 'My Profile', path: '/dashboard/profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Patient Welcome Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-200 shrink-0">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Patient Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Welcome back, {profile?.full_name || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your doctor reservations and update contact preferences
            </p>
          </div>
        </div>

        <Link
          to="/doctors"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                active
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <Outlet />
    </div>
  );
};
