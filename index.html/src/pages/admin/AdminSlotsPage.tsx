import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Lock,
} from 'lucide-react';
import { dataService } from '../../lib/supabase';
import { Doctor, AvailabilitySlot } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { Modal } from '../../components/Modal';
import { PageSpinner } from '../../components/LoadingSkeleton';

export const AdminSlotsPage: React.FC = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Single Slot Modal
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [singleStart, setSingleStart] = useState('09:00');
  const [singleEnd, setSingleEnd] = useState('09:30');

  // Recurring Generator Modal
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [genStartTime, setGenStartTime] = useState('09:00');
  const [genEndTime, setGenEndTime] = useState('13:00');
  const [genIntervalMinutes, setGenIntervalMinutes] = useState(30);

  // Delete Slot Dialog
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial doctors
  useEffect(() => {
    async function loadDocs() {
      try {
        const docs = await dataService.getDoctors();
        setDoctors(docs);
        if (docs.length > 0) {
          setSelectedDoctorId(docs[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDocs();
  }, []);

  // Load slots whenever doctor or date changes
  const loadSlots = async () => {
    if (!selectedDoctorId || !selectedDate) return;
    try {
      setIsLoading(true);
      const data = await dataService.getDoctorSlotsForDate(selectedDoctorId, selectedDate);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [selectedDoctorId, selectedDate]);

  // Single Slot Add
  const handleAddSingleSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate) return;
    try {
      await dataService.createSlot({
        doctor_id: selectedDoctorId,
        slot_date: selectedDate,
        start_time: singleStart,
        end_time: singleEnd,
        is_booked: false,
      });
      showToast('success', 'Slot Added', `Added slot ${singleStart} - ${singleEnd}`);
      setIsSingleModalOpen(false);
      loadSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add slot';
      showToast('error', 'Error', msg);
    }
  };

  // Recurring Slots Generator
  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate) return;

    try {
      const count = await dataService.generateRecurringSlots(
        selectedDoctorId,
        selectedDate,
        genStartTime,
        genEndTime,
        genIntervalMinutes
      );
      showToast(
        'success',
        'Slots Generated',
        `Successfully added ${count} new appointment slots.`
      );
      setIsGeneratorModalOpen(false);
      loadSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating slots';
      showToast('error', 'Generation Error', msg);
    }
  };

  // Delete Unbooked Slot
  const handleConfirmDeleteSlot = async () => {
    if (!deletingSlotId) return;
    try {
      setIsDeleting(true);
      const res = await dataService.deleteSlot(deletingSlotId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete slot');
      }
      showToast('success', 'Slot Removed', 'The empty slot was removed from the schedule.');
      setDeletingSlotId(null);
      loadSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not delete slot';
      showToast('error', 'Delete Failed', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Doctor Availability Timetable</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure daily clinic schedules and bulk-generate 30-minute consultation slots
        </p>
      </div>

      {/* Doctor & Date Selection Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Doctor Selector */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Select Specialist
            </label>
            <div className="relative">
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selector */}
          <div className="sm:w-56">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Select Schedule Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-end pt-2 md:pt-0">
          <button
            onClick={() => setIsSingleModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Slot</span>
          </button>

          <button
            onClick={() => setIsGeneratorModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Recurring Generator</span>
          </button>
        </div>
      </div>

      {/* Slots Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Slots for {selectedDoctor?.name || 'Doctor'}
            </h3>
            <p className="text-xs text-slate-500">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available (
              {slots.filter((s) => !s.is_booked).length})
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Booked (
              {slots.filter((s) => s.is_booked).length})
            </span>
          </div>
        </div>

        {/* Slot Tiles */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Updating timetable...</div>
        ) : slots.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No slots defined for this date</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Use the "Recurring Generator" above to instantly create 30-minute intervals from 09:00 to 13:00.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot) => {
              return (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    slot.is_booked
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                    </div>

                    <div className="text-[10px] mt-1">
                      {slot.is_booked ? (
                        <span className="text-blue-700 font-medium flex items-center gap-1">
                          <Lock className="w-3 h-3 text-blue-600" /> Reserved / Booked
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Open for booking</span>
                      )}
                    </div>
                  </div>

                  {!slot.is_booked && (
                    <button
                      onClick={() => setDeletingSlotId(slot.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete unbooked slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Single Slot */}
      <Modal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        title="Add Custom Appointment Slot"
      >
        <form onSubmit={handleAddSingleSlot} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
            <input
              type="time"
              required
              value={singleStart}
              onChange={(e) => setSingleStart(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">End Time</label>
            <input
              type="time"
              required
              value={singleEnd}
              onChange={(e) => setSingleEnd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSingleModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              Add Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Recurring Slot Generator (Required by Spec) */}
      <Modal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        title="Recurring Slot Generator"
      >
        <form onSubmit={handleGenerateSlots} className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-500 text-xs">
            Generate sequential slots for <strong>{selectedDoctor?.name}</strong> on{' '}
            <strong>{selectedDate}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift Start</label>
              <input
                type="time"
                value={genStartTime}
                onChange={(e) => setGenStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift End</label>
              <input
                type="time"
                value={genEndTime}
                onChange={(e) => setGenEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Slot Duration (Minutes)
            </label>
            <select
              value={genIntervalMinutes}
              onChange={(e) => setGenIntervalMinutes(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes (Standard)</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (Full hour)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsGeneratorModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
            >
              Generate Schedule Slots
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={Boolean(deletingSlotId)}
        onClose={() => setDeletingSlotId(null)}
        onConfirm={handleConfirmDeleteSlot}
        title="Delete Slot"
        message="Are you sure you want to remove this available appointment slot? It has not been reserved yet."
        confirmText="Yes, Delete Slot"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
