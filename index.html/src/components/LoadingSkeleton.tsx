import React from 'react';

export const DoctorCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-5 bg-slate-200 rounded-md w-3/4" />
          <div className="h-4 bg-slate-200 rounded-md w-1/2" />
          <div className="h-3.5 bg-slate-100 rounded-md w-2/3" />
        </div>
      </div>
      <div className="h-10 bg-slate-100 rounded-xl mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="h-5 bg-slate-200 rounded-md w-1/4" />
        <div className="h-9 bg-slate-200 rounded-xl w-1/3" />
      </div>
    </div>
  );
};

export const AppointmentCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs animate-pulse space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="h-4 bg-slate-200 rounded-md w-24" />
        <div className="h-5 bg-slate-200 rounded-full w-20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-200 rounded-md w-1/2" />
          <div className="h-3.5 bg-slate-100 rounded-md w-2/3" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        </td>
      ))}
    </tr>
  );
};

export const PageSpinner: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
};
