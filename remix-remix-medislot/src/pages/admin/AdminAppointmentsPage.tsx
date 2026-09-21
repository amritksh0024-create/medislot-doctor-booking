import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Edit,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import { dataService } from '../../lib/supabase';
import { Appointment, Doctor, AvailabilitySlot, AppointmentStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { useToast } from '../../contexts/ToastContext';
import { PageSpinner } from '../../components/LoadingSkeleton';

export const AdminAppointmentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // Reschedule State & Modal
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [availableSlotsForDoctor, setAvailableSlotsForDoctor] = useState<AvailabilitySlot[]>([]);
  const [targetSlotId, setTargetSlotId] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Status Change Confirmation
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    appointmentId: string;
    newStatus: AppointmentStatus;
  } | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appts, docs] = await Promise.all([
        dataService.getAllAppointments(),
        dataService.getDoctors(),
      ]);
      setAppointments(appts);
      setDoctors(docs);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const matchSearch =
        searchQuery === '' ||
        appt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appt.doctor?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchDoctor =
        selectedDoctorId === 'ALL' || appt.doctor_id === selectedDoctorId;

      const matchStatus =
        selectedStatus === 'ALL' || appt.status === selectedStatus;

      const matchDate =
        selectedDate === '' || (appt.slot?.slot_date || '') === selectedDate;

      return matchSearch && matchDoctor && matchStatus && matchDate;
    });
  }, [appointments, searchQuery, selectedDoctorId, selectedStatus, selectedDate]);

  // Open Reschedule Modal
  const handleOpenReschedule = async (appt: Appointment) => {
    setReschedulingAppointment(appt);
    setTargetSlotId('');
    try {
      const openSlots = await dataService.getAvailableSlots(appt.doctor_id);
      setAvailableSlotsForDoctor(openSlots);
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm Reschedule
  const handleConfirmReschedule = async () => {
    if (!reschedulingAppointment || !targetSlotId) return;
    try {
      setIsRescheduling(true);
      const res = await dataService.rescheduleAppointment(
        reschedulingAppointment.id,
        targetSlotId
      );
      if (!res.success) {
        throw new Error(res.error || 'Rescheduling failed');
      }
      showToast('success', 'Appointment Rescheduled', 'Patient booking moved to new slot.');
      setReschedulingAppointment(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error rescheduling';
      showToast('error', 'Failed', msg);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Status Change Handler
  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    try {
      const res = await dataService.updateAppointmentStatus(
        pendingStatusChange.appointmentId,
        pendingStatusChange.newStatus
      );
      if (!res.success) {
        throw new Error(res.error || 'Status update failed');
      }
      showToast(
        'success',
        'Status Updated',
        `Appointment status is now ${pendingStatusChange.newStatus}`
      );
      setPendingStatusChange(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change status';
      showToast('error', 'Error', msg);
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  if (isLoading) {
    return <PageSpinner text="Loading clinic bookings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinic Appointment Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter, search, reschedule, and update statuses of patient appointments
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors self-start sm:self-auto flex items-center gap-1 text-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Patient or Reference */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Patient name or Ref #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by Doctor */}
          <div>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Doctors</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          {/* Filter by Date */}
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Active Filter Clear */}
        {(searchQuery || selectedDoctorId !== 'ALL' || selectedStatus !== 'ALL' || selectedDate) && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500">
              Filtering results ({filteredAppointments.length} matches)
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDoctorId('ALL');
                setSelectedStatus('ALL');
                setSelectedDate('');
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs sm:text-sm">
            No appointments match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Ref #</th>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Scheduled Slot</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-700">
                      {appt.booking_reference}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{appt.doctor?.name}</div>
                      <div className="text-[11px] text-blue-600">
                        {appt.doctor?.specialization}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{appt.patient_name}</div>
                      <div className="text-[11px] text-slate-400">{appt.patient_phone}</div>
                      {appt.reason_for_visit && (
                        <div className="text-[10px] text-slate-500 italic truncate max-w-[180px]">
                          "{appt.reason_for_visit}"
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      <div className="font-medium">{appt.slot?.slot_date}</div>
                      <div className="text-[11px] text-slate-400">
                        {formatTime(appt.slot?.start_time)} - {formatTime(appt.slot?.end_time)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={appt.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* Quick Reschedule */}
                        {appt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleOpenReschedule(appt)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Reschedule to another slot"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Status Change Dropdown */}
                        <select
                          value={appt.status}
                          onChange={(e) =>
                            setPendingStatusChange({
                              appointmentId: appt.id,
                              newStatus: e.target.value as AppointmentStatus,
                            })
                          }
                          className="py-1 px-2 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal (Required by Spec: Reschedule to open slot of same doctor) */}
      <Modal
        isOpen={Boolean(reschedulingAppointment)}
        onClose={() => setReschedulingAppointment(null)}
        title={`Reschedule Appointment (${reschedulingAppointment?.booking_reference})`}
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600">
            Select a new open slot for{' '}
            <strong>{reschedulingAppointment?.doctor?.name}</strong>:
          </p>

          {availableSlotsForDoctor.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              No open available slots currently found for this specialist. Please add slots in the Availability tab first.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {availableSlotsForDoctor.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setTargetSlotId(slot.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    targetSlotId === slot.id
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{slot.slot_date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReschedulingAppointment(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!targetSlotId || isRescheduling}
              onClick={handleConfirmReschedule}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-xs transition-colors"
            >
              {isRescheduling ? 'Updating Slot...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Change Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(pendingStatusChange)}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={handleConfirmStatusChange}
        title="Update Appointment Status"
        message={`Are you sure you want to change this appointment status to "${pendingStatusChange?.newStatus}"?`}
        confirmText="Confirm Status Update"
      />
    </div>
  );
};
