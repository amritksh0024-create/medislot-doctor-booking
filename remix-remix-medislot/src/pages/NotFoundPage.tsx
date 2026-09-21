import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Stethoscope, ChevronLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-5 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
          <Stethoscope className="w-7 h-7" />
        </div>
        <div>
          <span className="text-4xl font-black text-slate-900 tracking-tight">404</span>
          <h1 className="text-xl font-bold text-slate-800 mt-1">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            The page or clinic resource you are looking for might have been moved or does not exist.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to MediSlot Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
