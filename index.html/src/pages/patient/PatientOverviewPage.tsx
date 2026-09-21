import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, XCircle, ArrowRight, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dataService } from '../../lib/supabase';
import { Appointment } from '../../types';
import { AppointmentCard } from '../../components/AppointmentCard';
import { AppointmentCardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

export const PatientOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await dataService.getPatientAppointments(user.id);
      setAppointments(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const res = await dataService.cancelAppointment(appointmentId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to cancel appointment');
      }
      showToast('success', 'Appointment Cancelled', 'The slot has been released back to the clinic.');
      loadAppointments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed';
      showToast('error', 'Error', msg);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingAppointments = appointments.filter((a) => {
    const isFutureOrToday = (a.slot?.slot_date || '') >= todayStr;
    const isNotCancelled = a.status === 'confirmed' || a.status === 'pending' || a.status === 'rescheduled';
    return isFutureOrToday && isNotCancelled;
  });

  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  return (
    <div className="space-y-8">
      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Upcoming Visits</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {upcomingAppointments.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Scheduled appointments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Consultations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{completedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Past doctor checkups</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cancelled Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{cancelledCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Released slots</p>
        </div>
      </div>

      {/* Next Upcoming Appointment Highlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Next Upcoming Appointment
          </h2>
          <Link
            to="/dashboard/appointments"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <AppointmentCardSkeleton />
        ) : upcomingAppointments.length > 0 ? (
          <AppointmentCard
            appointment={upcomingAppointments[0]}
            onCancel={handleCancelAppointment}
          />
        ) : (
          <EmptyState
            icon={Calendar}
            title="No upcoming doctor appointments"
            description="You do not have any pending or confirmed doctor consultations scheduled right now."
            action={{
              label: 'Browse Available Doctors',
              onClick: () => (window.location.href = '/doctors'),
            }}
          />
        )}
      </div>

      {/* Quick Action CTA Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-lg font-bold">Need to consult a specialist?</h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Choose from general physicians, dermatologists, pediatricians, and dentists with instant slot reservation.
          </p>
        </div>
        <Link
          to="/doctors"
          className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
        >
          Book An Appointment
        </Link>
      </div>
    </div>
  );
};
