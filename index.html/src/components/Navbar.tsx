import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  LogOut,
  Menu,
  X,
  Shield,
  Phone,
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { DOCTOR_PROFILE } from '../config/doctorProfile';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isHome = location.pathname === '/';

  // Smooth scroll helper for on-page sections when on home, or navigate to home with hash
  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(`/#${sectionId}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 min-h-[56px] gap-2 sm:gap-4">
          
          {/* Compact Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-hidden shrink-0"
            id="navbar-brand-link"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform duration-150 shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none whitespace-nowrap">
                {APP_CONFIG.name}
              </span>
              <span className="hidden md:inline text-xs text-slate-500 font-medium border-l border-slate-200 pl-2 whitespace-nowrap">
                Gastro Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Non-colliding spacing */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 shrink-0" aria-label="Main Navigation">
            <Link
              to="/"
              className={`text-xs xl:text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/') && !location.hash
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>

            <button
              onClick={() => handleNavClick('about')}
              className="text-xs xl:text-sm font-medium whitespace-nowrap text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              About
            </button>

            <button
              onClick={() => handleNavClick('specializations')}
              className="text-xs xl:text-sm font-medium whitespace-nowrap text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Specialties
            </button>

            <button
              onClick={() => handleNavClick('experience')}
              className="text-xs xl:text-sm font-medium whitespace-nowrap text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Experience
            </button>

            <button
              onClick={() => handleNavClick('clinic-info')}
              className="text-xs xl:text-sm font-medium whitespace-nowrap text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Clinic &amp; Timings
            </button>

            {user && role === 'patient' && (
              <Link
                to="/dashboard/appointments"
                className={`text-xs xl:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard/appointments')
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                <span>My Bookings</span>
              </Link>
            )}

            {user && role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white shadow-2xs hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/919217179554?text=Hello%20Dr.%20Vineet%20Kumar%20Gupta,%20I%20would%20like%20to%20book%20an%20appointment%20for%20a%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 xl:px-4 py-2 text-xs xl:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 xl:gap-2 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Book Appointment</span>
            </a>

            {/* Admin shortcut if logged in */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 shrink-0">
                <Link
                  to={role === 'admin' ? '/admin' : '/dashboard/profile'}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors shrink-0"
                  title="My Account"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Right Controls */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href="https://wa.me/919217179554?text=Hello%20Dr.%20Vineet%20Kumar%20Gupta,%20I%20would%20like%20to%20book%20an%20appointment%20for%20a%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-2xs min-h-[36px] sm:min-h-[40px] flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Book Appointment</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 active:bg-slate-100 rounded-lg min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 shrink-0" /> : <Menu className="w-5 h-5 shrink-0" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 rounded-xl"
            >
              Home
            </Link>
            <button
              onClick={() => handleNavClick('about')}
              className="w-full text-left px-3.5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 rounded-xl cursor-pointer"
            >
              About Doctor
            </button>
            <button
              onClick={() => handleNavClick('specializations')}
              className="w-full text-left px-3.5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 rounded-xl cursor-pointer"
            >
              Clinical Specialties
            </button>
            <button
              onClick={() => handleNavClick('experience')}
              className="w-full text-left px-3.5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 rounded-xl cursor-pointer"
            >
              Experience History
            </button>
            <button
              onClick={() => handleNavClick('clinic-info')}
              className="w-full text-left px-3.5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 rounded-xl cursor-pointer"
            >
              Clinic &amp; Timings
            </button>

            {user && role === 'patient' && (
              <Link
                to="/dashboard/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-xl"
              >
                My Bookings
              </Link>
            )}

            {user && role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 rounded-xl"
              >
                Admin Portal
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-slate-800 text-sm truncate max-w-[200px]">
                  {profile?.full_name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 active:bg-red-100 rounded-lg min-h-[40px] cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="https://wa.me/919217179554?text=Hello%20Dr.%20Vineet%20Kumar%20Gupta,%20I%20would%20like%20to%20book%20an%20appointment%20for%20a%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl min-h-[46px] flex items-center justify-center gap-2 shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
