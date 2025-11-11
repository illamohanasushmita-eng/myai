# 📚 Export Aliases Reference Guide

## Overview

All conflicting exports have been resolved by using **service-specific aliases**. This guide shows you how to import and use each function.

---

## 🏥 Health Services

### Health Record Service
```typescript
import {
  getHealthRecordsFromHealthRecordService,
  createHealthRecordFromHealthRecordService,
  updateHealthRecordFromHealthRecordService,
  deleteHealthRecordFromHealthRecordService,
  getUserSymptomsFromHealthRecordService,
  createSymptomFromHealthRecordService,
  updateSymptomFromHealthRecordService,
  deleteSymptomFromHealthRecordService,
  getUserMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  getUserAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '@/lib/services';
```

### Health Service
```typescript
import {
  getHealthRecordsFromHealthService,
  createHealthRecordFromHealthService,
  updateHealthRecordFromHealthService,
  deleteHealthRecordFromHealthService,
  getUserSymptomsFromHealthService,
  createSymptomFromHealthService,
  updateSymptomFromHealthService,
  deleteSymptomFromHealthService,
} from '@/lib/services';
```

---

## ⚙️ Settings & Notifications

### Settings Service
```typescript
import {
  getUserSettings,
  createSettings,
  updateSettings,
  deleteSettings,
  getSettingsUserNotifications,
  createSettingsNotification,
  updateSettingsNotification,
  deleteSettingsNotification,
  getPendingNotifications,
} from '@/lib/services';
```

### Professional Service (Notifications)
```typescript
import {
  getProfessionalUserNotifications,
  createProfessionalNotification,
} from '@/lib/services';
```

---

## 🚗 Automotive Services

### Automotive Service
```typescript
import {
  getAutomotiveUserVehicles,
  getPrimaryVehicle,
  createAutomotiveVehicle,
  updateVehicle,
  getAutomotiveMaintenanceLogs,
  createAutomotiveMaintenanceLog,
  getAutomotiveUserRoutes,
  getFavoriteRoutes,
  createAutomotiveRoute,
  updateRoute,
} from '@/lib/services';
```

### General Service (Automotive Functions)
```typescript
import {
  getGeneralUserVehicles,
  createGeneralVehicle,
  getGeneralUserRoutes,
  createGeneralRoute,
  getGeneralMaintenanceLogs,
  createGeneralMaintenanceLog,
} from '@/lib/services';
```

---

## 🤖 AI & Professional Services

### Professional Service
```typescript
import {
  getUserProfessionalNotes,
  createProfessionalNote,
  updateProfessionalNote,
  deleteProfessionalNote,
  getProfessionalUserNotifications,
  getUnreadNotifications,
  createProfessionalNotification,
  markNotificationAsRead,
  getProfessionalUserAILogs,
  createProfessionalAILog,
  getUserInsights,
  createInsight,
} from '@/lib/services';
```

### General Service (AI Functions)
```typescript
import {
  getGeneralUserAILogs,
  createGeneralAILog,
  getUserAIRecommendations,
  createAIRecommendation,
} from '@/lib/services';
```

---

## 📚 Learning & Habits

### Habit Service
```typescript
import {
  getUserHabits,
  getActiveHabits,
  createHabit,
  updateHabit,
  getHabitLogs,
  logHabitCompletion,
  getTodayHabitLogs,
  getUserGrowthGoals,
  createGrowthGoal,
  // Note: habitService also exports learning modules
  // but they're aliased in general service
} from '@/lib/services';
```

### General Service (Learning Modules)
```typescript
import {
  getGeneralUserLearningModules,
  createGeneralLearningModule,
} from '@/lib/services';
```

---

## 📅 Calendar & Devices

### General Service
```typescript
import {
  getUserCalendarEvents,
  createCalendarEvent,
  getUserVoiceCommands,
  createVoiceCommand,
  getUserDevices,
  createDevice,
} from '@/lib/services';
```

---

## 💡 Usage Examples

### Example 1: Get Health Records
```typescript
// Using Health Record Service
const records = await getHealthRecordsFromHealthRecordService(userId);

// OR using Health Service
const records = await getHealthRecordsFromHealthService(userId);
```

### Example 2: Get Vehicles
```typescript
// Using Automotive Service
const vehicles = await getAutomotiveUserVehicles(userId);

// OR using General Service
const vehicles = await getGeneralUserVehicles(userId);
```

### Example 3: Get AI Logs
```typescript
// Using Professional Service
const logs = await getProfessionalUserAILogs(userId);

// OR using General Service
const logs = await getGeneralUserAILogs(userId);
```

### Example 4: Get Notifications
```typescript
// Using Settings Service
const notifications = await getSettingsUserNotifications(userId);

// OR using Professional Service
const notifications = await getProfessionalUserNotifications(userId);
```

---

## 🎯 Choosing Which Service to Use

When you have multiple options, choose based on your use case:

| Function | Service 1 | Service 2 | When to Use |
|---|---|---|---|
| Health Records | `HealthRecordService` | `HealthService` | Use HealthRecordService for comprehensive health data (includes medications, appointments) |
| Vehicles | `AutomotiveService` | `GeneralService` | Use AutomotiveService for detailed vehicle management |
| Routes | `AutomotiveService` | `GeneralService` | Use AutomotiveService for route optimization features |
| Maintenance Logs | `AutomotiveService` | `GeneralService` | Use AutomotiveService for maintenance tracking |
| AI Logs | `ProfessionalService` | `GeneralService` | Use ProfessionalService for professional context |
| Learning Modules | `HabitService` | `GeneralService` | Use HabitService for habit-related learning |
| Notifications | `SettingsService` | `ProfessionalService` | Use SettingsService for user preferences, ProfessionalService for professional alerts |

---

## ✅ No Breaking Changes

All functions are still available! They just have service-specific names to avoid conflicts. Your existing code will continue to work if you:

1. Import from specific service files directly:
   ```typescript
   import { getUserVehicles } from '@/lib/services/automotiveService';
   ```

2. Or use the new aliased names from the index:
   ```typescript
   import { getAutomotiveUserVehicles } from '@/lib/services';
   ```

---

## 📝 Notes

- All functions maintain the same signatures and behavior
- No functionality has changed
- This is purely a naming/export organization fix
- The aliases make it clear which service each function comes from
- Future code will be easier to understand and maintain

---

**Status**: ✅ All exports properly aliased and conflict-free

