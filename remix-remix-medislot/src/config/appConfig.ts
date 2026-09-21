/**
 * MediSlot Central Application Configuration
 * All branding, contact info, and system defaults are centralized here.
 */

export const APP_CONFIG = {
  name: 'MediSlot',
  tagline: 'Expert Gastroenterology & Liver Care Appointment Scheduling',
  description:
    'MediSlot is a fast, modern doctor appointment booking platform. Schedule consultations with verified specialists like Dr. Vineet Kumar Gupta with instant slot confirmation.',
  supportEmail: 'support@medislot.health',
  emergencyPhone: '+91 92171 79554',
  address: 'Shop No. 38-39, LGF, KB Complex, Alpha-2, Greater Noida - 201310',
  version: '1.0.0',
  currency: '₹',
  currencyCode: 'INR',
  slotIntervalOptions: [15, 20, 30, 45, 60] as const,
  specializations: [
    'All Specializations',
    'Gastroenterologist',
    'Gastroenterology',
    'General Physician',
    'Dermatologist',
    'Pediatrician',
    'Dentist',
  ] as const,
};

export type Specialization = (typeof APP_CONFIG.specializations)[number];
