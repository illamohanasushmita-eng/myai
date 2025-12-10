# 🧪 **Testing Task Creation API**

## 📋 **Test Plan**

Complete testing guide for the improved task creation API.

---

## ✅ **Test 1: Valid Task Creation**

### **Objective**

Verify that a valid task is created successfully.

### **Steps**

1. Go to http://localhost:3002/tasks
2. Click "Add New Task"
3. Fill in the form:
   - Title: "Complete Project Proposal"
   - Description: "Finish the Q4 project proposal"
   - Category: "Work"
   - Priority: "High"
   - Due Date: (select a date)
4. Click "Save Task"

### **Expected Result**

- ✅ No errors in console
- ✅ Redirected to /tasks page
- ✅ New task appears in the list
- ✅ Task data visible in Supabase dashboard

### **Server Logs**

```
[TASK-CREATE] Starting task creation...
[TASK-CREATE] Request body received: {...}
[TASK-CREATE] Task data prepared for userId: ***
[TASK-CREATE] Task created successfully: {
  task_id: 'abc123...',
  user_id: 'xyz789...',
  title: 'Complete Project Proposal'
}
```

---

## ❌ **Test 2: Missing Title**

### **Objective**

Verify validation error when title is missing.

### **Steps**

1. Go to http://localhost:3002/tasks/add
2. Leave title empty
3. Fill other fields
4. Click "Save Task"

### **Expected Result**

- ✅ Form validation prevents submission (HTML5)
- ✅ Error message shown: "Task Title is required"

### **Server Logs**

```
(No server logs - blocked by frontend validation)
```

---

## ❌ **Test 3: Empty Title**

### **Objective**

Verify validation error when title is only whitespace.

### **Steps**

1. Go to http://localhost:3002/tasks/add
2. Enter title: " " (only spaces)
3. Click "Save Task"

### **Expected Result**

- ✅ Returns 400 error
- ✅ Error message: "Validation failed"
- ✅ Details: "title is required and must be a non-empty string"

### **Server Logs**

```
[TASK-CREATE] Validation errors: [
  'title is required and must be a non-empty string'
]
```

---

## ❌ **Test 4: Missing User ID**

### **Objective**

Verify error when user is not authenticated.

### **Steps**

1. Clear localStorage: `localStorage.clear()`
2. Go to http://localhost:3002/tasks/add
3. Fill in task form
4. Click "Save Task"

### **Expected Result**

- ✅ Error message: "User not authenticated"
- ✅ No API call made

### **Server Logs**

```
(No server logs - blocked by frontend)
```

---

## ❌ **Test 5: Invalid User ID**

### **Objective**

Verify error when user ID doesn't exist in database.

### **Steps**

1. Open browser console
2. Run: `localStorage.setItem('userId', 'invalid-uuid')`
3. Go to http://localhost:3002/tasks/add
4. Fill in task form
5. Click "Save Task"

### **Expected Result**

- ✅ Returns 400 error
- ✅ Error message: "Invalid user ID or user does not exist"

### **Server Logs**

```
[TASK-CREATE] Supabase insert error: {
  code: '23503',
  message: 'insert or update on table "tasks" violates foreign key constraint...'
}
```

---

## ❌ **Test 6: Whitespace Trimming**

### **Objective**

Verify that whitespace is trimmed from fields.

### **Steps**

1. Go to http://localhost:3002/tasks/add
2. Enter title: " My Task " (with spaces)
3. Enter description: " Task description "
4. Enter category: " Work "
5. Click "Save Task"

### **Expected Result**

- ✅ Task created successfully
- ✅ In Supabase, title is "My Task" (no spaces)
- ✅ Description is "Task description" (no spaces)
- ✅ Category is "Work" (no spaces)

### **Server Logs**

```
[TASK-CREATE] Task created successfully: {
  task_id: 'abc123...',
  title: 'My Task',
  ...
}
```

---

## ✅ **Test 7: Optional Fields**

### **Objective**

Verify that optional fields can be omitted.

### **Steps**

1. Go to http://localhost:3002/tasks/add
2. Fill only required fields:
   - Title: "Simple Task"
3. Leave other fields empty
4. Click "Save Task"

### **Expected Result**

- ✅ Task created successfully
- ✅ Optional fields are null in database
- ✅ Defaults applied: status='pending', priority='medium'

### **Server Logs**

```
[TASK-CREATE] Task created successfully: {
  task_id: 'abc123...',
  title: 'Simple Task',
  description: null,
  category: null,
  status: 'pending',
  priority: 'medium',
  due_date: null,
  ai_generated: false
}
```

---

## ✅ **Test 8: Multiple Tasks**

### **Objective**

Verify that multiple tasks can be created.

### **Steps**

1. Create Task 1: "Task One"
2. Create Task 2: "Task Two"
3. Create Task 3: "Task Three"
4. Go to /tasks page

### **Expected Result**

- ✅ All 3 tasks appear in list
- ✅ All tasks have unique IDs
- ✅ All tasks belong to same user

---

## 🔍 **Test 9: Verify in Supabase**

### **Objective**

Verify data is correctly stored in Supabase.

### **Steps**

1. Go to https://app.supabase.com
2. Select your project
3. Click "Table Editor"
4. Select "tasks" table
5. Find your created task

### **Expected Result**

- ✅ Task appears in table
- ✅ All fields populated correctly
- ✅ created_at and updated_at timestamps set
- ✅ user_id matches logged-in user

---

## 📊 **Test 10: Error Logging**

### **Objective**

Verify comprehensive error logging.

### **Steps**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Create a task
4. Check console output

### **Expected Result**

- ✅ [TASK-SERVICE] logs visible
- ✅ Task creation success logged
- ✅ Task ID logged

### **Console Output**

```
[TASK-SERVICE] Creating task for user: ***
[TASK-SERVICE] Task created successfully: abc123...
```

---

## 🧪 **Curl Test Examples**

### **Valid Task**

```bash
curl -X POST http://localhost:3002/api/tasks/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "title": "Test Task",
    "description": "Test description",
    "category": "Work",
    "priority": "high",
    "status": "pending"
  }'
```

### **Missing Title**

```bash
curl -X POST http://localhost:3002/api/tasks/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id"
  }'
```

### **Invalid JSON**

```bash
curl -X POST http://localhost:3002/api/tasks/create \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

---

## ✅ **Checklist**

- [ ] Test 1: Valid task creation
- [ ] Test 2: Missing title (frontend)
- [ ] Test 3: Empty title (backend)
- [ ] Test 4: Missing user ID (frontend)
- [ ] Test 5: Invalid user ID (backend)
- [ ] Test 6: Whitespace trimming
- [ ] Test 7: Optional fields
- [ ] Test 8: Multiple tasks
- [ ] Test 9: Verify in Supabase
- [ ] Test 10: Error logging

---

## 📝 **Test Results**

| Test            | Status | Notes   |
| --------------- | ------ | ------- |
| Valid Creation  | ⏳     | Pending |
| Missing Title   | ⏳     | Pending |
| Empty Title     | ⏳     | Pending |
| Missing User ID | ⏳     | Pending |
| Invalid User ID | ⏳     | Pending |
| Whitespace Trim | ⏳     | Pending |
| Optional Fields | ⏳     | Pending |
| Multiple Tasks  | ⏳     | Pending |
| Supabase Verify | ⏳     | Pending |
| Error Logging   | ⏳     | Pending |

---

**Status**: ✅ **READY TO TEST**
**Application**: http://localhost:3002
**API Endpoint**: POST /api/tasks/create
