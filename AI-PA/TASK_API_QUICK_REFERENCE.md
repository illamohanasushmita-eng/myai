# ⚡ **Task API - Quick Reference**

## 📍 **API Endpoint**

```
POST /api/tasks/create
```

---

## 📤 **Request Format**

```json
{
  "userId": "user-uuid",
  "title": "Task Title",
  "description": "Optional description",
  "category": "Work",
  "priority": "high",
  "status": "pending",
  "due_date": "2024-12-31T23:59:59Z",
  "ai_generated": false
}
```

### **Required Fields**
- `userId` (string) - User UUID
- `title` (string) - Task title (non-empty)

### **Optional Fields**
- `description` (string) - Task description
- `category` (string) - Task category
- `priority` (string) - Priority level (default: 'medium')
- `status` (string) - Task status (default: 'pending')
- `due_date` (string) - ISO format date
- `ai_generated` (boolean) - AI generated flag (default: false)

---

## 📥 **Response Format**

### **Success (201)**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "title": "Task Title",
    "description": "description",
    "category": "Work",
    "priority": "high",
    "status": "pending",
    "due_date": "2024-12-31T23:59:59Z",
    "ai_generated": false,
    "created_at": "2024-10-23T10:00:00Z",
    "updated_at": "2024-10-23T10:00:00Z"
  }
}
```

### **Validation Error (400)**
```json
{
  "error": "Validation failed",
  "details": [
    "userId is required and must be a string",
    "title is required and must be a non-empty string"
  ]
}
```

### **Conflict Error (409)**
```json
{
  "error": "Task with this title already exists for this user"
}
```

### **Server Error (500)**
```json
{
  "error": "Failed to create task",
  "details": {
    "code": "PGRST204",
    "message": "Error details..."
  }
}
```

---

## ✅ **Validation Rules**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| userId | string | ✅ | Must be non-empty |
| title | string | ✅ | Must be non-empty |
| description | string | ❌ | Trimmed, can be null |
| category | string | ❌ | Trimmed, can be null |
| priority | string | ❌ | Default: 'medium' |
| status | string | ❌ | Default: 'pending' |
| due_date | string | ❌ | ISO format, can be null |
| ai_generated | boolean | ❌ | Default: false |

---

## 🔍 **Error Codes**

| Code | Status | Meaning |
|------|--------|---------|
| 400 | Bad Request | Invalid input or JSON |
| 409 | Conflict | Unique constraint violation |
| 500 | Server Error | Database or unexpected error |

---

## 🧪 **Quick Test**

```bash
# Test with curl
curl -X POST http://localhost:3002/api/tasks/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "title": "Test Task",
    "description": "Testing the API",
    "category": "Work",
    "priority": "high"
  }'
```

---

## 📝 **Frontend Usage**

```typescript
import { createTask } from '@/lib/services/taskService';

const userId = localStorage.getItem('userId');
await createTask(userId, {
  title: 'My Task',
  description: 'Task description',
  category: 'Work',
  priority: 'high',
  status: 'pending',
  ai_generated: false,
});
```

---

## 🔐 **Security**

✅ Service role key used (backend only)
✅ Input sanitization
✅ Type validation
✅ Secure logging

---

## 📊 **Features**

✅ Input validation
✅ Data sanitization
✅ Error handling
✅ Comprehensive logging
✅ Database constraint handling
✅ Proper HTTP status codes

---

**Status**: ✅ READY TO USE
**Endpoint**: POST /api/tasks/create
**Documentation**: BACKEND_TASK_API_IMPROVEMENTS.md

