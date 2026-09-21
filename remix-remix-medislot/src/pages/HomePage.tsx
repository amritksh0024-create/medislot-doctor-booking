import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Building2,
  Stethoscope,
  Activity,
  FileCheck2,
  Layers,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { DOCTOR_PROFILE } from '../config/doctorProfile';
import { dataService } from '../lib/supabase';
import { AvailabilitySlot } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      try {
        setIsLoadingSlots(true);
        const available = await dataService.getAvailableSlots(DOCTOR_PROFILE.id);
        setSlots(available);
        if (available.length > 0) {
          // Pre-select first date that has available slots
          const firstDate = available[0].slot_date;
          setSelectedDate(firstDate);
        }
      } catch (err) {
        console.error('Failed to load slots for featured doctor:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchSlots();
  }, []);

  // Format time HH:MM:SS to 12-hour format
  const formatTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  // Format date string YYYY-MM-DD to friendly display
  const formatDateLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = dateObj.getDate();
    return { dayName, monthName, dayNum };
  };

  // Group unique dates with available slots
  const uniqueDates = Array.from(new Set(slots.map((s) => s.slot_date))).sort();
  const activeDateSlots = slots.filter((s) => s.slot_date === selectedDate);

  const handleWhatsAppBooking = (slot?: AvailabilitySlot) => {
    const targetSlot = slot || selectedSlot;
    let message = `Hello Dr. Vineet Kumar Gupta, I would like to book an appointment for a consultation.`;
    if (targetSlot) {
      message = `Hello Dr. Vineet Kumar Gupta,\n\nI would like to book an appointment on ${selectedDate} at ${formatTime(targetSlot.start_time)}. Please confirm availability.\n\nThank you!`;
    }
    const url = `https://wa.me/919217179554?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBookSelected = (slot?: AvailabilitySlot) => {
    const targetSlot = slot || selectedSlot;
    if (targetSlot) {
      navigate(`/book/${DOCTOR_PROFILE.id}?slotId=${targetSlot.id}`);
    } else {
      navigate(`/book/${DOCTOR_PROFILE.id}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50/40 to-white pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT SIDE: Doctor Intro & CTAs */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
              {/* Pill Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 text-blue-900 text-xs sm:text-sm font-semibold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Verified Gastroenterology Specialist</span>
              </div>

              {/* Doctor Name - Sized for Mobile & Desktop Balance */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {DOCTOR_PROFILE.name}
              </h1>

              {/* Senior Director & Unit Head Designation */}
              <p className="text-base sm:text-xl font-bold text-blue-800 tracking-tight mt-1 sm:mt-1.5 leading-snug">
                {DOCTOR_PROFILE.designation}
              </p>

              {/* Specialty & Credentials - Standard Clean Hierarchy */}
              <div className="space-y-3 pt-1">
                <p className="text-xs sm:text-sm font-bold text-teal-700 tracking-wider uppercase">
                  {DOCTOR_PROFILE.specialty}
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100/80 leading-snug">
                    MBBS
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100/80 leading-snug">
                    MD (Medicine)
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100/80 leading-snug">
                    DNB (Gastroenterology)
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100/80 leading-snug">
                    MNAMS
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-center lg:justify-start gap-2 text-sm font-semibold text-slate-700">
                  <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{DOCTOR_PROFILE.experience} of Clinical Experience</span>
                </div>
              </div>

              {/* Short Supporting Text */}
              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Expert diagnostic endoscopy, liver care, and advanced digestive health management with a dedicated, patient-first approach.
              </p>

              {/* Current Role Notice */}
              <div className="p-3.5 sm:p-4 bg-white/95 rounded-xl border border-slate-200/90 shadow-2xs text-sm text-slate-700 max-w-xl mx-auto lg:mx-0 flex items-start gap-3 text-left">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-slate-900 font-bold">Current Position: </strong>
                  {DOCTOR_PROFILE.currentPositionStatement}
                </p>
              </div>

              {/* Action Buttons - Direct WhatsApp Connection */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full max-w-md sm:max-w-none mx-auto lg:mx-0">
                <a
                  href="https://wa.me/919217179554?text=Hello%20Dr.%20Vineet%20Kumar%20Gupta,%20I%20would%20like%20to%20book%20an%20appointment%20for%20a%20consultation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </a>

                <a
                  href="#appointments"
                  className="w-full sm:w-auto px-5 py-3.5 text-sm sm:text-base font-semibold text-slate-700 hover:text-slate-900 active:bg-slate-100 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Check Timings &amp; Slots</span>
                </a>
              </div>
            </div>

            {/* RIGHT SIDE: Prominent Portrait Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
                {/* Subtle professional medical background treatment */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-teal-500/10 to-blue-400/5 rounded-3xl transform rotate-1 scale-102 -z-10" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl -z-10" />
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-teal-100/50 rounded-full blur-2xl -z-10" />

                <div className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-xl overflow-hidden">
                  <img
                    src={DOCTOR_PROFILE.image}
                    alt={DOCTOR_PROFILE.name}
                    className="w-full h-auto max-h-[460px] object-cover rounded-2xl border border-slate-100"
                    loading="eager"
                  />
                  <div className="pt-3 pb-1 px-2 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Consultations Active
                    </span>
                    <span className="text-slate-500 font-medium">
                      Reg: {DOCTOR_PROFILE.registrationNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. QUICK PROFILE STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-2 sm:gap-6 bg-white rounded-2xl border border-slate-200/90 shadow-md p-3.5 sm:p-6 overflow-hidden">
          {DOCTOR_PROFILE.quickStats.map((stat, idx) => (
            <div
              key={idx}
              className={`text-center py-2 px-2 sm:px-4 flex flex-col justify-center min-h-[68px] sm:min-h-[80px] ${
                idx % 2 === 0 ? 'border-r border-slate-100 lg:border-r' : 'lg:border-r lg:last:border-r-0'
              } ${idx === 3 ? 'lg:border-r-0' : ''}`}
            >
              <div
                className="text-sm xs:text-base sm:text-xl lg:text-2xl font-extrabold text-blue-950 tracking-tight leading-tight flex items-center justify-center min-h-[28px] sm:min-h-[36px]"
                title={stat.value}
              >
                {stat.value}
              </div>
              <div className="text-[11px] sm:text-xs lg:text-sm font-medium text-slate-500 mt-1 leading-snug">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ABOUT THE DOCTOR */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600">
                Meet Your Specialist
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                About {DOCTOR_PROFILE.name}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs sm:text-sm font-medium">
                Reg: {DOCTOR_PROFILE.registrationNumber}
              </span>
              <span className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-xs sm:text-sm font-medium">
                Languages: {DOCTOR_PROFILE.languagesDisplay}
              </span>
            </div>
          </div>

          <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p>{DOCTOR_PROFILE.about}</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/80 flex items-start gap-3.5 text-sm text-blue-950 text-left">
            <Building2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold leading-relaxed">{DOCTOR_PROFILE.currentPositionStatement}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SPECIALIZATION & EXPERTISE */}
      <section id="specializations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Clinical Focus
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Specialization &amp; Expertise
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Advanced diagnostic procedures and compassionate management of complex gastrointestinal and liver conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCTOR_PROFILE.expertise.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all flex items-start gap-3.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                  {item}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PROFESSIONAL EXPERIENCE */}
      <section id="experience" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Hospital Background
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Professional Experience
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A distinguished career serving leading superspeciality hospitals and research institutes across Delhi NCR and Haryana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCTOR_PROFILE.experienceHistory.map((exp, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                {index + 1}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {exp.institution}
                </h4>
                {exp.role && (
                  <p className="text-xs font-medium text-blue-700">
                    {exp.role}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. QUALIFICATIONS & MEMBERSHIPS */}
      <section id="qualifications" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Qualifications */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <Award className="w-4 h-4" />
                <span>Academic Credentials</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Qualifications
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DOCTOR_PROFILE.qualifications.map((qual, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{qual}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Registered Medical Practitioner: <strong>{DOCTOR_PROFILE.registrationNumber}</strong>
            </p>
          </div>

          {/* Professional Memberships */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
                <Layers className="w-4 h-4" />
                <span>Professional Associations</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Professional Memberships
              </h3>
            </div>

            <div className="space-y-3">
              {DOCTOR_PROFILE.memberships.map((membership, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-teal-50/40 border border-teal-100/70 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">{membership}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Active Member in leading Indian and International Gastroenterology Societies.
            </p>
          </div>

        </div>
      </section>

      {/* 7. AVAILABLE APPOINTMENTS */}
      <section id="appointments" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Direct Scheduling
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Available Appointments
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select an upcoming date and time slot to book your clinic consultation with {DOCTOR_PROFILE.name}.
            </p>
          </div>

          <Link
            to={`/book/${DOCTOR_PROFILE.id}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Complete Booking Form</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          {isLoadingSlots ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading live appointment slots...
            </div>
          ) : uniqueDates.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Open Slots This Week</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All scheduled slots for {DOCTOR_PROFILE.name} are currently occupied. Please contact the clinic directly at {DOCTOR_PROFILE.clinic.phone}.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date Selector Pills */}
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 block mb-2.5">
                  Select Consultation Date
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
                        <span className="block text-xs font-medium opacity-80 uppercase tracking-wider">
                          {dayName}
                        </span>
                        <span className="block text-base sm:text-lg font-bold leading-tight mt-0.5">
                          {dayNum} {monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots Grid */}
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 block mb-2.5">
                  Available Consultation Timings for {formatDateLabel(selectedDate).dayName}, {formatDateLabel(selectedDate).dayNum} {formatDateLabel(selectedDate).monthName}
                </span>

                {activeDateSlots.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No slots available for this date.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {activeDateSlots.map((slot) => {
                      const isChosen = selectedSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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

              {/* Slot Confirmation Action */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                  {selectedSlot ? (
                    <span className="text-slate-900 font-semibold">
                      Selected: {formatDateLabel(selectedDate).dayName}, {formatDateLabel(selectedDate).dayNum} {formatDateLabel(selectedDate).monthName} at {formatTime(selectedSlot.start_time)}
                    </span>
                  ) : (
                    <span>Select an available time slot above to connect directly with the doctor on WhatsApp.</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleWhatsAppBooking()}
                    className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{selectedSlot ? 'Book Selected Slot' : 'Book Appointment'}</span>
                  </button>

                  <button
                    onClick={() => handleBookSelected()}
                    className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Patient Details Form</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8. CLINIC INFORMATION */}
      <section id="clinic-info" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Clinic Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
                <span>{DOCTOR_PROFILE.clinic.branding}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {DOCTOR_PROFILE.clinic.name}
              </h3>

              <div className="space-y-3.5 pt-2 text-sm sm:text-base text-slate-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-slate-200">
                    {DOCTOR_PROFILE.clinic.address}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-slate-200">
                    Appointment Helpline: <a href={`tel:${DOCTOR_PROFILE.clinic.phone.replace(/\s+/g, '')}`} className="font-bold text-white hover:underline">{DOCTOR_PROFILE.clinic.phone}</a>
                  </p>
                </div>
              </div>

              {/* Direct Helpline Action in Clinic Section */}
              <div className="pt-2">
                <a
                  href={`tel:${DOCTOR_PROFILE.clinic.phone.replace(/\s+/g, '')}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-sm sm:text-base font-bold shadow-md transition-colors min-h-[48px]"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>Call Clinic Helpline ({DOCTOR_PROFILE.clinic.phone})</span>
                </a>
              </div>
            </div>

            {/* Consultation Timings Box */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/15 space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-300">
                <Clock className="w-4 h-4" />
                <span>Consultation Timings</span>
              </div>

              <div className="space-y-3 text-sm">
                {DOCTOR_PROFILE.clinic.timings.map((timing, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col xs:flex-row xs:items-center justify-between py-2 border-b border-white/10 last:border-b-0 gap-1.5 xs:gap-2"
                  >
                    <span className="font-medium text-slate-200">{timing.days}</span>
                    <span className="font-bold text-white bg-white/15 px-3 py-1 rounded-lg self-start xs:self-auto text-sm">
                      {timing.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <a
                  href="#appointments"
                  className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-xs transition-colors block text-center min-h-[46px] flex items-center justify-center"
                >
                  Check Open Slots
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL BOOKING CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-teal-700 rounded-3xl p-6 sm:p-10 lg:p-12 text-white text-center space-y-5 sm:space-y-6 shadow-xl overflow-hidden">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-white text-xs sm:text-sm font-bold uppercase tracking-wider">
            Powered by {APP_CONFIG.name}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold max-w-2xl mx-auto leading-tight tracking-tight">
            Schedule Your Consultation with {DOCTOR_PROFILE.name}
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Reserve your consultation slot in seconds. Instant confirmation with reference code and direct clinic coordination.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 max-w-md sm:max-w-none mx-auto">
            <a
              href="https://wa.me/919217179554?text=Hello%20Dr.%20Vineet%20Kumar%20Gupta,%20I%20would%20like%20to%20book%20an%20appointment%20for%20a%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 text-sm sm:text-base font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Calendar className="w-4 h-4 shrink-0 text-blue-700" />
              <span>Book Appointment</span>
            </a>
            <a
              href={`tel:${DOCTOR_PROFILE.clinic.phone.replace(/\s+/g, '')}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-800/60 hover:bg-blue-800 active:bg-blue-900 text-white text-sm sm:text-base font-semibold rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Call {DOCTOR_PROFILE.clinic.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
