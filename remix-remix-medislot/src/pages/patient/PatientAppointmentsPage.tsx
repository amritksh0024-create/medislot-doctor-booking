import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dataService } from '../../lib/supabase';
import { Appointment } from '../../types';
import { AppointmentCard } from '../../components/AppointmentCard';
import { AppointmentCardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

export const PatientAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');

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
      showToast('success', 'Appointment Cancelled', 'The slot has been released back to the clinic timetable.');
      loadAppointments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel appointment';
      showToast('error', 'Cancellation Error', msg);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering Logic
  const filteredAppointments = appointments.filter((appt) => {
    const isCancelled = appt.status === 'cancelled';
    const isPast = (appt.slot?.slot_date || '') < todayStr || appt.status === 'completed';
    const isUpcoming = (appt.slot?.slot_date || '') >= todayStr && !isCancelled && appt.status !== 'completed';

    if (activeFilter === 'upcoming') return isUpcoming;
    if (activeFilter === 'past') return isPast && !isCancelled;
    if (activeFilter === 'cancelled') return isCancelled;
    return true; // 'all'
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Appointment History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review active, previous, and cancelled clinic visits
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'upcoming'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveFilter('past')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'past'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'cancelled'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            All ({appointments.length})
          </button>
        </div>
      </div>

      {/* Content State */}
      {isLoading ? (
        <div className="space-y-4">
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No ${activeFilter === 'all' ? '' : activeFilter} appointments`}
          description={
            activeFilter === 'upcoming'
              ? 'You have no upcoming consultations scheduled. Pick a specialist to book your next slot.'
              : 'There are no appointments found matching this status filter.'
          }
          action={
            activeFilter === 'upcoming'
              ? {
                  label: 'Book New Appointment',
                  onClick: () => (window.location.href = '/doctors'),
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onCancel={handleCancelAppointment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
