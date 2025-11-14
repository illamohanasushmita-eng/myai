// Export all services for easy importing
export * from './authService';
export * from './userService';
export * from './taskService';
export * from './reminderService';
export * from './smartHomeService';
export * from './smartHomeRoutineService';
export * from './noteService';
export * from './chatService';
export * from './moodService';

// ===== HEALTH RECORD SERVICE =====
export {
  getUserHealthRecords as getHealthRecordsFromHealthRecordService,
  createHealthRecord as createHealthRecordFromHealthRecordService,
  updateHealthRecord as updateHealthRecordFromHealthRecordService,
  deleteHealthRecord as deleteHealthRecordFromHealthRecordService,
  getUserSymptoms as getUserSymptomsFromHealthRecordService,
  createSymptom as createSymptomFromHealthRecordService,
  updateSymptom as updateSymptomFromHealthRecordService,
  deleteSymptom as deleteSymptomFromHealthRecordService,
  getUserMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  getUserAppointments,
  createAppointment,
  updateAppointment,
} from './healthRecordService';

// ===== HEALTH SERVICE =====
export {
  getUserHealthRecords as getHealthRecordsFromHealthService,
  createHealthRecord as createHealthRecordFromHealthService,
  updateHealthRecord as updateHealthRecordFromHealthService,
  getUserSymptoms as getUserSymptomsFromHealthService,
  createSymptom as createSymptomFromHealthService,
  deleteSymptom as deleteSymptomFromHealthService,
} from './healthService';

// ===== SETTINGS SERVICE =====
export {
  getUserSettings,
  createSettings,
  updateSettings,
  getUserNotifications as getSettingsUserNotifications,
  createNotification as createSettingsNotification,
  updateNotification as updateSettingsNotification,
  deleteNotification as deleteSettingsNotification,
  getPendingNotifications,
} from './settingsService';

// ===== HABIT SERVICE =====
export {
  getUserHabits,
  getActiveHabits,
  createHabit,
  updateHabit,
  getHabitLogs,
  logHabitCompletion,
  getTodayHabitLogs,
  getUserGrowthGoals,
  createGrowthGoal,
} from './habitService';

// ===== AUTOMOTIVE SERVICE =====
export {
  getUserVehicles as getAutomotiveUserVehicles,
  getPrimaryVehicle,
  createVehicle as createAutomotiveVehicle,
  updateVehicle,
  getVehicleMaintenanceLogs as getAutomotiveMaintenanceLogs,
  createMaintenanceLog as createAutomotiveMaintenanceLog,
  getUserRoutes as getAutomotiveUserRoutes,
  getFavoriteRoutes,
  createRoute as createAutomotiveRoute,
  updateRoute,
} from './automotiveService';

// ===== PROFESSIONAL SERVICE =====
export {
  getUserProfessionalNotes,
  createProfessionalNote,
  updateProfessionalNote,
  deleteProfessionalNote,
  getUserNotifications as getProfessionalUserNotifications,
  getUnreadNotifications,
  createNotification as createProfessionalNotification,
  markNotificationAsRead,
  getUserAILogs as getProfessionalUserAILogs,
  createAILog as createProfessionalAILog,
  getUserInsights,
  createInsight,
} from './professionalService';

// ===== GENERAL SERVICE =====
export {
  getUserCalendarEvents,
  createCalendarEvent,
  getUserVehicles as getGeneralUserVehicles,
  createVehicle as createGeneralVehicle,
  getUserRoutes as getGeneralUserRoutes,
  createRoute as createGeneralRoute,
  getVehicleMaintenanceLogs as getGeneralMaintenanceLogs,
  createMaintenanceLog as createGeneralMaintenanceLog,
  getUserLearningModules as getGeneralUserLearningModules,
  createLearningModule as createGeneralLearningModule,
  getUserAILogs as getGeneralUserAILogs,
  createAILog as createGeneralAILog,
  getUserAIRecommendations,
  createAIRecommendation,
  getUserVoiceCommands,
  createVoiceCommand,
  getUserDevices,
  createDevice,
} from './generalService';

