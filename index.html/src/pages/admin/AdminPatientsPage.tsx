import React, { useState, useEffect } from 'react';
import { Users, Search, Calendar, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { dataService } from '../../lib/supabase';
import { Profile, Appointment } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { PageSpinner } from '../../components/LoadingSkeleton';

export const AdminPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Patient History Modal
  const [selectedPatient, setSelectedPatient] = useState<Profile | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      try {
        setIsLoading(true);
        const data = await dataService.getPatients();
        setPatients(data);
      } catch (err) {
        console.error('Error fetching patients', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPatients();
  }, []);

  const handleViewHistory = async (patient: Profile) => {
    setSelectedPatient(patient);
    try {
      setIsLoadingHistory(true);
      const appts = await dataService.getPatientAppointments(patient.id);
      setPatientAppointments(appts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return <PageSpinner text="Loading registered patient records..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Registered Patient Directory</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review patient contact information and clinical consultation logs
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs sm:text-sm">
            No registered patients found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Patient Name</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Registered On</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {patient.full_name?.charAt(0) || 'P'}
                      </div>
                      <span>{patient.full_name || 'Patient'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {patient.phone || '--'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {patient.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewHistory(patient)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Bookings</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient History Modal */}
      <Modal
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        title={`Appointment History: ${selectedPatient?.full_name || 'Patient'}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          {isLoadingHistory ? (
            <div className="py-8 text-center text-slate-400">Loading visit logs...</div>
          ) : patientAppointments.length === 0 ? (
            <div className="py-8 text-center text-slate-500 italic">
              No previous appointments found for this patient.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {patientAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {appt.booking_reference}
                      </span>
                      <StatusBadge status={appt.status} size="sm" />
                    </div>
                    <div className="font-semibold text-slate-900 mt-1">
                      {appt.doctor?.name} ({appt.doctor?.specialization})
                    </div>
                    {appt.reason_for_visit && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        Reason: {appt.reason_for_visit}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-slate-600 shrink-0">
                    <div className="font-medium">{appt.slot?.slot_date}</div>
                    <div className="text-slate-400 text-[11px]">
                      {appt.slot?.start_time} - {appt.slot?.end_time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => setSelectedPatient(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
