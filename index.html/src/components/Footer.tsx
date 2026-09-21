import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                {APP_CONFIG.name}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {APP_CONFIG.description}
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Specialist &amp; Direct Clinic Booking</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#about" className="hover:text-white transition-colors">
                  About Doctor
                </a>
              </li>
              <li>
                <a href="/#specializations" className="hover:text-white transition-colors">
                  Clinical Specialties
                </a>
              </li>
              <li>
                <a href="/#clinic-info" className="hover:text-white transition-colors">
                  Clinic &amp; Timings
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919217179554?text=Hello%20Dr.%20Vineet%20Kumar%20Gupta,%20I%20would%20like%20to%20book%20an%20appointment%20for%20a%20consultation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Book Appointment
                </a>
              </li>
            </ul>
          </div>

          {/* Medical Specialties */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Clinical Specialties
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400">Gastroenterology &amp; Hepatology</span>
              </li>
              <li>
                <span className="text-slate-400">Diagnostic &amp; Therapeutic Endoscopy</span>
              </li>
              <li>
                <span className="text-slate-400">Chronic Liver Disease &amp; Cirrhosis</span>
              </li>
              <li>
                <span className="text-slate-400">IBD, IBS &amp; GI Motility</span>
              </li>
              <li>
                <span className="text-slate-400">Pancreatic &amp; Biliary Care</span>
              </li>
            </ul>
          </div>

          {/* Support & Helpline */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Contact &amp; Support
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-slate-400">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{APP_CONFIG.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-400">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <a href="tel:+919217179554" className="hover:text-white text-slate-200 font-medium">
                +91 92171 79554
              </a>
              <span className="text-xs text-slate-400">(Clinic &amp; WhatsApp)</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-400">
              <Mail className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{APP_CONFIG.supportEmail}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 leading-relaxed">
          <p>
            <strong>Medical Disclaimer:</strong> {APP_CONFIG.name} is an appointment booking portal. In the event of an urgent medical emergency, please visit the nearest hospital emergency room immediately or call local emergency services.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="pt-4 mt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name} Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for healthcare accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
