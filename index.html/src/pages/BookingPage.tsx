import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  DollarSign,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dataService } from '../lib/supabase';
import { Doctor, AvailabilitySlot } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { DOCTOR_PROFILE } from '../config/doctorProfile';
import { PageSpinner } from '../components/LoadingSkeleton';

// Zod Booking Schema
const bookingSchema = z.object({
  patientName: z.string().min(2, 'Full name must be at least 2 characters'),
  patientPhone: z
    .string()
    .min(7, 'Please enter a valid phone number')
    .max(20, 'Phone number too long'),
  reasonForVisit: z.string().max(250, 'Reason cannot exceed 250 characters').optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export const BookingPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [searchParams] = useSearchParams();
  const slotIdParam = searchParams.get('slotId');
  const navigate = useNavigate();

  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(slotIdParam || '');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      patientName: profile?.full_name || '',
      patientPhone: profile?.phone || '',
      reasonForVisit: '',
    },
  });

  // Pre-fill fields when profile is loaded
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setValue('patientName', profile.full_name);
      if (profile.phone) setValue('patientPhone', profile.phone);
    }
  }, [profile, setValue]);

  // Load Doctor & Available Slots
  useEffect(() => {
    async function loadData() {
      if (!doctorId) return;
      try {
        setIsLoading(true);
        const doc = await dataService.getDoctorById(doctorId);
        if (!doc) {
          setSubmitError('Specialist could not be found.');
          return;
        }
        setDoctor(doc);

        const availableSlots = await dataService.getAvailableSlots(doctorId);
        setSlots(availableSlots);

        // If slotIdParam is provided, pick its date
        if (slotIdParam) {
          const matchSlot = availableSlots.find((s) => s.id === slotIdParam);
          if (matchSlot) {
            setSelectedSlotId(matchSlot.id);
            setSelectedDate(matchSlot.slot_date);
          } else if (availableSlots.length > 0) {
            setSelectedDate(availableSlots[0].slot_date);
          }
        } else if (availableSlots.length > 0) {
          setSelectedDate(availableSlots[0].slot_date);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load booking schedule';
        setSubmitError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [doctorId, slotIdParam]);

  // Find currently selected slot object
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const uniqueDates = Array.from(new Set(slots.map((s) => s.slot_date))).sort();
  const dateSlots = slots.filter((s) => s.slot_date === selectedDate);

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  // Submit appointment booking - Connect directly on WhatsApp with Doctor
  const onSubmit = async (values: BookingFormValues) => {
    if (!doctor) return;
    if (!selectedSlotId || !selectedSlot) {
      setSubmitError('Please choose an available appointment date and time slot.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Build friendly date and time format
      const formattedDate = new Date(selectedSlot.slot_date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const formattedTime = `${formatTime(selectedSlot.start_time)} to ${formatTime(selectedSlot.end_time)}`;

      const waMessage = `Hello Dr. Vineet Kumar Gupta,\n\nI would like to book an appointment with you:\n\n• Patient Name: ${values.patientName}\n• Contact Number: ${values.patientPhone}\n• Appointment Date: ${formattedDate}\n• Preferred Time: ${formattedTime}${values.reasonForVisit ? `\n• Reason for Consultation: ${values.reasonForVisit}` : ''}\n\nPlease confirm my appointment slot. Thank you!`;

      const waUrl = `https://wa.me/919217179554?text=${encodeURIComponent(waMessage)}`;

      // Directly launch WhatsApp chat with doctor
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // Also record booking for reference code if possible
      let bookingRef = `VKG-${Date.now().toString().slice(-6)}`;
      let appointmentId = 'direct-whatsapp';

      try {
        const response = await dataService.bookAppointment(
          {
            doctorId: doctor.id,
            slotId: selectedSlotId,
            patientName: values.patientName,
            patientPhone: values.patientPhone,
            reasonForVisit: values.reasonForVisit,
          },
          user?.id || 'guest-patient'
        );
        if (response.booking_reference) bookingRef = response.booking_reference;
        if (response.appointment_id) appointmentId = response.appointment_id;
      } catch {
        // WhatsApp is the primary channel, ignore database errors
      }

      showToast(
        'success',
        'WhatsApp Chat Opened!',
        `Sending appointment details directly to Dr. Vineet Kumar Gupta`
      );

      navigate(`/booking-success/${appointmentId}`, {
        state: {
          bookingReference: bookingRef,
          doctorName: doctor.name,
          specialization: doctor.specialization,
          slotDate: selectedSlot.slot_date,
          startTime: selectedSlot.start_time,
          endTime: selectedSlot.end_time,
          consultationFee: doctor.consultation_fee,
          patientName: values.patientName,
          patientPhone: values.patientPhone,
          waUrl,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error launching WhatsApp booking';
      setSubmitError(msg);
      showToast('error', 'Booking Notice', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageSpinner text="Preparing your appointment schedule..." />;
  }

  if (!doctor) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-slate-600">Doctor not found.</p>
        <Link to="/doctors" className="mt-4 inline-block text-blue-600 text-sm font-semibold">
          Return to Doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to={`/doctors/${doctor.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Doctor Profile
        </Link>
        <span className="text-xs font-semibold text-slate-400">Step 1 of 2</span>
      </div>

      {/* Booking Form Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Step Indicator Bar */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Schedule Your Appointment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review slot availability and provide your patient contact details to lock in your visit.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">
          {submitError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to complete appointment</p>
                <p className="mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          {/* 1. Doctor Selected Card */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              1. Selected Specialist
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <img
                src={
                  doctor.avatar_url ||
                  DOCTOR_PROFILE.image
                }
                alt={doctor.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  {doctor.specialization}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{doctor.name}</h4>
                {(doctor.designation || doctor.id === DOCTOR_PROFILE.id) && (
                  <p className="text-xs sm:text-sm font-medium text-blue-800 truncate">
                    {doctor.designation || DOCTOR_PROFILE.designation}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-slate-500 truncate">{doctor.clinic_address}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs uppercase font-semibold text-slate-400 block">
                  Fee
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  {APP_CONFIG.currency}
                  {doctor.consultation_fee}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Date & Time Slot Picker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                2. Select Date &amp; Time Slot
              </h3>
              {selectedSlot && (
                <span className="text-xs sm:text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Slot Chosen
                </span>
              )}
            </div>

            {/* Date Pills */}
            {uniqueDates.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No available dates found.</p>
            ) : (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                {uniqueDates.map((dStr) => {
                  const d = new Date(dStr + 'T00:00:00');
                  const isCur = selectedDate === dStr;
                  return (
                    <button
                      key={dStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dStr);
                        setSelectedSlotId('');
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                        isCur
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`text-xs uppercase block ${isCur ? 'text-blue-100' : 'text-slate-500'}`}>
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-sm sm:text-base font-bold block">
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Time Slot Radio Grid */}
            <div>
              {dateSlots.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Please select a date above to view slots.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {dateSlots.map((slot) => {
                    const isChosen = selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          isChosen
                            ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500 font-bold'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium'
                        }`}
                      >
                        <Clock className="w-4 h-4 mb-0.5 text-slate-400" />
                        <span className="text-sm font-semibold">{formatTime(slot.start_time)}</span>
                        <span className="text-xs text-slate-500">
                          to {formatTime(slot.end_time)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. Patient Details (pre-filled) */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              3. Patient Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...register('patientName')}
                    className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                      errors.patientName ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Enter patient full name"
                  />
                </div>
                {errors.patientName && (
                  <p className="text-xs text-red-600 mt-1">{errors.patientName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    {...register('patientPhone')}
                    className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                      errors.patientPhone ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                {errors.patientPhone && (
                  <p className="text-xs text-red-600 mt-1">{errors.patientPhone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Reason for Visit <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  {...register('reasonForVisit')}
                  rows={2}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="E.g., Routine consultation, endoscopy follow-up, abdominal symptoms..."
                />
              </div>
              {errors.reasonForVisit && (
                <p className="text-xs text-red-600 mt-1">{errors.reasonForVisit.message}</p>
              )}
            </div>
          </div>

          {/* 4. Booking Summary Box (Required by Spec) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              Booking Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block">Doctor</span>
                <span className="font-semibold text-slate-800">{doctor.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Specialization</span>
                <span className="font-semibold text-blue-600">{doctor.specialization}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Appointment Date</span>
                <span className="font-semibold text-slate-800">
                  {selectedSlot?.slot_date
                    ? new Date(selectedSlot.slot_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Not selected yet'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Appointment Time</span>
                <span className="font-semibold text-slate-800">
                  {selectedSlot ? formatTime(selectedSlot.start_time) : 'Not selected yet'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Patient Name</span>
                <span className="font-semibold text-slate-800">{watch('patientName') || '--'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-800">{watch('patientPhone') || '--'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Consultation Fee</span>
                <span className="font-bold text-slate-900 text-sm">
                  {APP_CONFIG.currency}
                  {doctor.consultation_fee}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Status</span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Instant Confirmation
                </span>
              </div>
            </div>
          </div>

          {/* Final Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedSlotId}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-base sm:text-lg rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Calendar className="w-5 h-5" />
              {isSubmitting ? 'Confirming Appointment...' : 'Book Appointment'}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2.5">
              No account or login required. Clicking connects you directly with Dr. Vineet Kumar Gupta with your selected appointment slot and details.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
