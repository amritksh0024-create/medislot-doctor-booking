import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Doctor,
  AvailabilitySlot,
  Appointment,
  BookAppointmentPayload,
  BookAppointmentResponse,
  AppointmentStatus,
  Profile,
} from '../types';
import {
  INITIAL_DEMO_DOCTORS,
  generateInitialDemoSlots,
  generateInitialDemoAppointments,
  DEMO_PATIENT_PROFILE,
  DEMO_ADMIN_PROFILE,
} from './demoData';

// 1. Read Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith('https://') &&
      supabaseAnonKey.length > 20 &&
      !supabaseUrl.includes('placeholder')
  );
};

// 2. Initialize live client if configured, or a safe null client
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// ==============================================================================
// Reactive Demo Storage (Active when Supabase keys are not provided or in demo mode)
// Ensures the entire web app is 100% testable and never crashes!
// ==============================================================================
class DemoStorage {
  private doctors: Doctor[];
  private slots: AvailabilitySlot[];
  private appointments: Appointment[];
  private profiles: Profile[];

  constructor() {
    // Load from localStorage if available to persist between page refreshes
    const savedDocs = localStorage.getItem('medislot_demo_doctors');
    const savedSlots = localStorage.getItem('medislot_demo_slots');
    const savedAppts = localStorage.getItem('medislot_demo_appointments');
    const savedProfiles = localStorage.getItem('medislot_demo_profiles');

    if (savedDocs && savedSlots && savedAppts) {
      try {
        const parsedDocs = JSON.parse(savedDocs);
        const parsedSlots = JSON.parse(savedSlots);
        const parsedAppts = JSON.parse(savedAppts);
        
        // Ensure verified featured doctor is always included
        if (Array.isArray(parsedDocs) && parsedDocs.some((d: Doctor) => d.id === 'doc-dr-vineet-gupta')) {
          this.doctors = parsedDocs;
          this.slots = parsedSlots;
          this.appointments = parsedAppts;
          this.profiles = savedProfiles
            ? JSON.parse(savedProfiles)
            : [DEMO_PATIENT_PROFILE, DEMO_ADMIN_PROFILE];
          return;
        }
      } catch {
        // Fallback to fresh generation
      }
    }

    this.doctors = [...INITIAL_DEMO_DOCTORS];
    this.slots = generateInitialDemoSlots(this.doctors);
    this.appointments = generateInitialDemoAppointments(this.doctors, this.slots);
    this.profiles = [DEMO_PATIENT_PROFILE, DEMO_ADMIN_PROFILE];
    this.save();
  }

