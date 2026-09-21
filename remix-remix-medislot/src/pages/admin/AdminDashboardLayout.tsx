import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Stethoscope,
  Clock,
  CalendarCheck,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboardLayout: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
    { label: 'Availability Slots', path: '/admin/slots', icon: Clock },
    { label: 'Appointments', path: '/admin/appointments', icon: CalendarCheck },
    { label: 'Patients', path: '/admin/patients', icon: Users },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-900/60 px-2.5 py-0.5 rounded-full border border-teal-700">
                Clinic Admin Portal
              </span>
              <span className="text-xs text-slate-400">Restricted Access</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white">
              MediSlot Clinic Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage doctors, time slot availability, and patient appointment bookings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Logged in as <strong>{profile?.full_name || 'Admin'}</strong></span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                active
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Admin View Content */}
      <Outlet />
    </div>
  );
};
