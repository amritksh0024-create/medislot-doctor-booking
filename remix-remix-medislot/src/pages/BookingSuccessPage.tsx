import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  Stethoscope,
  ArrowRight,
  Home,
  Download,
  Share2,
} from 'lucide-react';
import { dataService } from '../lib/supabase';
import { Appointment } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { StatusBadge } from '../components/StatusBadge';

export const BookingSuccessPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const location = useLocation();
  const stateData = location.state || {};

  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    // Fire celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#14b8a6', '#3b82f6', '#10b981'],
      });
    } catch {
      // Ignored if confetti blocked
    }

    async function loadAppointment() {
      if (appointmentId) {
        const appt = await dataService.getAppointmentById(appointmentId);
        if (appt) setAppointment(appt);
      }
    }
    loadAppointment();
  }, [appointmentId]);

  const bookingReference =
    appointment?.booking_reference || stateData.bookingReference || 'MED-SUCCESS';
  const doctorName = appointment?.doctor?.name || stateData.doctorName || 'Doctor';
  const specialization =
    appointment?.doctor?.specialization || stateData.specialization || 'Specialist';
  const slotDate = appointment?.slot?.slot_date || stateData.slotDate;
  const startTime = appointment?.slot?.start_time || stateData.startTime;
  const endTime = appointment?.slot?.end_time || stateData.endTime;
  const patientName = appointment?.patient_name || stateData.patientName || 'Patient';
  const patientPhone = appointment?.patient_phone || stateData.patientPhone || '';
  const consultationFee =
    appointment?.doctor?.consultation_fee || stateData.consultationFee || 75;

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 text-center space-y-6">
        {/* Animated Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs animate-in zoom-in duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Booking Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            Appointment Successfully Scheduled!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Your appointment has been reserved in the clinic calendar. A confirmation reference has been generated below.
          </p>
        </div>

        {/* Booking Reference Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Booking Reference
          </span>
          <span className="font-mono text-xl sm:text-2xl font-extrabold text-blue-700 tracking-wider">
            {bookingReference}
          </span>
        </div>

        {/* Appointment Details Grid */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 text-left text-xs sm:text-sm space-y-3 max-w-md mx-auto">
          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-blue-600" /> Specialist
            </span>
            <span className="font-semibold text-slate-900">{doctorName}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Specialization</span>
            <span className="font-medium text-blue-600">{specialization}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" /> Date
            </span>
            <span className="font-semibold text-slate-900">
              {slotDate
                ? new Date(slotDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Selected Date'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" /> Time
            </span>
            <span className="font-semibold text-slate-900">
              {formatTime(startTime)} - {formatTime(endTime)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> Patient
            </span>
            <span className="font-semibold text-slate-900">{patientName}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500">Status</span>
            <StatusBadge status="confirmed" size="sm" />
          </div>
        </div>

        {/* Action Buttons - Direct WhatsApp & Home */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={stateData.waUrl || `https://wa.me/919217179554?text=${encodeURIComponent(`Hello Dr. Vineet Kumar Gupta, I have scheduled appointment ref: ${bookingReference}. Please confirm.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Connect with Doctor on WhatsApp</span>
          </a>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
