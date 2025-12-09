"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { useState, useEffect } from "react";
import { AddSymptomModal } from "@/components/modals/AddSymptomModal";
import { AddMedicationModal } from "@/components/modals/AddMedicationModal";
import { AddAppointmentModal } from "@/components/modals/AddAppointmentModal";
import {
  getUserSymptoms,
  getUserMedications,
  getUserAppointments,
} from "@/lib/services/healthRecordService";
import { Symptom, Medication, Appointment } from "@/lib/types/database";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";

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

  // Load symptoms
  const loadSymptoms = async () => {
    try {
      setSymptomsLoading(true);
      const userId = localStorage.getItem("userId");
      if (userId) {
        const fetchedSymptoms = await getUserSymptoms(userId);
        setSymptoms(fetchedSymptoms);
      }
    } catch (error) {
      console.error("Error loading symptoms:", error);
    } finally {
      setSymptomsLoading(false);
    }
  };

  // Load medications
  const loadMedications = async () => {
    try {
      setMedicationsLoading(true);
      const userId = localStorage.getItem("userId");
      if (userId) {
        const fetchedMedications = await getUserMedications(userId);
        setMedications(fetchedMedications);
      }
    } catch (error) {
      console.error("Error loading medications:", error);
    } finally {
      setMedicationsLoading(false);
    }
  };

  // Load appointments
  const loadAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const userId = localStorage.getItem("userId");
      if (userId) {
        const fetchedAppointments = await getUserAppointments(userId);
        setAppointments(fetchedAppointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Load all data on mount
  useEffect(() => {
    loadSymptoms();
    loadMedications();
    loadAppointments();
  }, []);

  // Handle callbacks
  const handleSymptomAdded = () => loadSymptoms();
  const handleMedicationAdded = () => loadMedications();
  const handleAppointmentAdded = () => loadAppointments();

  // Helper function to get severity color
  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case "mild":
        return "bg-yellow-400";
      case "moderate":
        return "bg-orange-500";
      case "severe":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4 border-b border-border-light/50 dark:border-border-dark/50">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10"
            >
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
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10 relative"
            >
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                more_vert
              </span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-28">
          <div className="p-6">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              <h2 className="text-xl font-bold mb-4">Daily Health Metrics</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        className="text-blue-100 dark:text-blue-900/50"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                      ></path>
                      <path
                        className="text-blue-500"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray="75, 100"
                        strokeLinecap="round"
                        strokeWidth="3"
                        transform="rotate(90 18 18)"
                      ></path>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-blue-500 text-2xl">
                        water_drop
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold mt-2">6/8 Glasses</p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark">
                    Water
                  </p>
                </div>
                <div>
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        className="text-green-100 dark:text-green-900/50"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                      ></path>
                      <path
                        className="text-green-500"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray="60, 100"
                        strokeLinecap="round"
                        strokeWidth="3"
                        transform="rotate(90 18 18)"
                      ></path>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-green-500 text-2xl">
                        footprint
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold mt-2">6,201</p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark">
                    Steps
                  </p>
                </div>
                <div>
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        className="text-purple-100 dark:text-purple-900/50"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                      ></path>
                      <path
                        className="text-purple-500"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray="90, 100"
                        strokeLinecap="round"
                        strokeWidth="3"
                        transform="rotate(90 18 18)"
                      ></path>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-purple-500 text-2xl">
                        bedtime
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold mt-2">7h 15m</p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark">
                    Sleep
                  </p>
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
                  <span className="material-symbols-outlined text-base">
                    add
                  </span>
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
                      {index > 0 && (
                        <div className="border-t border-border-light/50 dark:border-border-dark/50 my-4"></div>
                      )}
                      <div className={index > 0 ? "mt-4" : ""}>
                        <p className="font-semibold mb-2">
                          {symptom.symptom_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${getSeverityColor(symptom.severity)}`}
                              style={{ width: "70%" }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">
                            {symptom.severity || "Unknown"}
                          </span>
                        </div>
                        {symptom.description && (
                          <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                            {symptom.description}
                          </p>
                        )}
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                          Logged:{" "}
                          {new Date(symptom.logged_date).toLocaleString()}
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
                  <span className="material-symbols-outlined text-base">
                    add
                  </span>
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
                      {index > 0 && (
                        <div className="border-t border-border-light/50 dark:border-border-dark/50"></div>
                      )}
                      <div className={index > 0 ? "pt-4" : ""}>
                        <div className="flex items-center">
                          <div className="w-12 h-12 flex-shrink-0 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mr-4">
                            <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-2xl">
                              pill
                            </span>
                          </div>
                          <div className="flex-grow">
                            <p className="font-semibold">
                              {medication.medication_name}
                            </p>
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">
                              {medication.dosage || "No dosage specified"} -{" "}
                              {medication.frequency || "No frequency"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {medication.time_of_day || "N/A"}
                            </p>
                            <p
                              className={`text-sm font-medium ${medication.is_active ? "text-green-500" : "text-gray-500"}`}
                            >
                              {medication.is_active ? "Active" : "Inactive"}
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
                  <span className="material-symbols-outlined text-base">
                    add
                  </span>
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
                      {index > 0 && (
                        <div className="border-t border-border-light/50 dark:border-border-dark/50"></div>
                      )}
                      <div className={index > 0 ? "pt-4" : ""}>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-16 p-2 bg-primary/10 rounded-lg">
                            <p className="text-primary font-bold text-lg">
                              {
                                formatDate(appointment.appointment_date).split(
                                  " ",
                                )[1]
                              }
                            </p>
                            <p className="text-primary text-sm uppercase">
                              {
                                formatDate(appointment.appointment_date).split(
                                  " ",
                                )[0]
                              }
                            </p>
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
