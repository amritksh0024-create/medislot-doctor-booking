import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/HomePage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { BookingPage } from './pages/BookingPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Patient Dashboard Pages
import { PatientDashboardLayout } from './pages/patient/PatientDashboardLayout';
import { PatientOverviewPage } from './pages/patient/PatientOverviewPage';
import { PatientAppointmentsPage } from './pages/patient/PatientAppointmentsPage';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';

// Admin Dashboard Pages
import { AdminDashboardLayout } from './pages/admin/AdminDashboardLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage';
import { AdminSlotsPage } from './pages/admin/AdminSlotsPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminPatientsPage } from './pages/admin/AdminPatientsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative">
            {/* Primary Medical Application Header */}
            <Navbar />

            {/* Main Page Route Views */}
            <main className="flex-1">
              <Routes>
                {/* 1. Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/doctors/:doctorId" element={<DoctorDetailPage />} />
                <Route path="/book/:doctorId" element={<BookingPage />} />
                <Route path="/booking-success/:appointmentId" element={<BookingSuccessPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* 2. Protected Patient Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRole="patient">
                      <PatientDashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<PatientOverviewPage />} />
                  <Route path="appointments" element={<PatientAppointmentsPage />} />
                  <Route path="profile" element={<PatientProfilePage />} />
                </Route>

                {/* 3. Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <AdminDashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="doctors" element={<AdminDoctorsPage />} />
                  <Route path="slots" element={<AdminSlotsPage />} />
                  <Route path="appointments" element={<AdminAppointmentsPage />} />
                  <Route path="patients" element={<AdminPatientsPage />} />
                </Route>

                {/* 4. 404 Not Found Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Application Footer */}
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
