/**
 * AI-Powered Billing Suggestions
 * Analyzes billing patterns and generates smart suggestions
 */

import { BillingReminder } from '@/lib/types/database';

export interface BillingSuggestion {
  type: 'warning' | 'tip' | 'insight' | 'action';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Generate smart suggestions based on billing data
 */
export function generateBillingSuggestions(bills: BillingReminder[]): string[] {
  const suggestions: string[] = [];

  if (bills.length === 0) {
    return ['Start adding your monthly bills to get personalized insights and reminders.'];
  }

  // Analyze overdue bills
  const overdueBills = bills.filter((b) => b.status === 'overdue');
  if (overdueBills.length > 0) {
    const totalOverdue = overdueBills.reduce((sum, b) => sum + Number(b.amount), 0);
    suggestions.push(
      `You have ${overdueBills.length} overdue bill${overdueBills.length > 1 ? 's' : ''} totaling ₹${totalOverdue.toLocaleString('en-IN')}. Pay them as soon as possible to avoid late fees.`
    );
  }

  // Analyze pending bills
  const pendingBills = bills.filter((b) => b.status === 'pending');
  const today = new Date();

  // Bills due in next 7 days
  const upcomingSoon = pendingBills.filter((b) => {
    const dueDate = new Date(b.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysUntilDue > 0 && daysUntilDue <= 7;
  });

  if (upcomingSoon.length > 0) {
    const totalUpcoming = upcomingSoon.reduce((sum, b) => sum + Number(b.amount), 0);
    suggestions.push(
      `${upcomingSoon.length} bill${upcomingSoon.length > 1 ? 's are' : ' is'} due within the next 7 days (₹${totalUpcoming.toLocaleString('en-IN')}). Make sure you have sufficient funds.`
    );
  }

  // Analyze spending by category
  const categoryTotals: Record<string, number> = {};
  bills.forEach((bill) => {
    if (bill.status === 'pending' || bill.status === 'overdue') {
      categoryTotals[bill.category] = (categoryTotals[bill.category] || 0) + Number(bill.amount);
    }
  });

  // Find highest spending category
  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const categoryName = topCategory.replace('_', ' ');
    suggestions.push(
      `Your highest expense category is ${categoryName} at ₹${topAmount.toLocaleString('en-IN')}. Consider ways to optimize this expense.`
    );
  }

  // Analyze payment patterns
  const paidBills = bills.filter((b) => b.status === 'paid');
  const paidThisMonth = paidBills.filter((b) => {
    if (!b.paid_at) return false;
    const paidDate = new Date(b.paid_at);
    return (
      paidDate.getMonth() === today.getMonth() &&
      paidDate.getFullYear() === today.getFullYear()
    );
  });

  if (paidThisMonth.length > 0) {
    suggestions.push(
      `Great job! You've paid ${paidThisMonth.length} bill${paidThisMonth.length > 1 ? 's' : ''} this month. Keep up the good work!`
    );
  }

  // Analyze auto-pay opportunities
  const nonAutoPay = bills.filter((b) => !b.auto_pay && b.frequency === 'monthly');
  if (nonAutoPay.length >= 3) {
    suggestions.push(
      `You have ${nonAutoPay.length} recurring monthly bills without auto-pay. Consider setting up auto-pay to avoid missing payments.`
    );
  }

  // Analyze reminder settings
  const noReminders = bills.filter((b) => !b.reminder_enabled);
  if (noReminders.length > 0) {
    suggestions.push(
      `${noReminders.length} bill${noReminders.length > 1 ? 's have' : ' has'} reminders disabled. Enable reminders to get voice notifications from Lara.`
    );
  }

  // Analyze total monthly commitment
  const monthlyBills = bills.filter((b) => b.frequency === 'monthly' && b.status === 'pending');
  if (monthlyBills.length > 0) {
    const totalMonthly = monthlyBills.reduce((sum, b) => sum + Number(b.amount), 0);
    suggestions.push(
      `Your total monthly bill commitment is ₹${totalMonthly.toLocaleString('en-IN')}. Budget accordingly to ensure timely payments.`
    );
  }

  // Analyze high-value bills
  const highValueBills = bills.filter((b) => Number(b.amount) > 5000 && b.status === 'pending');
  if (highValueBills.length > 0) {
    suggestions.push(
      `You have ${highValueBills.length} high-value bill${highValueBills.length > 1 ? 's' : ''} (>₹5,000) pending. Prioritize these payments.`
    );
  }

  // Seasonal suggestions
  const month = today.getMonth();
  if (month === 11) {
    // December
    suggestions.push(
      'Year-end tip: Review your annual bills and subscriptions. Cancel unused services to save money in the new year.'
    );
  } else if (month === 2) {
    // March (financial year end in India)
    suggestions.push(
      'Financial year-end reminder: Ensure all tax-related bills (insurance, home loan) are paid for tax benefits.'
    );
  }

  // If no specific suggestions, provide general tips
  if (suggestions.length === 0) {
    suggestions.push(
      'All your bills are up to date! Consider reviewing your subscriptions to identify potential savings.'
    );
  }

  return suggestions;
}

/**
 * Analyze spending trend
 */
export function analyzeSpendingTrend(bills: BillingReminder[]): 'increasing' | 'decreasing' | 'stable' {
  // Get bills from last 3 months
  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);

