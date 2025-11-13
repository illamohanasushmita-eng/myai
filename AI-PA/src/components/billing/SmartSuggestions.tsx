'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BillingInsights } from '@/lib/types/database';
import { Lightbulb, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle } from 'lucide-react';

interface SmartSuggestionsProps {
  userId: string;
  refreshTrigger?: number;
}

export function SmartSuggestions({ userId, refreshTrigger }: SmartSuggestionsProps) {
  const [insights, setInsights] = useState<BillingInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      console.log('📩 Fetching billing insights for user:', userId);

      const response = await fetch(`/api/billing/insights?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch insights');
      }

      console.log('✅ Billing insights fetched:', data.data);
      setInsights(data.data);
    } catch (error) {
      console.error('❌ Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchInsights();
    }
  }, [userId, refreshTrigger]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'Increasing';
      case 'decreasing':
        return 'Decreasing';
      default:
        return 'Stable';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Billing Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your billing patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Monthly Bills */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Monthly Bills</p>
              <p className="text-2xl font-bold">₹{insights.total_amount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {insights.total_monthly_bills} recurring bills
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(insights.spending_trend)}
              <span className="text-sm font-medium">{getTrendLabel(insights.spending_trend)}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {insights.upcoming_bills_count}
              </p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {insights.overdue_bills_count}
              </p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {insights.paid_this_month}
              </p>
              <p className="text-xs text-muted-foreground">Paid</p>
            </div>
          </div>

          {/* Highest Bill */}
          {insights.highest_bill && (
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Highest Bill</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{insights.highest_bill.bill_name}</span>
                <span className="text-lg font-bold">
                  ₹{Number(insights.highest_bill.amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions Card */}
      {insights.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Smart Suggestions
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your billing patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg"
              >
                <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{suggestion}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {Object.keys(insights.bills_by_category).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Breakdown of your bills by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(insights.bills_by_category)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = (amount / insights.total_amount) * 100;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{category.replace('_', ' ')}</span>
                        <span className="font-semibold">₹{amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

