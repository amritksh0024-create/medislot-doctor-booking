-- ==============================================================================
-- MediSlot - Supabase Database Schema
-- Doctor Appointment Booking Web App
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running (safe initialization)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.book_appointment_slot(UUID, UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.cancel_appointment(UUID);
DROP FUNCTION IF EXISTS public.admin_reschedule_appointment(UUID, UUID);
DROP FUNCTION IF EXISTS public.admin_update_appointment_status(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.is_admin();

DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.availability_slots CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==============================================================================
-- 3. Profiles Table
-- Holds patient and admin metadata linked to Supabase auth.users
-- ==============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast role checks
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Helper function: is_admin() - checks if the current authenticated user has role = 'admin'
-- Marked SECURITY DEFINER so that it can inspect profiles safely without recursive RLS issues
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Automatically create profile on Supabase auth user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Patient User'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'patient' -- Strictly enforce patient role for new registrations
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. Doctors Table
-- Stores public doctor profiles managed by admins
-- ==============================================================================
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    qualification TEXT NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 1 CHECK (experience_years >= 0),
    bio TEXT NOT NULL,
    clinic_address TEXT NOT NULL,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (consultation_fee >= 0),
    avatar_url TEXT,
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX idx_doctors_is_active ON public.doctors(is_active);

-- ==============================================================================
-- 5. Availability Slots Table
-- Stores doctor time slots. Prevents duplicates for (doctor_id, slot_date, start_time)
-- ==============================================================================
CREATE TABLE public.availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, slot_date, start_time),
    CONSTRAINT chk_slot_time_order CHECK (end_time > start_time)
);

CREATE INDEX idx_slots_doctor_date ON public.availability_slots(doctor_id, slot_date);
CREATE INDEX idx_slots_available ON public.availability_slots(is_available);

-- ==============================================================================
-- 6. Appointments Table
-- Stores bookings made by patients for specific doctor slots
-- ==============================================================================
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    slot_id UUID NOT NULL REFERENCES public.availability_slots(id) ON DELETE RESTRICT,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    reason_for_visit TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'cancelled', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_ref ON public.appointments(booking_reference);

