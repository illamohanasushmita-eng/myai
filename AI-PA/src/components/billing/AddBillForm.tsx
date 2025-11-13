'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BillingCategory, BillingFrequency } from '@/lib/types/database';
import { Loader2, Plus } from 'lucide-react';

interface AddBillFormProps {
  userId: string;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS: { value: BillingCategory; label: string; icon: string }[] = [
  { value: 'phone_emi', label: 'Phone EMI', icon: '📱' },
  { value: 'electricity', label: 'Electricity Bill', icon: '⚡' },
  { value: 'water', label: 'Water Bill', icon: '💧' },
  { value: 'internet', label: 'Wi-Fi/Internet', icon: '🌐' },
  { value: 'gas', label: 'Gas Bill', icon: '🔥' },
  { value: 'home_loan', label: 'Home Loan EMI', icon: '🏠' },
  { value: 'vehicle_emi', label: 'Vehicle EMI', icon: '🚗' },
  { value: 'ott_subscription', label: 'OTT Subscription', icon: '📺' },
  { value: 'insurance', label: 'Insurance Premium', icon: '🛡️' },
  { value: 'credit_card', label: 'Credit Card Bill', icon: '💳' },
  { value: 'mobile_recharge', label: 'Mobile Recharge', icon: '📞' },
  { value: 'rent', label: 'Rent', icon: '🏢' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const FREQUENCY_OPTIONS: { value: BillingFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' },
];

export function AddBillForm({ userId, onSuccess }: AddBillFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [billName, setBillName] = useState('');
  const [category, setCategory] = useState<BillingCategory>('electricity');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly');
  const [reminderDays, setReminderDays] = useState('10');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!billName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Bill name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (!dueDate) {
      toast({
        title: 'Validation Error',
        description: 'Due date is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('📩 Submitting new bill:', { billName, category, amount, dueDate });

      const response = await fetch('/api/billing/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          bill_name: billName.trim(),
          category,
          amount: parseFloat(amount),
          currency: 'INR',
          due_date: dueDate,
          frequency,
          reminder_days: parseInt(reminderDays),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create bill');
      }

      console.log('✅ Bill created successfully:', data.data);

      toast({
        title: 'Success!',
        description: `${billName} has been added to your bills`,
      });

      // Reset form
      setBillName('');
      setAmount('');
      setDueDate('');
      setNotes('');
      setReminderDays('10');

      onSuccess?.();
    } catch (error) {
      console.error('❌ Error creating bill:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create bill',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Bill
        </CardTitle>
        <CardDescription>
          Track your monthly bills and get voice reminders from Lara
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bill Name */}
          <div className="space-y-2">
            <Label htmlFor="billName">Bill Name *</Label>
            <Input
              id="billName"
              placeholder="e.g., Electricity Bill"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as BillingCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="1200.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as BillingFrequency)}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reminder Days */}
          <div className="space-y-2">
            <Label htmlFor="reminderDays">Remind me (days before due)</Label>
            <Input
              id="reminderDays"
              type="number"
              min="0"
              max="30"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Bill...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Bill
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

