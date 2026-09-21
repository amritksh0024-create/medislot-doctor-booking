import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, LogIn, AlertCircle, Shield, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { APP_CONFIG } from '../config/appConfig';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, role } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Return to destination route if set (e.g. from `/book/:doctorId`)
  const fromLocation = (location.state as { from?: { pathname?: string; search?: string } })?.from;
  const returnUrl = fromLocation
    ? `${fromLocation.pathname || '/'}${fromLocation.search || ''}`
    : null;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await login(values.email, values.password);

      if (!result.success) {
        setErrorMessage(result.error || 'Invalid email or password.');
        return;
      }

      showToast('success', 'Logged in successfully', 'Welcome back to MediSlot');

      if (returnUrl) {
        navigate(returnUrl, { replace: true });
      } else if (values.email.toLowerCase().includes('admin')) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: 'patient' | 'admin') => {
    loginAsDemo(demoRole);
    showToast('success', `Signed in as Demo ${demoRole === 'admin' ? 'Admin' : 'Patient'}`);
    if (returnUrl) {
      navigate(returnUrl, { replace: true });
    } else if (demoRole === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
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
            Sign in to your account
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Access your doctor appointments and patient health scheduling
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                {...register('password')}
                className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                  errors.password ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-sm sm:text-base rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center pt-3 text-sm text-slate-600 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create patient account
          </Link>
        </div>
      </div>
    </div>
  );
};
