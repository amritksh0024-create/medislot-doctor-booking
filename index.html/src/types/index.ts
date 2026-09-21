/**
 * Shared TypeScript Definitions for MediSlot
 */

export type UserRole = 'patient' | 'admin';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'rescheduled'
  | 'cancelled'
  | 'completed';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  bio: string;
  clinic_address: string;
  consultation_fee: number;
  avatar_url: string | null;
  rating: number;
  review_count: number;
  is_active: boolean;
  registration_no?: string;
  designation?: string;
  languages?: string[];
  current_position?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  id: string;
  doctor_id: string;
  slot_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS or HH:MM
  end_time: string; // HH:MM:SS or HH:MM
  is_available: boolean;
  is_booked?: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  booking_reference: string;
  patient_id: string;
  doctor_id: string;
  slot_id: string;
  patient_name: string;
  patient_phone: string;
  reason_for_visit: string | null;
  status: AppointmentStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation metadata
  doctor?: Doctor;
  slot?: AvailabilitySlot;
}

export interface BookAppointmentPayload {
  doctorId: string;
  slotId: string;
  patientName: string;
  patientPhone: string;
  reasonForVisit?: string;
}

export interface BookAppointmentResponse {
  success: boolean;
  appointment_id?: string;
  booking_reference?: string;
  status?: AppointmentStatus;
  error?: string;
}

export interface AdminMetrics {
  totalDoctors: number;
  totalAppointments: number;
  todayAppointments: number;
  totalPatients: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
}
