import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Award,
  CalendarCheck,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Building2,
  Phone,
  Layers,
  FileCheck2,
  Globe2,
} from 'lucide-react';
import { dataService } from '../lib/supabase';
import { Doctor, AvailabilitySlot } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { DOCTOR_PROFILE } from '../config/doctorProfile';
import { PageSpinner } from '../components/LoadingSkeleton';

export const DoctorDetailPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const isFeaturedDoctor =
    !doctorId ||
    doctorId === DOCTOR_PROFILE.id ||
    doctor?.name?.includes('Vineet') ||
    doctor?.specialization?.includes('Gastro');

  useEffect(() => {
    async function loadDoctorAndSlots() {
      if (!doctorId) return;
      try {
        setIsLoading(true);
        setError(null);

        const docData = await dataService.getDoctorById(doctorId);
        if (!docData) {
          // If ID matches featured doctor or fallback
          if (doctorId === DOCTOR_PROFILE.id) {
            const featured = (await dataService.getDoctors()).find(
              (d: Doctor) => d.id === DOCTOR_PROFILE.id
            );
            if (featured) {
              setDoctor(featured);
            } else {
              setError('Doctor not found');
              return;
            }
          } else {
            setError('Doctor not found');
            return;
          }
        } else {
          setDoctor(docData);
        }

        const availableSlots = await dataService.getAvailableSlots(doctorId);
        setSlots(availableSlots);

        // Pre-select first date with available slots
        if (availableSlots.length > 0) {
          const firstDate = availableSlots[0].slot_date;
          setSelectedDate(firstDate);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error loading doctor profile';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadDoctorAndSlots();
  }, [doctorId]);

  // Unique future dates that have at least 1 available slot
  const uniqueDates = Array.from(new Set(slots.map((s) => s.slot_date))).sort();

  // Slots for the currently active tab/date
  const activeDateSlots = slots.filter((s) => s.slot_date === selectedDate);

  const formatTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const formatDateLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = dateObj.getDate();
    return { dayName, monthName, dayNum };
  };

  const handleProceedToBook = (slotToBook?: AvailabilitySlot) => {
    if (!doctor) return;
    const targetSlot = slotToBook || selectedSlot;
    if (targetSlot) {
      navigate(`/book/${doctor.id}?slotId=${targetSlot.id}`);
    } else {
      navigate(`/book/${doctor.id}`);
    }
  };

  if (isLoading) {
    return <PageSpinner text="Loading doctor profile and clinic schedule..." />;
  }

  if (error || !doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-sm text-slate-500">
          The specialist profile you are seeking may have been deactivated or removed.
        </p>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. DOCTOR HEADER & BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/doctors" className="hover:text-slate-800 transition-colors">
          Doctors
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate">{doctor.name}</span>
      </nav>

      {/* 2 & 3 & 4. PORTRAIT, NAME, CREDENTIALS, CURRENT POSITION & FEE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          {/* 2. Portrait */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <img
              src={doctor.avatar_url || DOCTOR_PROFILE.image}
              alt={doctor.name}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover border-2 border-slate-100 shadow-sm"
            />
            <span
              className="absolute -bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border-2 border-white shadow-xs flex items-center gap-1"
              title="Verified Clinic Doctor"
            >
              <ShieldCheck className="w-3 h-3" />
              Verified Doctor
            </span>
          </div>

          {/* 3. Name and credentials */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {doctor.specialization}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Reg: {doctor.registration_no || DOCTOR_PROFILE.registrationNumber}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              {doctor.name}
            </h1>

            <p className="text-sm sm:text-lg font-bold text-blue-800">
              {doctor.designation || (isFeaturedDoctor ? DOCTOR_PROFILE.designation : '')}
            </p>

            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              {doctor.qualification}
            </p>

            {/* 4. Current Position */}
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5 max-w-2xl text-left">
              <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Current Position: </strong>
                {isFeaturedDoctor
                  ? DOCTOR_PROFILE.currentPositionStatement
                  : doctor.current_position || 'Senior Specialist'}
              </p>
            </div>

            {/* 5. Experience & Languages Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                {isFeaturedDoctor ? DOCTOR_PROFILE.experience : `${doctor.experience_years}+ Years`} Clinical Experience
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Globe2 className="w-4 h-4 text-teal-600 shrink-0" />
                Languages: {isFeaturedDoctor ? DOCTOR_PROFILE.languagesDisplay : 'English, Hindi'}
              </span>
            </div>
          </div>

          {/* Consultation Fee & Quick Action Card */}
          <div className="w-full md:w-64 bg-slate-50/90 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between shrink-0">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Consultation Fee
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {APP_CONFIG.currency}
                {doctor.consultation_fee}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Direct in-clinic consultation at {DOCTOR_PROFILE.clinic.name}.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200/60 mt-4 space-y-2.5">
              <a
                href="https://wa.me/919217179554?text=Hello%20Dr.%20Vineet%20Kumar%20Gupta,%20I%20would%20like%20to%20book%20an%20appointment%20for%20a%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Book Appointment</span>
              </a>

              <a
                href={`tel:${DOCTOR_PROFILE.clinic.phone.replace(/\s+/g, '')}`}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Phone className="w-4 h-4 text-slate-600" />
                <span>Call Clinic ({DOCTOR_PROFILE.clinic.phone})</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 6. ABOUT SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
          About the Doctor
        </h3>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {doctor.bio}
        </p>
      </div>

      {/* 7. SPECIALIZATION & EXPERTISE */}
      {isFeaturedDoctor && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Clinical Competencies
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Specialization &amp; Expertise
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {DOCTOR_PROFILE.expertise.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8 & 9. QUALIFICATIONS & PROFESSIONAL MEMBERSHIPS */}
      {isFeaturedDoctor && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 8. Qualifications */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <Award className="w-4 h-4" />
                <span>Degrees &amp; Certifications</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Qualifications</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCTOR_PROFILE.qualifications.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5"
                >
                  <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{q}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Medical Registration Number: <strong>{DOCTOR_PROFILE.registrationNumber}</strong>
            </p>
          </div>

          {/* 9. Professional Memberships */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
                <Layers className="w-4 h-4" />
                <span>Affiliations</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Professional Memberships</h3>
            </div>

            <div className="space-y-2.5">
              {DOCTOR_PROFILE.memberships.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">{m}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Active Member in national &amp; international gastroenterology societies.
            </p>
          </div>
        </div>
      )}

      {/* 5 (cont). PROFESSIONAL EXPERIENCE TIMELINE */}
      {isFeaturedDoctor && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Career Trajectory
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Professional Experience
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCTOR_PROFILE.experienceHistory.map((exp, index) => (
              <div
                key={index}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/70 p-4 sm:p-5 flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {exp.institution}
                  </h4>
                  {exp.role && (
                    <p className="text-xs font-semibold text-blue-700">{exp.role}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11 & 12. CLINIC INFORMATION & CONSULTATION TIMINGS */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-block px-3 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
              {DOCTOR_PROFILE.clinic.branding}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {DOCTOR_PROFILE.clinic.name}
            </h3>

            <div className="space-y-3 pt-2 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-slate-200">
                  {DOCTOR_PROFILE.clinic.address}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-slate-200">
                  Appointment Desk: <a href={`tel:${DOCTOR_PROFILE.clinic.phone.replace(/\s+/g, '')}`} className="font-bold text-white hover:underline">{DOCTOR_PROFILE.clinic.phone}</a>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
              <Clock className="w-4 h-4" />
              <span>Consultation Timings</span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              {DOCTOR_PROFILE.clinic.timings.map((timing, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0"
                >
                  <span className="text-slate-300 font-medium">{timing.days}</span>
                  <span className="text-white font-bold bg-white/10 px-2.5 py-1 rounded-lg">
                    {timing.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 13. AVAILABLE APPOINTMENT SLOTS */}
      <div id="slots" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Clinic Timetable</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Available Appointment Slots
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select an upcoming day to browse available consultation timings.
          </p>
        </div>

        {uniqueDates.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No open slots this week</p>
            <p className="text-xs text-slate-500 mt-1">
              All upcoming slots for {doctor.name} have been reserved. Please check back soon or contact the clinic at {DOCTOR_PROFILE.clinic.phone}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Date Selector */}
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Available Dates
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {uniqueDates.map((dateStr) => {
                  const { dayName, monthName, dayNum } = formatDateLabel(dateStr);
                  const isSelected = dateStr === selectedDate;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`shrink-0 min-w-[80px] px-3.5 py-3 rounded-2xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      <span className="block text-[11px] font-medium opacity-80 uppercase tracking-wider">
                        {dayName}
                      </span>
                      <span className="block text-base font-bold leading-tight mt-0.5">
                        {dayNum} {monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Grid */}
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Consultation Timings for {formatDateLabel(selectedDate).dayName}, {formatDateLabel(selectedDate).dayNum} {formatDateLabel(selectedDate).monthName}
              </span>

              {activeDateSlots.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No slots open on this date.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {activeDateSlots.map((slot) => {
                    const isChosen = selectedSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isChosen
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white hover:bg-blue-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTime(slot.start_time)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 14. BOOK APPOINTMENT CTA */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 text-center sm:text-left">
                {selectedSlot ? (
                  <span className="text-slate-900 font-semibold">
                    Selected: {formatDateLabel(selectedDate).dayName}, {formatDateLabel(selectedDate).dayNum} {formatDateLabel(selectedDate).monthName} at {formatTime(selectedSlot.start_time)}
                  </span>
                ) : (
                  <span>Select a preferred consultation time above to reserve.</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={
                    selectedSlot
                      ? `https://wa.me/919217179554?text=${encodeURIComponent(`Hello Dr. Vineet Kumar Gupta, I would like to book an appointment on ${selectedDate} at ${formatTime(selectedSlot.start_time)}. Please confirm availability.`)}`
                      : "https://wa.me/919217179554?text=Hello%20Dr.%20Vineet%20Kumar%20Gupta,%20I%20would%20like%20to%20book%20an%20appointment%20for%20a%20consultation."
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{selectedSlot ? 'Book Selected Slot' : 'Book Appointment'}</span>
                </a>

                <button
                  onClick={() => handleProceedToBook()}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Patient Form</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
