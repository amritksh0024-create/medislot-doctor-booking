import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, User, AlertCircle, XCircle, Stethoscope } from 'lucide-react';
import { Appointment } from '../types';
import { StatusBadge } from './StatusBadge';
import { ConfirmationDialog } from './ConfirmationDialog';
import { APP_CONFIG } from '../config/appConfig';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (appointmentId: string) => Promise<void>;
  showPatientInfo?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  showPatientInfo = false,
}) => {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Can be cancelled if pending or confirmed or rescheduled
  const isCancellable =
    ['pending', 'confirmed', 'rescheduled'].includes(appointment.status) && Boolean(onCancel);

  const handleConfirmCancel = async () => {
    if (!onCancel) return;
    try {
      setIsCancelling(true);
      await onCancel(appointment.id);
      setIsCancelModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  // Format time (HH:MM)
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <>
      <div
        id={`appointment-card-${appointment.id}`}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow duration-200 p-5 sm:p-6"
      >
        {/* Top Header: Reference & Status */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Ref ID
            </span>
            <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {appointment.booking_reference}
            </span>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Doctor & Appointment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-slate-900 truncate">
                  {appointment.doctor?.name || 'Assigned Physician'}
                </h4>
                <p className="text-xs font-medium text-blue-600">
                  {appointment.doctor?.specialization || 'Healthcare Specialist'}
                </p>
              </div>
            </div>

            {showPatientInfo && (
              <div className="pt-2 text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{appointment.patient_name}</span>
                </div>
                <p className="text-slate-500 pl-5">{appointment.patient_phone}</p>
              </div>
            )}

            {appointment.reason_for_visit && (
              <div className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700 block mb-0.5">Visit Reason:</span>
                <p className="italic">{appointment.reason_for_visit}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800">
                {appointment.slot?.slot_date
                  ? new Date(appointment.slot.slot_date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Scheduled Date'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700 font-medium">
                {formatTime(appointment.slot?.start_time)} - {formatTime(appointment.slot?.end_time)}
              </span>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-slate-500 leading-tight">
                {appointment.doctor?.clinic_address || APP_CONFIG.address}
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-800 font-semibold pt-1">
              <span className="text-slate-500 font-normal">Fee:</span>
              <span>
                {APP_CONFIG.currency}
                {appointment.doctor?.consultation_fee || 75}
              </span>
            </div>
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Booked on {new Date(appointment.created_at).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            {isCancellable && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel Appointment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel your appointment with ${appointment.doctor?.name || 'the doctor'} on ${appointment.slot?.slot_date}? The slot will be released back to the clinic schedule.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Appointment"
        isDestructive={true}
        isLoading={isCancelling}
      />
    </>
  );
};
