# 📡 Billing API Reference

Complete API documentation for the Billing Management System.

---

## Base URL
```
http://localhost:3002/api/billing
```

---

## 🔐 Authentication
All API routes require a valid `userId` to be passed in the request. The system uses Supabase Row Level Security (RLS) to ensure users can only access their own bills.

---

## 📋 API Endpoints

### 1. Add Bill
**POST** `/api/billing/add`

Create a new billing reminder.

#### Request Body
```json
{
  "userId": "uuid-string",
  "bill_name": "Electricity Bill",
  "category": "electricity",
  "amount": 1200,
  "currency": "INR",
  "due_date": "2025-12-25",
  "frequency": "monthly",
  "reminder_days": 10,
  "reminder_enabled": true,
  "auto_pay": false,
  "notes": "Optional notes"
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string (UUID) | ✅ | User ID from auth |
| bill_name | string | ✅ | Name of the bill |
| category | BillingCategory | ✅ | Bill category (see categories below) |
| amount | number | ✅ | Bill amount (must be positive) |
| currency | Currency | ❌ | Currency code (default: INR) |
| due_date | string (YYYY-MM-DD) | ✅ | Due date |
| frequency | BillingFrequency | ❌ | Recurrence (default: monthly) |
| reminder_days | number | ❌ | Days before due date to remind (default: 10) |
| reminder_enabled | boolean | ❌ | Enable reminders (default: true) |
| auto_pay | boolean | ❌ | Auto-pay enabled (default: false) |
| notes | string | ❌ | Additional notes |

#### Categories
```typescript
'phone_emi' | 'electricity' | 'water' | 'internet' | 'gas' | 
'home_loan' | 'vehicle_emi' | 'ott_subscription' | 'insurance' | 
'credit_card' | 'mobile_recharge' | 'rent' | 'other'
```

#### Frequencies
```typescript
'monthly' | 'quarterly' | 'yearly' | 'one-time'
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "user_id": "uuid-string",
    "bill_name": "Electricity Bill",
    "category": "electricity",
    "amount": 1200,
    "currency": "INR",
    "due_date": "2025-12-25",
    "next_due_date": null,
    "frequency": "monthly",
    "status": "pending",
    "reminder_days": 10,
    "reminder_enabled": true,
    "auto_pay": false,
    "notes": "Optional notes",
    "created_at": "2025-11-12T10:00:00Z",
    "updated_at": "2025-11-12T10:00:00Z"
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Validation error message"
}
```

---

### 2. List Bills
**GET** `/api/billing/list`

Fetch bills with optional filters.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string (UUID) | ✅ | User ID |
| status | string | ❌ | Filter by status (pending, paid, overdue, completed) |
| upcoming | boolean | ❌ | Get only upcoming bills (next 30 days) |

#### Example Requests
```bash
# Get all bills
GET /api/billing/list?userId=uuid-string

# Get only pending bills
GET /api/billing/list?userId=uuid-string&status=pending

# Get upcoming bills
GET /api/billing/list?userId=uuid-string&upcoming=true
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "bill_name": "Electricity Bill",
      "category": "electricity",
      "amount": 1200,
      "currency": "INR",
      "due_date": "2025-12-25",
      "status": "pending",
      "days_until_due": 43,
      "urgency_level": "upcoming"
    }
  ]
}
```

---

### 3. Mark Bill as Paid
**POST** `/api/billing/mark-paid`

Mark a bill as paid and calculate next due date for recurring bills.

#### Request Body
```json
{
  "billId": "uuid-string"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "bill_name": "Electricity Bill",
    "status": "paid",
    "paid_at": "2025-11-12T10:00:00Z",
    "next_due_date": "2026-01-25"
  }
}
```

#### Behavior
- **Recurring bills (monthly/quarterly/yearly):**
  - Status → `paid`
  - `paid_at` → current timestamp
  - `next_due_date` → calculated based on frequency
  - `last_notified_at` → reset to null
  
- **One-time bills:**
  - Status → `completed`
  - `paid_at` → current timestamp
  - `next_due_date` → null

---

### 4. Get Insights
**GET** `/api/billing/insights`

Get billing analytics and AI-powered suggestions.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string (UUID) | ✅ | User ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "total_monthly_bills": 5,
    "total_amount": 8500,
    "bills_by_category": {
      "electricity": 1200,
      "internet": 999,
      "phone_emi": 2000,
      "ott_subscription": 299,
      "water": 500
    },
    "upcoming_bills_count": 3,
    "overdue_bills_count": 0,
    "paid_this_month": 2,
    "spending_trend": "stable",
    "highest_bill": {
      "id": "uuid-string",
      "bill_name": "Phone EMI",
      "amount": 2000
    },
    "suggestions": [
      "Your highest expense category is phone emi at ₹2,000. Consider ways to optimize this expense.",
      "All your bills are up to date! Consider reviewing your subscriptions to identify potential savings."
    ]
  }
}
```