-- ==============================================================================
-- 7. Secure Booking RPC Function (Atomic, Prevents Double Booking)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.book_appointment_slot(
    p_doctor_id UUID,
    p_slot_id UUID,
    p_patient_name TEXT,
    p_patient_phone TEXT,
    p_reason_for_visit TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_patient_id UUID;
    v_slot RECORD;
    v_booking_ref TEXT;
    v_new_appointment RECORD;
BEGIN
    -- 1. Ensure caller is authenticated
    v_patient_id := auth.uid();
    IF v_patient_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to book an appointment.';
    END IF;

    -- 2. Validate input parameters
    IF p_patient_name IS NULL OR trim(p_patient_name) = '' THEN
        RAISE EXCEPTION 'Patient name is required.';
    END IF;
    IF p_patient_phone IS NULL OR trim(p_patient_phone) = '' THEN
        RAISE EXCEPTION 'Patient phone number is required.';
    END IF;

    -- 3. Lock the availability slot row for update (Atomic guarantee)
    SELECT * INTO v_slot
    FROM public.availability_slots
    WHERE id = p_slot_id AND doctor_id = p_doctor_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment slot does not exist.';
    END IF;

    IF v_slot.is_available = FALSE THEN
        RAISE EXCEPTION 'This slot has already been booked. Please select another slot.';
    END IF;

    -- 4. Generate readable unique booking reference (e.g. MED-8F2K91)
    LOOP
        v_booking_ref := 'MED-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.appointments WHERE booking_reference = v_booking_ref);
    END LOOP;

    -- 5. Mark slot as unavailable
    UPDATE public.availability_slots
    SET is_available = FALSE
    WHERE id = p_slot_id;

    -- 6. Create the appointment record (defaults to 'confirmed' for clean UX)
    INSERT INTO public.appointments (
        booking_reference,
        patient_id,
        doctor_id,
        slot_id,
        patient_name,
        patient_phone,
        reason_for_visit,
        status
    )
    VALUES (
        v_booking_ref,
        v_patient_id,
        p_doctor_id,
        p_slot_id,
        trim(p_patient_name),
        trim(p_patient_phone),
        trim(COALESCE(p_reason_for_visit, '')),
        'confirmed'
    )
    RETURNING * INTO v_new_appointment;

    -- 7. Return created appointment details
    RETURN jsonb_build_object(
        'success', TRUE,
        'appointment_id', v_new_appointment.id,
        'booking_reference', v_booking_ref,
        'status', v_new_appointment.status,
        'doctor_id', v_new_appointment.doctor_id,
        'slot_id', v_new_appointment.slot_id,
        'patient_name', v_new_appointment.patient_name,
        'created_at', v_new_appointment.created_at
    );
END;
$$;

-- ==============================================================================
-- 8. Secure Cancel RPC Function
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.cancel_appointment(
    p_appointment_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_is_admin BOOLEAN;
    v_appt RECORD;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    v_is_admin := public.is_admin();

    -- Find the appointment
    SELECT * INTO v_appt
    FROM public.appointments
    WHERE id = p_appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment not found.';
    END IF;

    -- Authorization check: must be patient owner or admin
    IF v_appt.patient_id <> v_uid AND NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: you can only cancel your own appointments.';
    END IF;

    IF v_appt.status = 'cancelled' THEN
        RAISE EXCEPTION 'Appointment is already cancelled.';
    END IF;

    IF v_appt.status = 'completed' THEN
        RAISE EXCEPTION 'Completed appointments cannot be cancelled.';
    END IF;

    -- Release slot
    UPDATE public.availability_slots
    SET is_available = TRUE
    WHERE id = v_appt.slot_id;

    -- Update appointment status
    UPDATE public.appointments
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = p_appointment_id;

    RETURN jsonb_build_object('success', TRUE, 'message', 'Appointment cancelled and slot released.');
END;
$$;

-- ==============================================================================
-- 9. Admin Reschedule RPC Function
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_reschedule_appointment(
    p_appointment_id UUID,
    p_new_slot_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_appt RECORD;
    v_new_slot RECORD;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: only administrators can reschedule appointments.';
    END IF;

    SELECT * INTO v_appt
    FROM public.appointments
    WHERE id = p_appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment not found.';
    END IF;

    -- Lock and verify new slot
    SELECT * INTO v_new_slot
    FROM public.availability_slots
    WHERE id = p_new_slot_id AND doctor_id = v_appt.doctor_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'New slot does not exist for this doctor.';
    END IF;

    IF v_new_slot.is_available = FALSE THEN
        RAISE EXCEPTION 'The selected new slot is no longer available.';
    END IF;

    -- Release old slot
    UPDATE public.availability_slots
    SET is_available = TRUE
    WHERE id = v_appt.slot_id;

    -- Reserve new slot
    UPDATE public.availability_slots
    SET is_available = FALSE
    WHERE id = p_new_slot_id;

    -- Update appointment
    UPDATE public.appointments
    SET slot_id = p_new_slot_id,
        status = 'rescheduled',
        updated_at = NOW()
    WHERE id = p_appointment_id;

    RETURN jsonb_build_object('success', TRUE, 'message', 'Appointment successfully rescheduled.');
END;
$$;

-- ==============================================================================
-- 10. Admin Update Status Function
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_update_appointment_status(
    p_appointment_id UUID,
    p_new_status TEXT,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_appt RECORD;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: admin access required.';
    END IF;

    SELECT * INTO v_appt
    FROM public.appointments
    WHERE id = p_appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment not found.';
    END IF;

    -- If transitioning to cancelled, make sure slot is released
    IF p_new_status = 'cancelled' AND v_appt.status <> 'cancelled' THEN
        UPDATE public.availability_slots
        SET is_available = TRUE
        WHERE id = v_appt.slot_id;
    END IF;

    -- If reactivating from cancelled to confirmed, try to re-reserve slot
    IF v_appt.status = 'cancelled' AND p_new_status IN ('confirmed', 'pending') THEN
        UPDATE public.availability_slots
        SET is_available = FALSE
        WHERE id = v_appt.slot_id;
    END IF;

    UPDATE public.appointments
    SET status = p_new_status,
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        updated_at = NOW()
    WHERE id = p_appointment_id;

    RETURN jsonb_build_object('success', TRUE, 'message', 'Appointment status updated.');
END;
$$;

-- ==============================================================================
-- 11. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
-- Patients can view their own profile; Admins can view all profiles
CREATE POLICY "Users can view own profile or admins view all"
ON public.profiles
FOR SELECT
USING (
    auth.uid() = id OR public.is_admin()
);

-- Users can update only their own profile (and cannot alter role directly)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND
    -- Role cannot be changed via standard update unless admin
    (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR public.is_admin())
);

-- ------------------------------------------------------------------------------
-- Doctors Policies
-- ------------------------------------------------------------------------------
-- Public visitors and patients can view active doctors; Admins can view all doctors
CREATE POLICY "Anyone can view active doctors"
ON public.doctors
FOR SELECT
USING (
    is_active = TRUE OR public.is_admin()
);

-- Only admins can insert doctors
CREATE POLICY "Admins can insert doctors"
ON public.doctors
FOR INSERT
WITH CHECK (public.is_admin());

-- Only admins can update doctors
CREATE POLICY "Admins can update doctors"
ON public.doctors
FOR UPDATE
USING (public.is_admin());

-- Only admins can delete doctors
CREATE POLICY "Admins can delete doctors"
ON public.doctors
FOR DELETE
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Availability Slots Policies
-- ------------------------------------------------------------------------------
-- Public & patients can view slots that are available and on/after today; Admins view all
CREATE POLICY "Anyone can view future available slots"
ON public.availability_slots
FOR SELECT
USING (
    (is_available = TRUE AND slot_date >= CURRENT_DATE)
    OR public.is_admin()
    -- Also allow patients to view the slot belonging to their booked appointment
    OR EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.slot_id = availability_slots.id AND a.patient_id = auth.uid()
    )
);

-- Only admins can insert slots
CREATE POLICY "Admins can insert slots"
ON public.availability_slots
FOR INSERT
WITH CHECK (public.is_admin());

-- Only admins can update slots directly (patient slot reservation handled via RPC)
CREATE POLICY "Admins can update slots"
ON public.availability_slots
FOR UPDATE
USING (public.is_admin());

-- Only admins can delete slots
CREATE POLICY "Admins can delete slots"
ON public.availability_slots
FOR DELETE
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Appointments Policies
-- ------------------------------------------------------------------------------
-- Patients can view only their own appointments; Admins can view all
CREATE POLICY "Patients view own appointments or admin views all"
ON public.appointments
FOR SELECT
USING (
    auth.uid() = patient_id OR public.is_admin()
);

-- Authenticated patients can insert appointments for themselves
CREATE POLICY "Patients can create appointments for themselves"
ON public.appointments
FOR INSERT
WITH CHECK (
    auth.uid() = patient_id OR public.is_admin()
);

-- Patients can cancel their own appointments, Admins can update any
CREATE POLICY "Patients can update own appointment or admin updates all"
ON public.appointments
FOR UPDATE
USING (
    auth.uid() = patient_id OR public.is_admin()
)
WITH CHECK (
    auth.uid() = patient_id OR public.is_admin()
);
