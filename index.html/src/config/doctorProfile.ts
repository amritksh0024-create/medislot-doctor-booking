/**
 * Centralized Verified Doctor Profile & Clinic Configuration
 * 
 * Strict Single Source of Truth for Dr. Vineet Kumar Gupta.
 * All pages (Homepage, Doctor Card, Doctor Details Page, Booking Page, Admin Portal)
 * reference this data to ensure 100% consistency without duplication.
 */

export interface ExperiencePosition {
  institution: string;
  role?: string;
}

export interface ClinicTiming {
  days: string;
  time: string;
}

export interface DoctorProfileData {
  id: string;
  name: string;
  designation: string;
  title: string;
  specialty: string;
  department: string;
  qualifications: string[];
  qualificationDisplay: string;
  registrationNumber: string;
  experience: string;
  experienceYears: number;
  languages: string[];
  languagesDisplay: string;
  languagesStatsDisplay: string;
  currentPosition: string;
  currentPositionRole: string;
  currentPositionHospital: string;
  currentPositionStatement: string;
  about: string;
  expertise: string[];
  experienceHistory: ExperiencePosition[];
  memberships: string[];
  clinic: {
    name: string;
    branding: string;
    address: string;
    timings: ClinicTiming[];
    phone: string;
  };
  quickStats: {
    value: string;
    label: string;
  }[];
  image: string;
  consultationFee: number;
}

export const DOCTOR_PROFILE: DoctorProfileData = {
  id: 'doc-dr-vineet-gupta',
  name: 'Dr. Vineet Kumar Gupta',
  designation: 'Senior Director & Unit Head',
  title: 'Senior Director & Unit Head',
  specialty: 'Gastroenterologist',
  department: 'Gastroenterology',
  qualifications: [
    'MBBS',
    'MD (Medicine)',
    'DNB (Gastroenterology)',
    'MNAMS',
  ],
  qualificationDisplay: 'MBBS, MD (Medicine), DNB (Gastroenterology), MNAMS',
  registrationNumber: 'DMC-28684',
  experience: '19+ Years',
  experienceYears: 19,
  languages: ['English', 'Hindi'],
  languagesDisplay: 'English, Hindi',
  languagesStatsDisplay: 'English & Hindi',
  currentPosition:
    'Senior Director & Unit Head, Department of Gastroenterology, ShardaCare – Healthcity',
  currentPositionRole: 'Senior Director & Unit Head, Department of Gastroenterology',
  currentPositionHospital: 'ShardaCare – Healthcity',
  currentPositionStatement:
    'Currently, Dr. Vineet Kumar Gupta serves as Senior Director & Unit Head, Department of Gastroenterology at ShardaCare – Healthcity.',
  about:
    'Dr. Vineet Kumar Gupta is a highly experienced and dedicated gastroenterologist with over 19 years of clinical expertise. He is widely recognized for his meticulous attention to detail, precise diagnostic skills, and compassionate approach to patient care. Dr. Gupta has successfully managed numerous complex and challenging medical cases and is proficient in advanced procedures, including single balloon enteroscopy, ERCP, endoscopic ultrasonography, and diagnostic and therapeutic endoscopy and colonoscopy. He has worked with several reputed hospitals and collaborated with leading healthcare institutions. Currently, he serves as Senior Director & Unit Head, Department of Gastroenterology at ShardaCare – Healthcity.',
  expertise: [
    'Diagnostic and therapeutic endoscopy/colonoscopy',
    'Single balloon Enteroscopy',
    'ERCP (Endoscopic Retrograde Cholangiopancreatography)',
    'Endoscopic Ultrasound (diagnostic and therapeutic)',
    'Bowel Obstruction Treatment',
    'IBD (Crohn\'s disease and ulcerative colitis)',
    'Anti-Reflux Procedures',
    'Gastric balloon procedure for obesity',
    'Liver Failure',
    'IBS',
    'Liver Transplant',
  ],
  experienceHistory: [
    {
      institution: 'Yatharth Superspeciality Hospital, Greater Noida',
      role: 'Director & Head of the Department, Gastroenterology',
    },
    {
      institution: 'Fortis Flt. Lt. Rajan Dhall Hospital, Vasant Kunj, New Delhi',
    },
    {
      institution: 'Jaypee Hospital, Noida',
    },
    {
      institution: 'Asian Hospital, Faridabad, Haryana',
    },
    {
      institution: 'Sarvodaya Hospital, Faridabad, Haryana',
    },
    {
      institution:
        'Pushpawati Singhania Research Institute for Gastroenterology and Renal Diseases, New Delhi',
    },
    {
      institution: 'Batra Heart & Medical Research Centre, New Delhi',
    },
  ],
  memberships: [
    'Indian Society of Gastroenterology',
    'American College of Gastroenterology (ACG)',
    'Society of Gastrointestinal Endoscopy of India',
  ],
  clinic: {
    name: 'Vedik Gastro Care & Liver Clinic',
    branding: 'BEST Gastro & Liver Clinic',
    address: 'Shop No. 38-39, LGF, KB Complex, Alpha-2, Greater Noida - 201310',
    timings: [
      {
        days: 'Monday to Saturday',
        time: '5 PM to 7 PM',
      },
      {
        days: 'Sunday',
        time: '11 AM to 1 PM',
      },
    ],
    phone: '+91 92171 79554',
  },
  quickStats: [
    { value: '19+ Years', label: 'Clinical Experience' },
    { value: 'Senior Director', label: 'Unit Head - Gastro' },
    { value: 'ShardaCare', label: 'Healthcity Hospital' },
    { value: 'DMC-28684', label: 'Verified Registration' },
  ],
  image: '/assets/dr-vineet-kumar-gupta.png',
  consultationFee: 1000,
};

/**
 * Returns a standard Doctor interface compatible object for Dr. Vineet Kumar Gupta
 */
export function getFeaturedDoctorEntity() {
  return {
    id: DOCTOR_PROFILE.id,
    name: DOCTOR_PROFILE.name,
    specialization: DOCTOR_PROFILE.specialty,
    qualification: DOCTOR_PROFILE.qualificationDisplay,
    experience_years: DOCTOR_PROFILE.experienceYears,
    bio: DOCTOR_PROFILE.about,
    clinic_address: `${DOCTOR_PROFILE.clinic.name} (${DOCTOR_PROFILE.clinic.branding}), ${DOCTOR_PROFILE.clinic.address}`,
    consultation_fee: DOCTOR_PROFILE.consultationFee,
    avatar_url: DOCTOR_PROFILE.image,
    rating: 5.0,
    review_count: 0,
    is_active: true,
    registration_no: DOCTOR_PROFILE.registrationNumber,
    designation: DOCTOR_PROFILE.designation,
    languages: DOCTOR_PROFILE.languages,
    current_position: DOCTOR_PROFILE.currentPosition,
    created_at: new Date('2024-01-01T00:00:00.000Z').toISOString(),
    updated_at: new Date().toISOString(),
  };
}