#### Spending Trends
- `increasing` - Bills increased by >10% in last 3 months
- `decreasing` - Bills decreased by >10% in last 3 months
- `stable` - Bills changed by <10% in last 3 months

---

### 5. Delete Bill
**DELETE** `/api/billing/delete`

Delete a billing reminder.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| billId | string (UUID) | ✅ | Bill ID to delete |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Bill deleted successfully"
}
```

---

## 🔔 Realtime Notifications

### Subscribe to Billing Reminders

The system uses Supabase Realtime to send voice notifications.

#### Channel Name
```
billing_reminders:{userId}
```

#### Event Type
```
billing_reminder
```

#### Payload Structure
```json
{
  "timestamp": "2025-11-12T09:00:00Z",
  "bills": [
    {
      "bill_id": "uuid-string",
      "bill_name": "Electricity Bill",
      "amount": 1200,
      "currency": "INR",
      "due_date": "2025-12-25",
      "days_until_due": 10,
      "urgency_level": "soon"
    }
  ],
  "total_bills": 1,
  "total_amount": 1200
}
```

#### Example Usage (React)
```typescript
import { supabase } from '@/lib/supabaseClient';
import { useBillingReminders } from '@/hooks/useBillingReminders';

function MyComponent() {
  const { reminders, isConnected } = useBillingReminders({
    userId: 'your-user-id',
    enabled: true,
    onReminder: (payload) => {
      console.log('Received reminder:', payload);
      // Voice notification is automatically triggered
    }
  });

  return (
    <div>
      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
    </div>
  );
}
```

---

## 🧪 Testing with cURL

### Add Bill
```bash
curl -X POST http://localhost:3002/api/billing/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "bill_name": "Test Bill",
    "category": "electricity",
    "amount": 1000,
    "due_date": "2025-12-31",
    "frequency": "monthly"
  }'
```

### List Bills
```bash
curl "http://localhost:3002/api/billing/list?userId=your-user-id"
```

### Mark as Paid
```bash
curl -X POST http://localhost:3002/api/billing/mark-paid \
  -H "Content-Type: application/json" \
  -d '{
    "billId": "bill-uuid"
  }'
```

### Get Insights
```bash
curl "http://localhost:3002/api/billing/insights?userId=your-user-id"
```

### Delete Bill
```bash
curl -X DELETE "http://localhost:3002/api/billing/delete?billId=bill-uuid"
```

---

## 🛡️ Error Handling

All API routes follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes
| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 404 | Not Found - Bill not found |
| 500 | Internal Server Error - Database or server error |

---

## 📊 Database Functions

The system includes custom PostgreSQL functions that can be called directly:

### 1. Mark Bill Paid
```sql
SELECT * FROM mark_bill_paid('bill-uuid');
```

### 2. Calculate Next Due Date
```sql
SELECT calculate_next_due_date('2025-12-25', 'monthly');
```

### 3. Get Bills Due Soon
```sql
SELECT * FROM get_bills_due_soon('user-uuid', 10);
```

### 4. Get Overdue Bills
```sql
SELECT * FROM get_overdue_bills('user-uuid');
```

### 5. Get Monthly Total
```sql
SELECT get_monthly_total('user-uuid');
```

---

## 🎯 Best Practices

1. **Always validate input** - Use Zod schemas for type safety
2. **Handle errors gracefully** - Provide meaningful error messages
3. **Use transactions** - For operations that modify multiple records
4. **Cache insights** - Insights calculation can be expensive
5. **Rate limit** - Implement rate limiting for production
6. **Sanitize input** - Prevent SQL injection and XSS attacks
7. **Log errors** - Use proper logging for debugging

---

## 📞 Support

For API issues:
1. Check request/response in browser DevTools
2. Verify userId is valid
3. Check Supabase logs for database errors
4. Ensure RLS policies are active
5. Verify Edge Function is deployed

---

**Happy Coding! 🚀**