  private save() {
    try {
      localStorage.setItem('medislot_demo_doctors', JSON.stringify(this.doctors));
      localStorage.setItem('medislot_demo_slots', JSON.stringify(this.slots));
      localStorage.setItem('medislot_demo_appointments', JSON.stringify(this.appointments));
      localStorage.setItem('medislot_demo_profiles', JSON.stringify(this.profiles));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  public resetToDefaults() {
    this.doctors = [...INITIAL_DEMO_DOCTORS];
    this.slots = generateInitialDemoSlots(this.doctors);
    this.appointments = generateInitialDemoAppointments(this.doctors, this.slots);
    this.profiles = [DEMO_PATIENT_PROFILE, DEMO_ADMIN_PROFILE];
    this.save();
  }

  public getDoctors(): Doctor[] {
    return [...this.doctors];
  }

  public getDoctorById(id: string): Doctor | undefined {
    return this.doctors.find((d) => d.id === id);
  }

  public saveDoctor(doctor: Partial<Doctor> & { id?: string }): Doctor {
    if (doctor.id) {
      const index = this.doctors.findIndex((d) => d.id === doctor.id);
      if (index !== -1) {
        this.doctors[index] = {
          ...this.doctors[index],
          ...doctor,
          updated_at: new Date().toISOString(),
        } as Doctor;
        this.save();
        return this.doctors[index];
      }
    }
    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      name: doctor.name || 'Dr. New Doctor',
      specialization: doctor.specialization || 'General Physician',
      qualification: doctor.qualification || 'MBBS, MD',
      experience_years: doctor.experience_years || 5,
      bio: doctor.bio || 'Experienced medical practitioner.',
      clinic_address: doctor.clinic_address || 'MediSlot Medical Center',
      consultation_fee: doctor.consultation_fee || 80,
      avatar_url:
        doctor.avatar_url ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
      rating: 5.0,
      review_count: 0,
      is_active: doctor.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.doctors.push(newDoc);
    this.save();
    return newDoc;
  }

  public deleteDoctor(doctorId: string): boolean {
    const hasBookings = this.appointments.some((a) => a.doctor_id === doctorId);
    if (hasBookings) {
      throw new Error('Cannot delete a doctor with active appointments. Please deactivate them instead.');
    }
    this.doctors = this.doctors.filter((d) => d.id !== doctorId);
    this.slots = this.slots.filter((s) => s.doctor_id !== doctorId);
    this.save();
    return true;
  }

  public getAvailableSlots(doctorId: string, date?: string): AvailabilitySlot[] {
    return this.slots.filter((s) => {
      const matchDoc = s.doctor_id === doctorId;
      const matchDate = date ? s.slot_date === date : true;
      return matchDoc && matchDate && s.is_available;
    });
  }

  public getAllSlots(doctorId?: string): AvailabilitySlot[] {
    if (doctorId) {
      return this.slots.filter((s) => s.doctor_id === doctorId);
    }
    return [...this.slots];
  }

  public toggleSlotAvailability(slotId: string, isAvailable?: boolean): AvailabilitySlot {
    const slot = this.slots.find((s) => s.id === slotId);
    if (!slot) throw new Error('Slot not found');
    slot.is_available = isAvailable !== undefined ? isAvailable : !slot.is_available;
    this.save();
    return slot;
  }

  public deleteSlot(slotId: string): boolean {
    const isBookedInAppt = this.appointments.some(
      (a) => a.slot_id === slotId && a.status !== 'cancelled'
    );
    if (isBookedInAppt) {
      throw new Error('Cannot delete a slot currently booked for an active appointment.');
    }
    this.slots = this.slots.filter((s) => s.id !== slotId);
    this.save();
    return true;
  }

  public generateSlots(
    doctorId: string,
    slotDate: string,
    startTime: string,
    endTime: string,
    intervalMinutes: number
  ): AvailabilitySlot[] {
    const newSlots: AvailabilitySlot[] = [];

    // Parse times HH:MM
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let curMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= curMinutes) {
      throw new Error('End time must be later than start time.');
    }

    while (curMinutes + intervalMinutes <= endMinutes) {
      const slotStartH = String(Math.floor(curMinutes / 60)).padStart(2, '0');
      const slotStartM = String(curMinutes % 60).padStart(2, '0');
      const nextMin = curMinutes + intervalMinutes;
      const slotEndH = String(Math.floor(nextMin / 60)).padStart(2, '0');
      const slotEndM = String(nextMin % 60).padStart(2, '0');

      const startT = `${slotStartH}:${slotStartM}:00`;
      const endT = `${slotEndH}:${slotEndM}:00`;

      // Check duplicate
      const duplicate = this.slots.some(
        (s) => s.doctor_id === doctorId && s.slot_date === slotDate && s.start_time.startsWith(`${slotStartH}:${slotStartM}`)
      );

      if (!duplicate) {
        const slot: AvailabilitySlot = {
          id: `slot-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          doctor_id: doctorId,
          slot_date: slotDate,
          start_time: startT,
          end_time: endT,
          is_available: true,
          created_at: new Date().toISOString(),
        };
        newSlots.push(slot);
        this.slots.push(slot);
      }

      curMinutes += intervalMinutes;
    }

    this.save();
    return newSlots;
  }

  public bookAppointment(
    payload: BookAppointmentPayload,
    patientId: string
  ): BookAppointmentResponse {
    const slot = this.slots.find((s) => s.id === payload.slotId && s.doctor_id === payload.doctorId);
    if (!slot) {
      return { success: false, error: 'Appointment slot not found.' };
    }
    if (!slot.is_available) {
      return {
        success: false,
        error: 'This slot has just been booked by another patient. Please choose a different time.',
      };
    }

    const doctor = this.doctors.find((d) => d.id === payload.doctorId);
    if (!doctor) {
      return { success: false, error: 'Selected doctor could not be found.' };
    }

    // Atomic simulation: lock slot
    slot.is_available = false;

    const ref = `MED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      booking_reference: ref,
      patient_id: patientId,
      doctor_id: payload.doctorId,
      slot_id: payload.slotId,
      patient_name: payload.patientName,
      patient_phone: payload.patientPhone,
      reason_for_visit: payload.reasonForVisit || null,
      status: 'confirmed',
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      doctor,
      slot,
    };

    this.appointments.unshift(newAppt);
    this.save();

    return {
      success: true,
      appointment_id: newAppt.id,
      booking_reference: ref,
      status: 'confirmed',
    };
  }

  public getAppointments(patientId?: string): Appointment[] {
    return this.appointments
      .filter((a) => (patientId ? a.patient_id === patientId : true))
      .map((a) => ({
        ...a,
        doctor: a.doctor || this.doctors.find((d) => d.id === a.doctor_id),
        slot: a.slot || this.slots.find((s) => s.id === a.slot_id),
      }));
  }

  public getAppointmentById(id: string): Appointment | undefined {
    const a = this.appointments.find((item) => item.id === id || item.booking_reference === id);
    if (!a) return undefined;
    return {
      ...a,
      doctor: a.doctor || this.doctors.find((d) => d.id === a.doctor_id),
      slot: a.slot || this.slots.find((s) => s.id === a.slot_id),
    };
  }

  public cancelAppointment(appointmentId: string): boolean {
    const appt = this.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new Error('Appointment not found');
    if (appt.status === 'cancelled') throw new Error('Appointment is already cancelled');

    appt.status = 'cancelled';
    appt.updated_at = new Date().toISOString();

    // Release slot
    const slot = this.slots.find((s) => s.id === appt.slot_id);
    if (slot) {
      slot.is_available = true;
    }

    this.save();
    return true;
  }

  public rescheduleAppointment(appointmentId: string, newSlotId: string): boolean {
    const appt = this.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new Error('Appointment not found');

    const newSlot = this.slots.find((s) => s.id === newSlotId && s.doctor_id === appt.doctor_id);
    if (!newSlot) throw new Error('New slot not found for this doctor');
    if (!newSlot.is_available) throw new Error('Selected slot is no longer available');

    // Free old slot
    const oldSlot = this.slots.find((s) => s.id === appt.slot_id);
    if (oldSlot) oldSlot.is_available = true;

    // Reserve new slot
    newSlot.is_available = false;

    appt.slot_id = newSlotId;
    appt.slot = newSlot;
    appt.status = 'rescheduled';
    appt.updated_at = new Date().toISOString();

    this.save();
    return true;
  }

  public updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    adminNotes?: string
  ): boolean {
    const appt = this.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new Error('Appointment not found');

    // If cancelled, free slot
    if (status === 'cancelled' && appt.status !== 'cancelled') {
      const slot = this.slots.find((s) => s.id === appt.slot_id);
      if (slot) slot.is_available = true;
    }

    appt.status = status;
    if (adminNotes !== undefined) appt.admin_notes = adminNotes;
    appt.updated_at = new Date().toISOString();

    this.save();
    return true;
  }

  public addSlot(slot: {
    doctor_id: string;
    slot_date: string;
    start_time: string;
    end_time: string;
    is_available?: boolean;
  }): AvailabilitySlot {
    const sTime = slot.start_time.length === 5 ? `${slot.start_time}:00` : slot.start_time;
    const eTime = slot.end_time.length === 5 ? `${slot.end_time}:00` : slot.end_time;
    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      doctor_id: slot.doctor_id,
      slot_date: slot.slot_date,
      start_time: sTime,
      end_time: eTime,
      is_available: slot.is_available ?? true,
      created_at: new Date().toISOString(),
    };
    this.slots.push(newSlot);
    this.save();
    return newSlot;
  }

  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  public updateProfile(profileId: string, data: Partial<Profile>): Profile {
    const index = this.profiles.findIndex((p) => p.id === profileId);
    if (index !== -1) {
      this.profiles[index] = {
        ...this.profiles[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.profiles[index];
    }
    const newP: Profile = {
      id: profileId,
      full_name: data.full_name || 'User',
      phone: data.phone || null,
      role: data.role || 'patient',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.push(newP);
    this.save();
    return newP;
  }
}

export const demoStore = new DemoStorage();

// ==============================================================================
// High-Level MediSlot Data Service (Handles Live Supabase or Demo Store)
// ==============================================================================
export const dataService = {
  // Fetch active doctors (or all if admin)
  async getDoctors(includeInactive = false): Promise<Doctor[]> {
    if (supabase) {
      let query = supabase.from('doctors').select('*').order('name', { ascending: true });
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[Supabase] Error fetching doctors, falling back to demo data:', error.message);
        return demoStore.getDoctors().filter((d) => includeInactive || d.is_active);
      }
      return data as Doctor[];
    }
    return demoStore.getDoctors().filter((d) => includeInactive || d.is_active);
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    if (supabase) {
      const { data, error } = await supabase.from('doctors').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        return demoStore.getDoctorById(id) || null;
      }
      return data as Doctor;
    }
    return demoStore.getDoctorById(id) || null;
  },

  async getAvailableSlots(doctorId: string, date?: string): Promise<AvailabilitySlot[]> {
    if (supabase) {
      let query = supabase
        .from('availability_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_available', true)
        .gte('slot_date', new Date().toISOString().split('T')[0])
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (date) {
        query = query.eq('slot_date', date);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[Supabase] Error fetching slots, using fallback:', error.message);
        return demoStore.getAvailableSlots(doctorId, date);
      }
      return data as AvailabilitySlot[];
    }
    return demoStore.getAvailableSlots(doctorId, date);
  },

  async getAllDoctorSlots(doctorId: string): Promise<AvailabilitySlot[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        return demoStore.getAllSlots(doctorId);
      }
      return data as AvailabilitySlot[];
    }
    return demoStore.getAllSlots(doctorId);
  },

