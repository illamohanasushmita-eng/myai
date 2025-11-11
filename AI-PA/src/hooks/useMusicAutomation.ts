'use client';

import { useState, useCallback, useEffect } from 'react';

export interface AutomationRule {
  id: string;
  trigger_type: 'night' | 'travel' | 'mood';
  playlist_query: string;
  is_active: boolean;
}

export interface AutomationTrigger {
  triggered: boolean;
  triggerType: string;
  rule: {
    id: string;
    playlistQuery: string;
  };
  recommendations: any[];
}

export function useMusicAutomation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [lastTrigger, setLastTrigger] = useState<AutomationTrigger | null>(null);

  const fetchRules = useCallback(async (userId: string): Promise<AutomationRule[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/automation/rules?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch automation rules');
      }

      const data = await response.json();
      setRules(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createRule = useCallback(
    async (
      userId: string,
      triggerType: 'night' | 'travel' | 'mood',
      playlistQuery: string
    ): Promise<AutomationRule | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/automation/rules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            triggerType,
            playlistQuery,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create automation rule');
        }

        const data = await response.json();
        setRules((prev) => [...prev, data]);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateRule = useCallback(
    async (
      ruleId: string,
      isActive?: boolean,
      playlistQuery?: string
    ): Promise<AutomationRule | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/automation/rules', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ruleId,
            isActive,
            playlistQuery,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update automation rule');
        }

        const data = await response.json();
        setRules((prev) =>
          prev.map((rule) => (rule.id === ruleId ? data : rule))
        );
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteRule = useCallback(async (ruleId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/automation/rules?ruleId=${ruleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete automation rule');
      }

      setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerAutomation = useCallback(
    async (userId: string, triggerType?: string): Promise<AutomationTrigger | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/automation/trigger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            triggerType,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to trigger automation');
        }

        const data = await response.json();
        setLastTrigger(data);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    rules,
    loading,
    error,
    lastTrigger,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    triggerAutomation,
  };
}