  const recentBills = bills.filter((b) => {
    const dueDate = new Date(b.due_date);
    return dueDate >= threeMonthsAgo;
  });

  if (recentBills.length < 6) {
    return 'stable'; // Not enough data
  }

  // Group by month
  const monthlyTotals: Record<string, number> = {};
  recentBills.forEach((bill) => {
    const month = new Date(bill.due_date).toISOString().slice(0, 7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(bill.amount);
  });

  const months = Object.keys(monthlyTotals).sort();
  if (months.length < 2) {
    return 'stable';
  }

  // Compare first and last month
  const firstMonthTotal = monthlyTotals[months[0]];
  const lastMonthTotal = monthlyTotals[months[months.length - 1]];

  const percentageChange = ((lastMonthTotal - firstMonthTotal) / firstMonthTotal) * 100;

  if (percentageChange > 10) {
    return 'increasing';
  } else if (percentageChange < -10) {
    return 'decreasing';
  } else {
    return 'stable';
  }
}

/**
 * Get priority suggestions (top 3 most important)
 */
export function getPrioritySuggestions(bills: BillingReminder[]): BillingSuggestion[] {
  const suggestions: BillingSuggestion[] = [];

  // High priority: Overdue bills
  const overdueBills = bills.filter((b) => b.status === 'overdue');
  if (overdueBills.length > 0) {
    suggestions.push({
      type: 'warning',
      message: `${overdueBills.length} overdue bill${overdueBills.length > 1 ? 's' : ''} - Pay immediately to avoid penalties`,
      priority: 'high',
    });
  }

  // Medium priority: Bills due in 3 days
  const today = new Date();
  const urgentBills = bills.filter((b) => {
    if (b.status !== 'pending') return false;
    const dueDate = new Date(b.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysUntilDue > 0 && daysUntilDue <= 3;
  });

  if (urgentBills.length > 0) {
    suggestions.push({
      type: 'action',
      message: `${urgentBills.length} bill${urgentBills.length > 1 ? 's' : ''} due within 3 days - Take action now`,
      priority: 'high',
    });
  }

  // Low priority: Optimization tips
  const monthlyBills = bills.filter((b) => b.frequency === 'monthly');
  if (monthlyBills.length >= 5) {
    suggestions.push({
      type: 'tip',
      message: 'Review your subscriptions - You might be able to save by bundling or canceling unused services',
      priority: 'low',
    });
  }

  return suggestions.slice(0, 3); // Return top 3
}

/**
 * Calculate savings potential
 */
export function calculateSavingsPotential(bills: BillingReminder[]): number {
  // Identify potential savings from subscriptions and recurring bills
  const subscriptions = bills.filter(
    (b) =>
      b.category === 'ott_subscription' ||
      b.category === 'mobile_recharge' ||
      b.category === 'internet'
  );

  // Assume 20% potential savings from optimization
  const totalSubscriptionCost = subscriptions.reduce((sum, b) => sum + Number(b.amount), 0);
  return totalSubscriptionCost * 0.2;
}