  async bookAppointment(
    payload: BookAppointmentPayload,
    patientId: string
  ): Promise<BookAppointmentResponse> {
    if (supabase) {
      // Call atomic PostgreSQL RPC function defined in supabase/schema.sql
      const { data, error } = await supabase.rpc('book_appointment_slot', {
        p_doctor_id: payload.doctorId,
        p_slot_id: payload.slotId,
        p_patient_name: payload.patientName,
        p_patient_phone: payload.patientPhone,
        p_reason_for_visit: payload.reasonForVisit || null,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return data as BookAppointmentResponse;
    }
    return demoStore.bookAppointment(payload, patientId);
  },

  async getAppointments(patientId?: string): Promise<Appointment[]> {
    if (supabase) {
      let query = supabase
        .from('appointments')
        .select('*, doctor:doctors(*), slot:availability_slots(*)')
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[Supabase] Error fetching appointments, using demo data:', error.message);
        return demoStore.getAppointments(patientId);
      }
      return data as Appointment[];
    }
    return demoStore.getAppointments(patientId);
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctor:doctors(*), slot:availability_slots(*)')
        .or(`id.eq.${id},booking_reference.eq.${id}`)
        .maybeSingle();

      if (error || !data) {
        return demoStore.getAppointmentById(id) || null;
      }
      return data as Appointment;
    }
    return demoStore.getAppointmentById(id) || null;
  },

