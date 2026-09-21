import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  CalendarCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { dataService } from '../../lib/supabase';
import { AdminMetrics, Appointment } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { PageSpinner } from '../../components/LoadingSkeleton';

export const AdminOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setIsLoading(true);
        const [m, appts] = await Promise.all([
          dataService.getAdminMetrics(),
          dataService.getAllAppointments(),
        ]);
        setMetrics(m);
        setRecentAppointments(appts.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin overview', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (isLoading) {
    return <PageSpinner text="Computing clinic metrics..." />;
  }

  return (
    <div className="space-y-8">
      {/* 4 Main Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Doctors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Doctors
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {metrics?.totalDoctors || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active specialists on roster</p>
        </div>

        {/* Total Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {metrics?.totalAppointments || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">All-time patient reservations</p>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Visits
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {metrics?.todayAppointments || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Scheduled for today</p>
        </div>

        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registered Patients
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {metrics?.totalPatients || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">User accounts created</p>
        </div>
      </div>

      {/* Appointment Status Counts Breakdown (Required by Spec) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Appointment Status Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800">Pending</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-950 mt-1">
              {metrics?.pendingCount || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800">Confirmed</span>
              <CalendarCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-950 mt-1">
              {metrics?.confirmedCount || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-950 mt-1">
              {metrics?.completedCount || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800">Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-950 mt-1">
              {metrics?.cancelledCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Appointments</h3>
            <p className="text-xs text-slate-500">Latest reservations across all specialists</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No appointments booked yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Ref #</th>
                  <th className="px-6 py-3.5">Doctor</th>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Date &amp; Time</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-700">
                      {appt.booking_reference}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {appt.doctor?.name || '--'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="font-medium">{appt.patient_name}</div>
                      <div className="text-[11px] text-slate-400">{appt.patient_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{appt.slot?.slot_date}</div>
                      <div className="text-[11px] text-slate-400">{appt.slot?.start_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={appt.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
