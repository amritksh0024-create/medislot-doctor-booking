import { Doctor, AvailabilitySlot, Appointment, Profile } from '../types';
import { getFeaturedDoctorEntity } from '../config/doctorProfile';

export const INITIAL_DEMO_DOCTORS: Doctor[] = [
  getFeaturedDoctorEntity(),
  {
    id: 'a1111111-1111-4111-a111-111111111111',
    name: 'Dr. Sarah Mitchell, MD',
    specialization: 'General Physician',
    qualification: 'MD - Internal Medicine, MBBS (Johns Hopkins University)',
    experience_years: 14,
    bio: 'Dr. Sarah Mitchell is a board-certified internal medicine physician with over 14 years of clinical experience. She specializes in preventive wellness, chronic condition management (hypertension, diabetes), and acute adult healthcare.',
    clinic_address: 'Suite 402, Metro Health Pavilion, 120 Medical Center Blvd, Downtown',
    consultation_fee: 800,
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    review_count: 128,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a2222222-2222-4222-a222-222222222222',
    name: 'Dr. Marcus Vance, MD, FAAD',
    specialization: 'Dermatologist',
    qualification: 'MD - Dermatology, Fellowship in Cutaneous Oncology (Stanford Medicine)',
    experience_years: 11,
    bio: 'Dr. Marcus Vance provides comprehensive medical and cosmetic dermatology care. His expertise covers eczema, persistent acne treatments, mole screenings, skin cancer prevention, and personalized dermatological therapies.',
    clinic_address: 'Floor 2, Apex Skin & Laser Institute, 840 Horizon Way, Suite 210',
    consultation_fee: 900,
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    review_count: 94,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a3333333-3333-4333-a333-333333333333',
    name: 'Dr. Elena Rostova, MD, FAAP',
    specialization: 'Pediatrician',
    qualification: 'MD - Pediatrics (Columbia University College of Physicians & Surgeons)',
    experience_years: 9,
    bio: 'Dr. Elena Rostova is deeply passionate about compassionate child healthcare from infancy through adolescence. She offers developmental assessments, childhood immunizations, nutritional counseling, and prompt care for pediatric illnesses.',
    clinic_address: 'Sunrise Pediatric Clinic, 512 Blossom Park Lane, Family Medical Plaza',
    consultation_fee: 750,
    avatar_url: 'https://images.unsplash.com/photo-1594824813629-87a29e4695eb?auto=format&fit=crop&q=80&w=600',
    rating: 5.0,
    review_count: 142,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a4444444-4444-4444-a444-444444444444',
    name: 'Dr. David Chen, DDS',
    specialization: 'Dentist',
    qualification: 'DDS - Doctor of Dental Surgery (UCLA School of Dentistry)',
    experience_years: 12,
    bio: 'Dr. David Chen offers gentle, patient-focused dental care including preventative cleanings, restorative treatments, teeth whitening, crowns, and oral health consultations with advanced painless dental techniques.',
    clinic_address: 'PureSmile Dental Studio, 305 Pine Crest Avenue, Medical Arts Building',
    consultation_fee: 850,
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    review_count: 115,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper to generate dynamic future dates YYYY-MM-DD
export function getFutureDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function generateInitialDemoSlots(doctors: Doctor[]): AvailabilitySlot[] {
  const weekdayTimes = [
    { start: '17:00', end: '17:20' },
    { start: '17:20', end: '17:40' },
    { start: '17:40', end: '18:00' },
    { start: '18:00', end: '18:20' },
    { start: '18:20', end: '18:40' },
    { start: '18:40', end: '19:00' },
  ];

  const sundayTimes = [
    { start: '11:00', end: '11:20' },
    { start: '11:20', end: '11:40' },
    { start: '11:40', end: '12:00' },
    { start: '12:00', end: '12:20' },
    { start: '12:20', end: '12:40' },
    { start: '12:40', end: '13:00' },
  ];

  const slots: AvailabilitySlot[] = [];
  doctors.forEach((doc) => {
    for (let day = 1; day <= 10; day++) {
      const d = new Date();
      d.setDate(d.getDate() + day);
      const isSunday = d.getDay() === 0;
      const dateStr = d.toISOString().split('T')[0];
      const timeSlots = isSunday ? sundayTimes : weekdayTimes;

      timeSlots.forEach((t, index) => {
        slots.push({
          id: `slot-${doc.id.substring(0, 8)}-d${day}-t${index}`,
          doctor_id: doc.id,
          slot_date: dateStr,
          start_time: `${t.start}:00`,
          end_time: `${t.end}:00`,
          is_available: true,
          created_at: new Date().toISOString(),
        });
      });
    }
  });

  return slots;
}

export const DEMO_PATIENT_PROFILE: Profile = {
  id: 'patient-demo-user-001',
  full_name: 'Alex Johnson',
  phone: '+1 (555) 234-5678',
  role: 'patient',
  created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_ADMIN_PROFILE: Profile = {
  id: 'admin-demo-user-001',
  full_name: 'Dr. Katherine Bell (Clinic Admin)',
  phone: '+1 (555) 987-6543',
  role: 'admin',
  created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  updated_at: new Date().toISOString(),
};

export function generateInitialDemoAppointments(
  doctors: Doctor[],
  slots: AvailabilitySlot[]
): Appointment[] {
  const doctor1 = doctors[0];
  const doctor2 = doctors[1];
  const slot1 = slots[0];
  const slot2 = slots[6];

  // Mark slots as booked
  if (slot1) slot1.is_available = false;
  if (slot2) slot2.is_available = false;

  return [
    {
      id: 'appt-demo-1',
      booking_reference: 'MED-7A9B12',
      patient_id: DEMO_PATIENT_PROFILE.id,
      doctor_id: doctor1.id,
      slot_id: slot1 ? slot1.id : 'slot-1',
      patient_name: DEMO_PATIENT_PROFILE.full_name,
      patient_phone: DEMO_PATIENT_PROFILE.phone || '+1 (555) 234-5678',
      reason_for_visit: 'Annual routine health checkup and blood panel review',
      status: 'confirmed',
      admin_notes: 'Patient requested morning slot. Fasting required for panel.',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date().toISOString(),
      doctor: doctor1,
      slot: slot1,
    },
    {
      id: 'appt-demo-2',
      booking_reference: 'MED-4K8P99',
      patient_id: DEMO_PATIENT_PROFILE.id,
      doctor_id: doctor2.id,
      slot_id: slot2 ? slot2.id : 'slot-2',
      patient_name: DEMO_PATIENT_PROFILE.full_name,
      patient_phone: DEMO_PATIENT_PROFILE.phone || '+1 (555) 234-5678',
      reason_for_visit: 'Skin irritation and routine mole screening',
      status: 'pending',
      admin_notes: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
      doctor: doctor2,
      slot: slot2,
    },
  ];
}
