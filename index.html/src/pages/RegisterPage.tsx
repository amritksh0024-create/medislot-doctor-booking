import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, UserPlus, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(7, 'Please enter a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await signup({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed. Please try again.');
        return;
      }

      if (result.requiresEmailConfirmation) {
        setEmailConfirmationRequired(true);
        showToast(
          'info',
          'Confirmation Email Sent',
          'Please verify your email address before logging in.'
        );
      } else {
        showToast('success', 'Account created!', 'Welcome to MediSlot.');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-md">
        {/* Brand & Heading */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Patient Account
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Sign up to schedule doctor consultations and track medical visits
          </p>
        </div>

        {/* Email Confirmation Notice (if enabled in Supabase) */}
        {emailConfirmationRequired ? (
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Check your inbox</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We have dispatched a verification link to your email. Click the link in your email to confirm your account, then return to sign in.
            </p>
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
            >
              Proceed to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...register('fullName')}
                    className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                      errors.fullName ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="E.g., Jane Doe"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                      errors.email ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    {...register('phone')}
                    className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                      errors.phone ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    {...register('password')}
                    className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                      errors.password ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                      errors.confirmPassword ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-sm sm:text-base rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center pt-3 text-sm text-slate-600 border-t border-slate-100">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in here
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
