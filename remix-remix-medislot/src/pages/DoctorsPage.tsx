import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Stethoscope, AlertCircle } from 'lucide-react';
import { dataService } from '../lib/supabase';
import { Doctor } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { DoctorCard } from '../components/DoctorCard';
import { DoctorCardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const DoctorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search query & specialization from URL or state
  const queryParam = searchParams.get('q') || '';
  const specParam = searchParams.get('specialization') || 'All Specializations';

  const [search, setSearch] = useState(queryParam);
  const [selectedSpec, setSelectedSpec] = useState(specParam);

  // Keep state synced with URL search params
  useEffect(() => {
    setSearch(queryParam);
    setSelectedSpec(specParam);
  }, [queryParam, specParam]);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dataService.getDoctors();
        setDoctors(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load doctors directory';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const updateFilters = (newSearch: string, newSpec: string) => {
    const params = new URLSearchParams();
    if (newSearch.trim()) params.set('q', newSearch.trim());
    if (newSpec !== 'All Specializations') params.set('specialization', newSpec);
    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    updateFilters(val, selectedSpec);
  };

  const handleSpecChange = (spec: string) => {
    setSelectedSpec(spec);
    updateFilters(search, spec);
  };

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        search === '' ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(search.toLowerCase()) ||
        doc.qualification.toLowerCase().includes(search.toLowerCase()) ||
        doc.bio.toLowerCase().includes(search.toLowerCase());

      const matchesSpec =
        selectedSpec === 'All Specializations' || doc.specialization === selectedSpec;

      return matchesSearch && matchesSpec;
    });
  }, [doctors, search, selectedSpec]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
          <Stethoscope className="w-4 h-4" />
          <span>Medical Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Your Healthcare Specialist
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Browse verified physicians, check consultation charges, and pick an appointment slot tailored to your schedule.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or condition..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Select Dropdown */}
          <div className="sm:w-64">
            <select
              value={selectedSpec}
              onChange={(e) => handleSpecChange(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {APP_CONFIG.specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specialization Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-medium shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>
          {APP_CONFIG.specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => handleSpecChange(spec)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedSpec === spec
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">Unable to load doctors</h4>
            <p className="text-xs mt-0.5 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredDoctors.length === 0 && (
        <EmptyState
          icon={Stethoscope}
          title="No doctors match your search"
          description={`We couldn't find any healthcare specialists matching "${search || selectedSpec}". Try adjusting your search query or selecting a different specialty.`}
          action={{
            label: 'Clear All Filters',
            onClick: () => {
              setSearch('');
              setSelectedSpec('All Specializations');
              setSearchParams({});
            },
          }}
        />
      )}

      {/* Doctors Grid */}
      {!isLoading && !error && filteredDoctors.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500">
            Showing {filteredDoctors.length} available specialist
            {filteredDoctors.length === 1 ? '' : 's'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