  async cancelAppointment(appointmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (supabase) {
        const { error } = await supabase.rpc('cancel_appointment', {
          p_appointment_id: appointmentId,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
      demoStore.cancelAppointment(appointmentId);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel appointment';
      return { success: false, error: msg };
    }
  },

  async adminRescheduleAppointment(appointmentId: string, newSlotId: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.rpc('admin_reschedule_appointment', {
        p_appointment_id: appointmentId,
        p_new_slot_id: newSlotId,
      });
      if (error) throw new Error(error.message);
      return;
    }
    demoStore.rescheduleAppointment(appointmentId, newSlotId);
  },

  async adminUpdateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    adminNotes?: string
  ): Promise<void> {
    if (supabase) {
      const { error } = await supabase.rpc('admin_update_appointment_status', {
        p_appointment_id: appointmentId,
        p_new_status: status,
        p_admin_notes: adminNotes || null,
      });
      if (error) throw new Error(error.message);
      return;
    }
    demoStore.updateAppointmentStatus(appointmentId, status, adminNotes);
  },

  async adminSaveDoctor(doctor: Partial<Doctor>): Promise<Doctor> {
    if (supabase) {
      if (doctor.id) {
        const { data, error } = await supabase
          .from('doctors')
          .update({
            name: doctor.name,
            specialization: doctor.specialization,
            qualification: doctor.qualification,
            experience_years: doctor.experience_years,
            bio: doctor.bio,
            clinic_address: doctor.clinic_address,
            consultation_fee: doctor.consultation_fee,
            avatar_url: doctor.avatar_url,
            is_active: doctor.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', doctor.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data as Doctor;
      } else {
        const { data, error } = await supabase
          .from('doctors')
          .insert({
            name: doctor.name,
            specialization: doctor.specialization,
            qualification: doctor.qualification,
            experience_years: doctor.experience_years || 5,
            bio: doctor.bio || '',
            clinic_address: doctor.clinic_address || '',
            consultation_fee: doctor.consultation_fee || 50,
            avatar_url: doctor.avatar_url,
            is_active: doctor.is_active ?? true,
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data as Doctor;
      }
    }
    return demoStore.saveDoctor(doctor);
  },

  async adminDeleteDoctor(doctorId: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('doctors').delete().eq('id', doctorId);
      if (error) throw new Error(error.message);
      return;
    }
    demoStore.deleteDoctor(doctorId);
  },

  async adminGenerateSlots(
    doctorId: string,
    slotDate: string,
    startTime: string,
    endTime: string,
    intervalMinutes: number
  ): Promise<AvailabilitySlot[]> {
    if (supabase) {
      // In Supabase mode, calculate time slots and bulk insert
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let cur = startH * 60 + startM;
      const end = endH * 60 + endM;

      const rows: Array<{
        doctor_id: string;
        slot_date: string;
        start_time: string;
        end_time: string;
        is_available: boolean;
      }> = [];

      while (cur + intervalMinutes <= end) {
        const sh = String(Math.floor(cur / 60)).padStart(2, '0');
        const sm = String(cur % 60).padStart(2, '0');
        const next = cur + intervalMinutes;
        const eh = String(Math.floor(next / 60)).padStart(2, '0');
        const em = String(next % 60).padStart(2, '0');

        rows.push({
          doctor_id: doctorId,
          slot_date: slotDate,
          start_time: `${sh}:${sm}:00`,
          end_time: `${eh}:${em}:00`,
          is_available: true,
        });

        cur += intervalMinutes;
      }

      if (rows.length === 0) {
        throw new Error('No valid slots could be generated with given time range and interval.');
      }

      const { data, error } = await supabase
        .from('availability_slots')
        .upsert(rows, { onConflict: 'doctor_id,slot_date,start_time' })
        .select();

      if (error) throw new Error(error.message);
      return data as AvailabilitySlot[];
    }
    return demoStore.generateSlots(doctorId, slotDate, startTime, endTime, intervalMinutes);
  },

  async adminToggleSlot(slotId: string, isAvailable: boolean): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from('availability_slots')
        .update({ is_available: isAvailable })
        .eq('id', slotId);
      if (error) throw new Error(error.message);
      return;
    }
    demoStore.toggleSlotAvailability(slotId, isAvailable);
  },

  async adminDeleteSlot(slotId: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('availability_slots').delete().eq('id', slotId);
      if (error) throw new Error(error.message);
      return;
    }
    demoStore.deleteSlot(slotId);
  },

