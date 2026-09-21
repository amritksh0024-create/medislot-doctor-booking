import React from 'react';
import { AppointmentStatus } from '../types';

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    rescheduled: {
      label: 'Rescheduled',
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-500',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-red-50 text-red-800 border-red-200',
      dot: 'bg-red-500',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-slate-100 text-slate-800 border-slate-300',
      dot: 'bg-slate-500',
    },
  }[status] || {
    label: status,
    bg: 'bg-gray-50 text-gray-800 border-gray-200',
    dot: 'bg-gray-400',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      id={`status-badge-${status}`}
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses} capitalize select-none font-medium`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
