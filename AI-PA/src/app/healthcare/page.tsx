'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";
import { useState, useEffect } from "react";
import { AddSymptomModal } from "@/components/modals/AddSymptomModal";
import { AddMedicationModal } from "@/components/modals/AddMedicationModal";
import { AddAppointmentModal } from "@/components/modals/AddAppointmentModal";
import { getUserSymptoms, getUserMedications, getUserAppointments } from "@/lib/services/healthRecordService";
import { Symptom, Medication, Appointment } from "@/lib/types/database";
import { FitbitPanel } from "@/components/healthcare/FitbitPanel";
import { supabase } from "@/lib/supabaseClient";

export default function HealthcarePage() {
  const [isAddSymptomOpen, setIsAddSymptomOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [symptomsLoading, setSymptomsLoading] = useState(true);
  const [medicationsLoading, setMedicationsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  // Fitbit summary + Water intake state
  const [fitbitSummary, setFitbitSummary] = useState<any | null>(null);
  const [fitbitLoading, setFitbitLoading] = useState(false);
  const [waterMl, setWaterMl] = useState<number>(0);
  const [waterLoading, setWaterLoading] = useState(false);
  const [waterSaving, setWaterSaving] = useState(false);

  const waterGoalMl = 2000; // default goal in ml


	  const [waterAmountInput, setWaterAmountInput] = useState<string>('');

  const getToday = () => new Date().toISOString().slice(0, 10);

  const loadFitbit = async () => {
    try {
      setFitbitLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await fetch(`/api/fitbit/summary?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
        const json = await res.json();
        setFitbitSummary(json && json.connected ? json : null);
      } else {
        setFitbitSummary(null);
      }
    } catch (e) {
      console.error('Error loading Fitbit summary:', e);
    } finally {
      setFitbitLoading(false);
    }
  };

  const loadWater = async () => {
    try {
      setWaterLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setWaterMl(0);
        return;
      }
      const { data, error } = await supabase
        .from('user_water_intake')
        .select('amount_ml, date')
        .eq('user_id', userId)
        .eq('date', getToday());
      if (error) {
        console.warn('Skipping water load (table may not exist yet):', error.message);
        setWaterMl(0);
      } else {
        const total = (data || []).reduce((sum: number, r: any) => sum + (r.amount_ml || 0), 0);
        setWaterMl(total);
      }
    } catch (e) {
      console.warn('Error loading water intake:', e);
      setWaterMl(0);
    } finally {
      setWaterLoading(false);
    }
  };

  const addWater = async (amount: number) => {
    try {
      setWaterSaving(true);
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const { error } = await supabase.from('user_water_intake').insert({
        user_id: userId,
        amount_ml: amount,
        date: getToday(),
      });
      if (error) {
        console.error('Failed to add water:', error.message);
        return;
      }
      setWaterMl((w) => w + amount);
    } catch (e) {
      console.error('Add water error:', e);
    } finally {
      setWaterSaving(false);
    }
  };

  // Load symptoms
  const loadSymptoms = async () => {
    try {
      setSymptomsLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        const fetchedSymptoms = await getUserSymptoms(userId);
        setSymptoms(fetchedSymptoms);
      }
    } catch (error) {
      console.error('Error loading symptoms:', error);
    } finally {
      setSymptomsLoading(false);
    }
  };

  // Load medications
  const loadMedications = async () => {
    try {
      setMedicationsLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        const fetchedMedications = await getUserMedications(userId);
        setMedications(fetchedMedications);
      }
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setMedicationsLoading(false);
    }
  };

  // Load appointments
  const loadAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        const fetchedAppointments = await getUserAppointments(userId);
        setAppointments(fetchedAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Load all data on mount
  useEffect(() => {
    loadSymptoms();
    loadMedications();
    loadAppointments();
    loadFitbit();
    loadWater();
  }, []);

  // Handle callbacks
  const handleSymptomAdded = () => loadSymptoms();
  const handleMedicationAdded = () => loadMedications();
  const handleAppointmentAdded = () => loadAppointments();

  // Helper function to get severity color
  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
        return 'bg-yellow-400';
      case 'moderate':
        return 'bg-orange-500';
      case 'severe':
        return 'bg-red-600';
      default:
        return 'bg-gray-400';
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 border-b border-border-light/50 dark:border-border-dark/50">
          <Button asChild variant="ghost" size="icon" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10">
            <Link href="/dashboard">
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                arrow_back_ios_new
              </span>
            </Link>
          </Button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold">Healthcare</h1>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              Your wellness hub
            </p>
          </div>
          <Button variant="ghost" size="icon" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10 relative">
            <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
              more_vert
            </span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="p-6">
            <div className="mb-6">
              <FitbitPanel />
            </div>

            {/* Water Intake (standalone) */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Water Intake</h2>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-subtle-light dark:text-subtle-dark">
                  Today: <span className="font-semibold text-foreground">{waterLoading ? '—' : `${waterMl} / ${waterGoalMl} ml`}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="Amount (ml)"
                    value={waterAmountInput}
                    onChange={(e) => setWaterAmountInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border border-border-light/50 dark:border-border-dark/50 bg-background text-foreground"
                  />
                  <Button
                    onClick={() => {
                      const amt = parseInt(waterAmountInput || '0', 10);
                      if (!Number.isFinite(amt) || amt <= 0) return;
                      addWater(amt);
                      setWaterAmountInput('');
                    }}
                    className="font-semibold"
                    title="Add custom amount"
                    disabled={waterSaving || waterLoading || !(Number.isFinite(parseInt(waterAmountInput || '0', 10)) && parseInt(waterAmountInput || '0', 10) > 0)}
                  >
                    <span className="material-symbols-outlined text-base mr-1">water_drop</span>
                    Add Water
                  </Button>
                  <Button
                    onClick={() => addWater(250)}
                    className="font-semibold"
                    title="Add 250ml"
                    disabled={waterSaving || waterLoading}
                  >
                    <span className="material-symbols-outlined text-base mr-1">water_drop</span>
                    250ml
                  </Button>
                  <Button
                    onClick={() => addWater(500)}
                    className="font-semibold"
                    title="Add 500ml"
                    disabled={waterSaving || waterLoading}
                  >
                    <span className="material-symbols-outlined text-base mr-1">water_drop</span>
                    500ml
                  </Button>
                </div>
              </div>
            </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Symptom Tracker</h2>
              <Button
                onClick={() => setIsAddSymptomOpen(true)}
                variant="ghost"
                className="text-primary font-semibold text-sm flex items-center gap-1 p-0 h-auto"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Log Symptom</span>
              </Button>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              {symptomsLoading ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  Loading symptoms...
                </div>
              ) : symptoms.length === 0 ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  No symptoms logged yet. Click "Log Symptom" to add one.
                </div>
              ) : (
                symptoms.map((symptom, index) => (
                  <div key={symptom.symptom_id}>
                    {index > 0 && <div className="border-t border-border-light/50 dark:border-border-dark/50 my-4"></div>}
                    <div className={index > 0 ? 'mt-4' : ''}>
                      <p className="font-semibold mb-2">{symptom.symptom_name}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${getSeverityColor(symptom.severity)}`}
                            style={{ width: "70%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">
                          {symptom.severity || 'Unknown'}
                        </span>
                      </div>
                      {symptom.description && (
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                          {symptom.description}
                        </p>
                      )}
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                        Logged: {new Date(symptom.logged_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Medication Reminders</h2>
              <Button
                onClick={() => setIsAddMedicationOpen(true)}
                variant="ghost"
                className="text-primary font-semibold text-sm flex items-center gap-1 p-0 h-auto"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Add New</span>
              </Button>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 space-y-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              {medicationsLoading ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  Loading medications...
                </div>
              ) : medications.length === 0 ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  No medications added yet. Click "Add New" to add one.
                </div>
              ) : (
                medications.map((medication, index) => (
                  <div key={medication.medication_id}>
                    {index > 0 && <div className="border-t border-border-light/50 dark:border-border-dark/50"></div>}
                    <div className={index > 0 ? 'pt-4' : ''}>
                      <div className="flex items-center">
                        <div className="w-12 h-12 flex-shrink-0 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mr-4">
                          <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-2xl">
                            pill
                          </span>
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold">{medication.medication_name}</p>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">
                            {medication.dosage || 'No dosage specified'} - {medication.frequency || 'No frequency'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{medication.time_of_day || 'N/A'}</p>
                          <p className={`text-sm font-medium ${medication.is_active ? 'text-green-500' : 'text-gray-500'}`}>
                            {medication.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Appointments</h2>
              <Button
                onClick={() => setIsAddAppointmentOpen(true)}
                variant="ghost"
                className="text-primary font-semibold text-sm flex items-center gap-1 p-0 h-auto"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Add New</span>
              </Button>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 space-y-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              {appointmentsLoading ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  Loading appointments...
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  No appointments scheduled. Click "Add New" to schedule one.
                </div>
              ) : (
                appointments.map((appointment, index) => (
                  <div key={appointment.appointment_id}>
                    {index > 0 && <div className="border-t border-border-light/50 dark:border-border-dark/50"></div>}
                    <div className={index > 0 ? 'pt-4' : ''}>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-16 p-2 bg-primary/10 rounded-lg">
                          <p className="text-primary font-bold text-lg">{formatDate(appointment.appointment_date).split(' ')[1]}</p>
                          <p className="text-primary text-sm uppercase">{formatDate(appointment.appointment_date).split(' ')[0]}</p>
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold">{appointment.title}</p>
                          {appointment.doctor_name && (
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">
                              {appointment.doctor_name}
                            </p>
                          )}
                          {appointment.clinic_name && (
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">
                              {appointment.clinic_name}
                            </p>
                          )}
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">
                            {formatTime(appointment.appointment_date)}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <VoiceAssistantWrapper />
      <BottomNav />
      </div>

      {/* Modals */}
      <AddSymptomModal
        isOpen={isAddSymptomOpen}
        onClose={() => setIsAddSymptomOpen(false)}
        onSuccess={handleSymptomAdded}
      />
      <AddMedicationModal
        isOpen={isAddMedicationOpen}
        onClose={() => setIsAddMedicationOpen(false)}
        onSuccess={handleMedicationAdded}
      />
      <AddAppointmentModal
        isOpen={isAddAppointmentOpen}
        onClose={() => setIsAddAppointmentOpen(false)}
        onSuccess={handleAppointmentAdded}
      />
      </>
  );
}