  async adminGetPatients(): Promise<
    Array<{
      id: string;
      full_name: string;
      phone: string | null;
      email?: string;
      appointment_count: number;
      created_at: string;
    }>
  > {
    if (supabase) {
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient');

      if (pError) {
        console.warn('[Supabase] Could not fetch patient profiles:', pError.message);
      }

      const { data: appts } = await supabase.from('appointments').select('patient_id');

      const counts: Record<string, number> = {};
      (appts || []).forEach((a: { patient_id: string }) => {
        counts[a.patient_id] = (counts[a.patient_id] || 0) + 1;
      });

      return (profiles || []).map((p: Profile) => ({
        id: p.id,
        full_name: p.full_name,
        phone: p.phone,
        email: `${p.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        appointment_count: counts[p.id] || 0,
        created_at: p.created_at,
      }));
    }

    const profiles = demoStore.getProfiles().filter((p) => p.role === 'patient');
    const appts = demoStore.getAppointments();
    return profiles.map((p) => ({
      id: p.id,
      full_name: p.full_name,
      phone: p.phone,
      email: `${p.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      appointment_count: appts.filter((a) => a.patient_id === p.id).length,
      created_at: p.created_at,
    }));
  },

  async getAllAppointments(): Promise<Appointment[]> {
    return this.getAppointments();
  },

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    return this.getAppointments(patientId);
  },

  async getDoctorSlotsForDate(doctorId: string, date: string): Promise<AvailabilitySlot[]> {
    const all = await this.getAllDoctorSlots(doctorId);
    return all
      .filter((s) => s.slot_date === date)
      .map((s) => ({ ...s, is_booked: !s.is_available }));
  },

  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor> {
    return this.adminSaveDoctor({ ...updates, id });
  },

  async createDoctor(doctor: Partial<Doctor>): Promise<Doctor> {
    return this.adminSaveDoctor(doctor);
  },

  async deleteDoctor(doctorId: string): Promise<void> {
    return this.adminDeleteDoctor(doctorId);
  },

  async createSlot(slot: {
    doctor_id: string;
    slot_date: string;
    start_time: string;
    end_time: string;
    is_booked?: boolean;
  }): Promise<AvailabilitySlot> {
    if (supabase) {
      const { data, error } = await supabase
        .from('availability_slots')
        .insert({
          doctor_id: slot.doctor_id,
          slot_date: slot.slot_date,
          start_time: slot.start_time.length === 5 ? `${slot.start_time}:00` : slot.start_time,
          end_time: slot.end_time.length === 5 ? `${slot.end_time}:00` : slot.end_time,
          is_available: slot.is_booked !== undefined ? !slot.is_booked : true,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { ...data, is_booked: !data.is_available } as AvailabilitySlot;
    }
    const s = demoStore.addSlot({
      doctor_id: slot.doctor_id,
      slot_date: slot.slot_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_booked !== undefined ? !slot.is_booked : true,
    });
    return { ...s, is_booked: !s.is_available };
  },

  async generateRecurringSlots(
    doctorId: string,
    slotDate: string,
    startTime: string,
    endTime: string,
    intervalMinutes: number
  ): Promise<number> {
    const res = await this.adminGenerateSlots(doctorId, slotDate, startTime, endTime, intervalMinutes);
    return res.length;
  },

  async deleteSlot(slotId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.adminDeleteSlot(slotId);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      return { success: false, error: msg };
    }
  },

  async rescheduleAppointment(
    appointmentId: string,
    newSlotId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.adminRescheduleAppointment(appointmentId, newSlotId);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rescheduling failed';
      return { success: false, error: msg };
    }
  },

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.adminUpdateAppointmentStatus(appointmentId, status, adminNotes);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      return { success: false, error: msg };
    }
  },

  async getPatients(): Promise<Profile[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .order('created_at', { ascending: false });
      if (error) {
        return demoStore.getProfiles().filter((p) => p.role === 'patient');
      }
      return data as Profile[];
    }
    return demoStore.getProfiles().filter((p) => p.role === 'patient');
  },

  async getAdminMetrics(): Promise<{
    totalDoctors: number;
    totalAppointments: number;
    todayAppointments: number;
    totalPatients: number;
    pendingCount: number;
    confirmedCount: number;
    completedCount: number;
    cancelledCount: number;
  }> {
    const [doctors, appointments, patients] = await Promise.all([
      this.getDoctors(true),
      this.getAllAppointments(),
      this.getPatients(),
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(
      (a) => a.slot?.slot_date === todayStr
    ).length;

    return {
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      todayAppointments,
      totalPatients: patients.length,
      pendingCount: appointments.filter((a) => a.status === 'pending').length,
      confirmedCount: appointments.filter((a) => a.status === 'confirmed').length,
      completedCount: appointments.filter((a) => a.status === 'completed').length,
      cancelledCount: appointments.filter((a) => a.status === 'cancelled').length,
    };
  },
};
