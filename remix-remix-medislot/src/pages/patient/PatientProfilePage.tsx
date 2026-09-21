import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Mail, Save, CheckCircle2, Shield, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(7, 'Please provide a valid phone number'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const PatientProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSaving(true);
      const res = await updateProfile({
        full_name: values.fullName,
        phone: values.phone,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to update profile');
      }

      showToast('success', 'Profile Updated', 'Your patient contact details have been saved.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating profile';
      showToast('error', 'Update Failed', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Keep your contact information up-to-date so clinic specialists can reach you
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              {...register('fullName')}
              className={`w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                errors.fullName ? 'border-red-300' : 'border-slate-200'
              }`}
              placeholder="Your full legal name"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email Address - View Only per Spec */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Email Address <span className="text-slate-400 font-normal">(View-only)</span>
            </label>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Managed by Auth
            </span>
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Email address is tied to your login credentials and cannot be modified here.
          </p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              {...register('phone')}
              className={`w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                errors.phone ? 'border-red-300' : 'border-slate-200'
              }`}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">
            Used by the clinic for booking reminders and emergency notifications.
          </p>
        </div>

        {/* Account Role Badge */}
        <div className="pt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Account Role</span>
          </div>
          <span className="capitalize font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            {profile?.role || 'patient'}
          </span>
        </div>

        {/* Save Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
