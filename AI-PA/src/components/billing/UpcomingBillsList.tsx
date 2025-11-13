'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BillingReminderWithDays } from '@/lib/types/database';
import { Calendar, CheckCircle2, Clock, IndianRupee, Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UpcomingBillsListProps {
  userId: string;
  refreshTrigger?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  phone_emi: '📱',
  electricity: '⚡',
  water: '💧',
  internet: '🌐',
  gas: '🔥',
  home_loan: '🏠',
  vehicle_emi: '🚗',
  ott_subscription: '📺',
  insurance: '🛡️',
  credit_card: '💳',
  mobile_recharge: '📞',
  rent: '🏢',
  other: '📋',
};

export function UpcomingBillsList({ userId, refreshTrigger }: UpcomingBillsListProps) {
  const { toast } = useToast();
  const [bills, setBills] = useState<BillingReminderWithDays[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      console.log('📩 Fetching upcoming bills for user:', userId);

      const response = await fetch(`/api/billing/list?userId=${userId}&upcoming=true`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bills');
      }

      console.log(`✅ Fetched ${data.count} upcoming bills`);
      setBills(data.data);
    } catch (error) {
      console.error('❌ Error fetching bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bills',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBills();
    }
  }, [userId, refreshTrigger]);

  const handleMarkAsPaid = async (billId: string, billName: string) => {
    try {
      setMarkingPaid(billId);
      console.log('📩 Marking bill as paid:', billId);

      const response = await fetch('/api/billing/mark-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark bill as paid');
      }

      console.log('✅ Bill marked as paid');

      toast({
        title: 'Bill Paid!',
        description: `${billName} has been marked as paid`,
      });

      // Speak confirmation using Lara's TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Got it, I've marked your ${billName} as paid.`
        );
        window.speechSynthesis.speak(utterance);
      }

      // Refresh the list
      fetchBills();
    } catch (error) {
      console.error('❌ Error marking bill as paid:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark bill as paid',
        variant: 'destructive',
      });
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleDelete = async (billId: string, billName: string) => {
    try {
      setDeleting(billId);
      console.log('📩 Deleting bill:', billId);

      const response = await fetch('/api/billing/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete bill');
      }

      console.log('✅ Bill deleted');

      toast({
        title: 'Bill Deleted',
        description: `${billName} has been removed`,
      });

      // Refresh the list
      fetchBills();
    } catch (error) {
      console.error('❌ Error deleting bill:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete bill',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'overdue':
        return 'bg-red-500 text-white';
      case 'urgent':
        return 'bg-orange-500 text-white';
      case 'soon':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-green-500 text-white';
    }
  };

  const getUrgencyLabel = (urgencyLevel: string, daysUntilDue: number) => {
    if (urgencyLevel === 'overdue') {
      return `${Math.abs(daysUntilDue)} days overdue`;
    }
    return `${daysUntilDue} days left`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No upcoming bills</p>
          <p className="text-sm text-muted-foreground">
            Add your first bill to get started with voice reminders
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <Card key={bill.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{CATEGORY_ICONS[bill.category] || '📋'}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{bill.bill_name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {bill.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold text-xl">₹{Number(bill.amount).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Due: {new Date(bill.due_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <Badge className={getUrgencyColor(bill.urgency_level)}>
                    <Clock className="h-3 w-3 mr-1" />
                    {getUrgencyLabel(bill.urgency_level, bill.days_until_due)}
                  </Badge>

                  <Badge variant="outline" className="capitalize">
                    {bill.frequency}
                  </Badge>
                </div>

                {bill.notes && (
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Note: {bill.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => handleMarkAsPaid(bill.id, bill.bill_name)}
                  disabled={markingPaid === bill.id}
                  className="whitespace-nowrap"
                >
                  {markingPaid === bill.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Paid
                    </>
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deleting === bill.id}
                    >
                      {deleting === bill.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {bill.bill_name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(bill.id, bill.bill_name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

