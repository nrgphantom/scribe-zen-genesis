
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface SubscriptionData {
  id: string;
  subscribed: boolean;
  subscription_tier: string;
  chapters_generated: number;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const canGenerateChapter = () => {
    if (!subscription) return false;
    if (subscription.subscribed) return true;
    return subscription.chapters_generated < 5;
  };

  const remainingChapters = () => {
    if (!subscription) return 0;
    if (subscription.subscribed) return Infinity;
    return Math.max(0, 5 - subscription.chapters_generated);
  };

  const updateChapterCount = async () => {
    if (!user || !subscription) return;

    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          chapters_generated: subscription.chapters_generated + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating chapter count:', error);
      } else {
        setSubscription(prev => prev ? {
          ...prev,
          chapters_generated: prev.chapters_generated + 1
        } : null);
      }
    } catch (error) {
      console.error('Error updating chapter count:', error);
    }
  };

  return {
    subscription,
    loading,
    canGenerateChapter,
    remainingChapters,
    updateChapterCount
  };
};
