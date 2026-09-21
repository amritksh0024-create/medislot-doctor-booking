import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit2,
  Check,
  X,
  Stethoscope,
  Power,
  PowerOff,
  Star,
  Clock,
  MapPin,
  Image,
} from 'lucide-react';
import { dataService } from '../../lib/supabase';
import { Doctor } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import { DOCTOR_PROFILE } from '../../config/doctorProfile';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/Modal';
import { PageSpinner } from '../../components/LoadingSkeleton';

// Preset Clean Medical Avatars
const PRESET_AVATARS = [
  {
    label: 'Dr. Vineet Kumar Gupta (Featured Specialist)',
    url: DOCTOR_PROFILE.image,
  },
  {
    label: 'Dr. Katherine (Female, Physician)',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Dr. Marcus (Male, Dermatologist)',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Dr. Elena (Female, Pediatrician)',
    url: 'https://images.unsplash.com/photo-1594824813576-90f701c9a408?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Dr. David (Male, Dentist)',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
  },
];

const doctorSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  experience_years: z.number().min(0, 'Must be 0 or more years'),
  consultation_fee: z.number().min(1, 'Fee must be greater than 0'),
  bio: z.string().min(10, 'Please write a brief bio'),
  clinic_address: z.string().min(5, 'Clinic address is required'),
  avatar_url: z.string().optional(),
  is_active: z.boolean(),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export const AdminDoctorsPage: React.FC = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialization: 'General Physician',
      qualification: 'MBBS, MD',
      experience_years: 5,
      consultation_fee: 75,
      bio: '',
      clinic_address: APP_CONFIG.address,
      avatar_url: PRESET_AVATARS[0].url,
      is_active: true,
    },
  });

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const data = await dataService.getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    reset({
      name: '',
      specialization: 'General Physician',
      qualification: 'MBBS, MD',
      experience_years: 5,
      consultation_fee: 75,
      bio: '',
      clinic_address: APP_CONFIG.address,
      avatar_url: PRESET_AVATARS[0].url,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    reset({
      name: doc.name,
      specialization: doc.specialization,
      qualification: doc.qualification,
      experience_years: doc.experience_years,
      consultation_fee: doc.consultation_fee,
      bio: doc.bio,
      clinic_address: doc.clinic_address,
      avatar_url: doc.avatar_url || '',
      is_active: doc.is_active,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (doc: Doctor) => {
    try {
      await dataService.updateDoctor(doc.id, {
        is_active: !doc.is_active,
      });
      showToast(
        'success',
        'Status Changed',
        `${doc.name} is now ${!doc.is_active ? 'Active' : 'Inactive'}`
      );
      loadDoctors();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      showToast('error', 'Error', msg);
    }
  };

  const onSubmit = async (values: DoctorFormValues) => {
    try {
      setIsSaving(true);
      if (editingDoctor) {
        await dataService.updateDoctor(editingDoctor.id, {
          name: values.name,
          specialization: values.specialization,
          qualification: values.qualification,
          experience_years: values.experience_years,
          consultation_fee: values.consultation_fee,
          bio: values.bio,
          clinic_address: values.clinic_address,
          avatar_url: values.avatar_url || PRESET_AVATARS[0].url,
          is_active: values.is_active,
        });
        showToast('success', 'Doctor Updated', `${values.name} details saved.`);
      } else {
        await dataService.createDoctor({
          name: values.name,
          specialization: values.specialization,
          qualification: values.qualification,
          experience_years: values.experience_years,
          consultation_fee: values.consultation_fee,
          bio: values.bio,
          clinic_address: values.clinic_address,
          avatar_url: values.avatar_url || PRESET_AVATARS[0].url,
          is_active: values.is_active,
        });
        showToast('success', 'Doctor Added', `${values.name} added to the clinic directory.`);
      }
      setIsModalOpen(false);
      loadDoctors();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      showToast('error', 'Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageSpinner text="Loading clinic doctor roster..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinic Specialists &amp; Doctors</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new practitioners, update consultation fees, and toggle appointment availability
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
              doc.is_active ? 'border-slate-200 shadow-2xs' : 'border-slate-200/60 bg-slate-50/50 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={doc.avatar_url || PRESET_AVATARS[0].url}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate">
                      {doc.specialization}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {doc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1 truncate">{doc.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{doc.qualification}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Experience:</span>
                  <span className="font-medium">{doc.experience_years} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Consultation Fee:</span>
                  <span className="font-bold text-slate-900">
                    {APP_CONFIG.currency}
                    {doc.consultation_fee}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 shrink-0">Clinic:</span>
                  <span className="text-right truncate">{doc.clinic_address}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleToggleStatus(doc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  doc.is_active
                    ? 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                {doc.is_active ? (
                  <>
                    <PowerOff className="w-3.5 h-3.5" /> Deactivate
                  </>
                ) : (
                  <>
                    <Power className="w-3.5 h-3.5" /> Activate
                  </>
                )}
              </button>

              <button
                onClick={() => handleOpenEdit(doc)}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? `Edit ${editingDoctor.name}` : 'Add New Doctor to Clinic'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Dr. John Smith, MD"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialization <span className="text-red-500">*</span>
              </label>
              <select
                {...register('specialization')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                {APP_CONFIG.specializations
                  .filter((s) => s !== 'All Specializations')
                  .map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qualifications <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('qualification')}
                placeholder="MBBS, MD (Internal Med)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              {errors.qualification && (
                <p className="text-xs text-red-600 mt-1">{errors.qualification.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                {...register('experience_years', { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Fee ({APP_CONFIG.currency})
              </label>
              <input
                type="number"
                {...register('consultation_fee', { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinic Address / Room Number
            </label>
            <input
              type="text"
              {...register('clinic_address')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Doctor Bio / Summary
            </label>
            <textarea
              rows={2}
              {...register('bio')}
              placeholder="Board certified physician with expertise in..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            {errors.bio && <p className="text-xs text-red-600 mt-1">{errors.bio.message}</p>}
          </div>

          {/* Preset Avatar Selector (Required by Spec) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Doctor Profile Photo (Select preset or enter custom URL)
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((avatar, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setValue('avatar_url', avatar.url)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                    watch('avatar_url') === avatar.url
                      ? 'border-blue-600 scale-105 shadow-2xs'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                  title={avatar.label}
                >
                  <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              {...register('avatar_url')}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="rounded-sm text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <label htmlFor="is_active" className="text-xs font-medium text-slate-700 cursor-pointer">
              Active doctor (accepting patient appointments)
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              {isSaving ? 'Saving...' : editingDoctor ? 'Save Changes' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
