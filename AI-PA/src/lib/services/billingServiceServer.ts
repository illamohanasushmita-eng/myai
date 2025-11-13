/**
 * Server-Side Billing Service
 * ONLY use this in API routes and server components
 * Uses service role key to bypass RLS
 */

import { supabaseServer } from '@/lib/supabaseServer';
import {
  BillingReminder,
  CreateBillingReminderInput,
  UpdateBillingReminderInput,
  BillingInsights,
  BillingReminderWithDays,
  BillingCategory,
  BillingStatus,
} from '@/lib/types/database';

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new billing reminder (SERVER-SIDE ONLY)
 */
export async function createBillingReminder(
  userId: string,
  input: CreateBillingReminderInput
): Promise<BillingReminder> {
  console.log('📩 [SERVER] Creating billing reminder:', input);

  const { data, error } = await supabaseServer
    .from('billing_reminders')
    .insert({
      user_id: userId,
      bill_name: input.bill_name,
      category: input.category,
      amount: input.amount,
      currency: input.currency || 'INR',
      due_date: input.due_date,
      frequency: input.frequency || 'monthly',
      reminder_days: input.reminder_days || 10,
      reminder_enabled: input.reminder_enabled !== false,
      notes: input.notes || null,
      auto_pay: input.auto_pay || false,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('❌ [SERVER] Error creating billing reminder:', error);
    throw new Error(`Failed to create billing reminder: ${error.message}`);
  }

  console.log('✅ [SERVER] Billing reminder created:', data);
  return data as BillingReminder;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all billing reminders for a user (SERVER-SIDE ONLY)
 */
export async function getUserBillingReminders(
  userId: string,
  status?: BillingStatus
): Promise<BillingReminder[]> {
  console.log('📩 [SERVER] Fetching billing reminders for user:', userId);

  let query = supabaseServer
    .from('billing_reminders')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [SERVER] Error fetching billing reminders:', error);
    throw new Error(`Failed to fetch billing reminders: ${error.message}`);
  }

  console.log(`✅ [SERVER] Found ${data?.length || 0} billing reminders`);
  return (data as BillingReminder[]) || [];
}

/**
 * Get upcoming bills (next 30 days) (SERVER-SIDE ONLY)
 */
export async function getUpcomingBills(
  userId: string
): Promise<BillingReminderWithDays[]> {
  console.log('📩 [SERVER] Fetching upcoming bills for user:', userId);

  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const { data, error } = await supabaseServer
    .from('billing_reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0])
    .order('due_date', { ascending: true });

  if (error) {
    console.error('❌ [SERVER] Error fetching upcoming bills:', error);
    throw new Error(`Failed to fetch upcoming bills: ${error.message}`);
  }

  // Calculate days until due and urgency level
  const billsWithDays: BillingReminderWithDays[] = (data || []).map((bill: any) => {
    const dueDate = new Date(bill.due_date);
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let urgencyLevel: 'overdue' | 'urgent' | 'soon' | 'upcoming';
    if (daysUntilDue < 0) {
      urgencyLevel = 'overdue';
    } else if (daysUntilDue <= 3) {
      urgencyLevel = 'urgent';
    } else if (daysUntilDue <= 7) {
      urgencyLevel = 'soon';
    } else {
      urgencyLevel = 'upcoming';
    }

    return {
      ...bill,
      days_until_due: daysUntilDue,
      urgency_level: urgencyLevel,
    } as BillingReminderWithDays;
  });

  console.log(`✅ [SERVER] Found ${billsWithDays.length} upcoming bills`);
  return billsWithDays;
}

/**
 * Get a single billing reminder by ID (SERVER-SIDE ONLY)
 */
export async function getBillingReminderById(
  billId: string
): Promise<BillingReminder | null> {
  console.log('📩 [SERVER] Fetching billing reminder:', billId);

  const { data, error } = await supabaseServer
    .from('billing_reminders')
    .select('*')
    .eq('id', billId)
    .single();

  if (error) {
    console.error('❌ [SERVER] Error fetching billing reminder:', error);
    return null;
  }

  return data as BillingReminder;
}

/**
 * Get bills by category (SERVER-SIDE ONLY)
 */
export async function getBillsByCategory(
  userId: string,
  category: BillingCategory
): Promise<BillingReminder[]> {
  console.log('📩 [SERVER] Fetching bills by category:', category);

  const { data, error } = await supabaseServer
    .from('billing_reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('❌ [SERVER] Error fetching bills by category:', error);
    throw new Error(`Failed to fetch bills: ${error.message}`);
  }

  return (data as BillingReminder[]) || [];
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update a billing reminder (SERVER-SIDE ONLY)
 */
export async function updateBillingReminder(
  billId: string,
  updates: UpdateBillingReminderInput
): Promise<BillingReminder> {
  console.log('📩 [SERVER] Updating billing reminder:', billId, updates);

  const { data, error } = await supabaseServer
    .from('billing_reminders')
    .update(updates)
    .eq('id', billId)
    .select()
    .single();

  if (error) {
    console.error('❌ [SERVER] Error updating billing reminder:', error);
    throw new Error(`Failed to update billing reminder: ${error.message}`);
  }

  console.log('✅ [SERVER] Billing reminder updated:', data);
  return data as BillingReminder;
}

/**
 * Mark a bill as paid (SERVER-SIDE ONLY)
 */
export async function markBillAsPaid(
  billId: string,
  paymentMethod?: string
): Promise<BillingReminder> {
  console.log('📩 [SERVER] Marking bill as paid:', billId);

  // Get the bill first
  const bill = await getBillingReminderById(billId);
  if (!bill) {
    throw new Error('Bill not found');
  }

  // Calculate next due date based on frequency
  let nextDueDate: string | null = null;
  if (bill.frequency !== 'one-time') {
    const currentDue = new Date(bill.due_date);
    const next = new Date(currentDue);

    switch (bill.frequency) {
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    nextDueDate = next.toISOString().split('T')[0];
  }

  const finalStatus = bill.frequency === 'one-time' ? 'completed' : 'paid';

  const { data, error } = await supabaseServer
    .from('billing_reminders')
    .update({
      status: finalStatus,
      paid_at: new Date().toISOString(),
      next_due_date: nextDueDate,
      payment_method: paymentMethod || null,
      last_notified_at: null,
    })
    .eq('id', billId)
    .select()
    .single();

  if (error) {
    console.error('❌ [SERVER] Error marking bill as paid:', error);
    throw new Error(`Failed to mark bill as paid: ${error.message}`);
  }

  console.log('✅ [SERVER] Bill marked as paid:', data);
  return data as BillingReminder;
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a billing reminder (SERVER-SIDE ONLY)
 */
export async function deleteBillingReminder(billId: string): Promise<void> {
  console.log('📩 [SERVER] Deleting billing reminder:', billId);

  const { error } = await supabaseServer
    .from('billing_reminders')
    .delete()
    .eq('id', billId);

  if (error) {
    console.error('❌ [SERVER] Error deleting billing reminder:', error);
    throw new Error(`Failed to delete billing reminder: ${error.message}`);
  }

  console.log('✅ [SERVER] Billing reminder deleted');
}

// ============================================================================
// ANALYTICS & INSIGHTS
// ============================================================================

/**
 * Get billing insights and analytics (SERVER-SIDE ONLY)
 */
export async function getBillingInsights(
  userId: string
): Promise<BillingInsights> {
  console.log('📩 [SERVER] Calculating billing insights for user:', userId);

  // Get all bills for the user
  const allBills = await getUserBillingReminders(userId);

  // Filter pending and overdue bills
  const pendingBills = allBills.filter((b) => b.status === 'pending');
  const overdueBills = allBills.filter((b) => b.status === 'overdue');

  // Get bills paid this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paidThisMonth = allBills.filter((b) => {
    if (!b.paid_at) return false;
    const paidDate = new Date(b.paid_at);
    return paidDate >= firstDayOfMonth;
  }).length;

  // Calculate total monthly bills
  const monthlyBills = allBills.filter(
    (b) => b.frequency === 'monthly' && b.status === 'pending'
  );
  const totalMonthlyAmount = monthlyBills.reduce(
    (sum, bill) => sum + Number(bill.amount),
    0
  );

  // Group by category
  const billsByCategory: Record<string, number> = {};
  pendingBills.forEach((bill) => {
    billsByCategory[bill.category] =
      (billsByCategory[bill.category] || 0) + Number(bill.amount);
  });

  // Find highest bill
  const highestBill =
    pendingBills.length > 0
      ? pendingBills.reduce((max, bill) =>
          Number(bill.amount) > Number(max.amount) ? bill : max
        )
      : null;

  // Calculate spending trend (simplified)
  const spendingTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';

  // Generate suggestions
  const suggestions: string[] = [];
  if (overdueBills.length > 0) {
    suggestions.push(
      `You have ${overdueBills.length} overdue bill${
        overdueBills.length > 1 ? 's' : ''
      }. Consider paying them soon.`
    );
  }
  if (totalMonthlyAmount > 50000) {
    suggestions.push(
      'Your monthly bills exceed ₹50,000. Consider reviewing your subscriptions.'
    );
  }
  if (monthlyBills.some((b) => !b.auto_pay)) {
    suggestions.push(
      'Enable auto-pay for recurring bills to avoid missing payments.'
    );
  }

  const insights: BillingInsights = {
    total_monthly_bills: monthlyBills.length,
    total_amount: totalMonthlyAmount,
    bills_by_category: billsByCategory as Record<BillingCategory, number>,
    upcoming_bills_count: pendingBills.length,
    overdue_bills_count: overdueBills.length,
    paid_this_month: paidThisMonth,
    spending_trend: spendingTrend,
    highest_bill: highestBill,
    suggestions,
  };

  console.log('✅ [SERVER] Billing insights calculated:', insights);
  return insights;
}

/**
 * Get total amount due for a user (SERVER-SIDE ONLY)
 */
export async function getTotalAmountDue(userId: string): Promise<number> {
  const pendingBills = await getUserBillingReminders(userId, 'pending');
  const total = pendingBills.reduce(
    (sum, bill) => sum + Number(bill.amount),
    0
  );
  return total;
}

