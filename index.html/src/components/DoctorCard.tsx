import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, CalendarCheck, ShieldCheck, Building2 } from 'lucide-react';
import { Doctor } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { DOCTOR_PROFILE } from '../config/doctorProfile';

interface DoctorCardProps {
  doctor: Doctor;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const isFeatured =
    doctor.id === DOCTOR_PROFILE.id ||
    doctor.name.includes('Vineet') ||
    doctor.specialization.includes('Gastro');

  return (
    <div
      id={`doctor-card-${doctor.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
    >
      <div className="p-5 sm:p-6">
        {/* Header with Avatar & Details */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={
                doctor.avatar_url ||
                (isFeatured ? DOCTOR_PROFILE.image : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400')
              }
              alt={doctor.name}
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border border-slate-100 shadow-2xs group-hover:scale-102 transition-transform duration-200"
              loading="lazy"
            />
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"
              title="Available for appointments"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 truncate">
                {doctor.specialization}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 ml-auto shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors truncate">
              {doctor.name}
            </h3>

            {(doctor.designation || isFeatured) && (
              <p className="text-xs font-bold text-blue-700 truncate mt-0.5">
                {doctor.designation || DOCTOR_PROFILE.designation}
              </p>
            )}

            <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-0.5" title={doctor.qualification}>
              {doctor.qualification}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {isFeatured ? DOCTOR_PROFILE.experience : `${doctor.experience_years}+ Years`} Experience
              </span>
            </div>
          </div>
        </div>

        {/* Short Bio */}
        <p className="text-xs text-slate-600 mt-4 line-clamp-2 leading-relaxed">
          {doctor.bio}
        </p>

        {/* Clinic & Location */}
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">
              {isFeatured ? DOCTOR_PROFILE.clinic.name : 'Outpatient Clinic'}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="truncate">
              {isFeatured ? DOCTOR_PROFILE.clinic.address : doctor.clinic_address}
            </span>
          </div>
        </div>
      </div>

      {/* Footer with Fee & Actions */}
      <div className="px-4 py-3.5 sm:px-6 bg-slate-50/80 border-t border-slate-100 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
        <div className="flex items-center justify-between xs:block">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-none">
            Consultation Fee
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900">
            {APP_CONFIG.currency}
            {doctor.consultation_fee}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/doctors/${doctor.id}`}
            className="flex-1 xs:flex-none text-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 active:bg-slate-200/70 bg-white xs:bg-transparent border xs:border-0 border-slate-200 rounded-xl transition-colors min-h-[38px] flex items-center justify-center whitespace-nowrap"
          >
            Profile
          </Link>
          <a
            href="https://wa.me/919217179554?text=Hello%20Dr.%20Vineet%20Kumar%20Gupta,%20I%20would%20like%20to%20book%20an%20appointment%20for%20a%20consultation."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 xs:flex-none px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[38px] whitespace-nowrap"
          >
            <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Book Appointment</span>
          </a>
        </div>
      </div>
    </div>
  );
};
