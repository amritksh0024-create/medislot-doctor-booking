-- ==============================================================================
-- MediSlot - Demo Doctors & Availability Slots Seed Data
-- ==============================================================================

-- Clear existing sample data if re-seeding
TRUNCATE TABLE public.appointments CASCADE;
TRUNCATE TABLE public.availability_slots CASCADE;
DELETE FROM public.doctors;

-- 1. Insert Verified & Demo Doctors
INSERT INTO public.doctors (
    id,
    name,
    specialization,
    qualification,
    experience_years,
    bio,
    clinic_address,
    consultation_fee,
    avatar_url,
    rating,
    review_count,
    is_active
) VALUES
(
    'doc-dr-vineet-gupta',
    'Dr. Vineet Kumar Gupta',
    'Gastroenterologist',
    'MBBS, MD (Medicine), DNB (Gastroenterology), MNAMS',
    19,
    'Dr. Vineet Kumar Gupta is a highly experienced and dedicated gastroenterologist with over 19 years of clinical expertise. He is widely recognized for his meticulous attention to detail, precise diagnostic skills, and compassionate approach to patient care. Dr. Gupta has successfully managed numerous complex and challenging medical cases and is proficient in advanced procedures, including single balloon enteroscopy, ERCP, endoscopic ultrasonography, and diagnostic and therapeutic endoscopy and colonoscopy. He has worked with several reputed hospitals and collaborated with leading healthcare institutions. Currently, he serves as Director and Head of the Department of Gastroenterology at ShardaCare – Healthcity.',
    'Shop No. 38-39, LGF, KB Complex, Alpha-2, Greater Noida - 201310',
    1000.00,
    '/assets/dr-vineet-kumar-gupta.png',
    5.0,
    0,
    TRUE
),
(
    'a1111111-1111-4111-a111-111111111111',
    'Dr. Sarah Mitchell, MD',
    'General Physician',
    'MD - Internal Medicine, MBBS (Johns Hopkins University)',
    14,
    'Dr. Sarah Mitchell is a board-certified internal medicine physician with over 14 years of clinical experience. She specializes in preventive wellness, chronic condition management (hypertension, diabetes), and acute adult healthcare.',
    'Suite 402, Metro Health Pavilion, 120 Medical Center Blvd, Downtown',
    75.00,
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    4.9,
    128,
    TRUE
),
(
    'a2222222-2222-4222-a222-222222222222',
    'Dr. Marcus Vance, MD, FAAD',
    'Dermatologist',
    'MD - Dermatology, Fellowship in Cutaneous Oncology (Stanford Medicine)',
    11,
    'Dr. Marcus Vance provides comprehensive medical and cosmetic dermatology care. His expertise covers eczema, persistent acne treatments, mole screenings, skin cancer prevention, and personalized dermatological therapies.',
    'Floor 2, Apex Skin & Laser Institute, 840 Horizon Way, Suite 210',
    110.00,
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    4.8,
    94,
    TRUE
),
(
    'a3333333-3333-4333-a333-333333333333',
    'Dr. Elena Rostova, MD, FAAP',
    'Pediatrician',
    'MD - Pediatrics (Columbia University College of Physicians & Surgeons)',
    9,
    'Dr. Elena Rostova is deeply passionate about compassionate child healthcare from infancy through adolescence. She offers developmental assessments, childhood immunizations, nutritional counseling, and prompt care for pediatric illnesses.',
    'Sunrise Pediatric Clinic, 512 Blossom Park Lane, Family Medical Plaza',
    85.00,
    'https://images.unsplash.com/photo-1594824813629-87a29e4695eb?auto=format&fit=crop&q=80&w=600',
    5.0,
    142,
    TRUE
),
(
    'a4444444-4444-4444-a444-444444444444',
    'Dr. David Chen, DDS',
    'Dentist',
    'DDS - Doctor of Dental Surgery (UCLA School of Dentistry)',
    12,
    'Dr. David Chen offers gentle, patient-focused dental care including preventative cleanings, restorative treatments, teeth whitening, crowns, and oral health consultations with advanced painless dental techniques.',
    'PureSmile Dental Studio, 305 Pine Crest Avenue, Medical Arts Building',
    95.00,
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    4.9,
    115,
    TRUE
);

-- 2. Dynamically Generate Available Slots for the Next 7 Days (Days 1 through 7 from CURRENT_DATE)
-- Slots: 09:00, 10:00, 11:30, 14:00, 15:30, 16:30
INSERT INTO public.availability_slots (doctor_id, slot_date, start_time, end_time, is_available)
SELECT 
    d.id,
    (CURRENT_DATE + (day_offset || ' day')::INTERVAL)::DATE,
    slot_times.start_t,
    slot_times.end_t,
    TRUE
FROM public.doctors d
CROSS JOIN generate_series(1, 7) AS day_offset
CROSS JOIN (
    VALUES 
        ('09:00:00'::TIME, '09:45:00'::TIME),
        ('10:00:00'::TIME, '10:45:00'::TIME),
        ('11:30:00'::TIME, '12:15:00'::TIME),
        ('14:00:00'::TIME, '14:45:00'::TIME),
        ('15:30:00'::TIME, '16:15:00'::TIME),
        ('16:30:00'::TIME, '17:15:00'::TIME)
) AS slot_times(start_t, end_t)
ON CONFLICT (doctor_id, slot_date, start_time) DO NOTHING;
