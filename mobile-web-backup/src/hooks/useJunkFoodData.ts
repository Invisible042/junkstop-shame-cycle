import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, uploadFile } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface JunkFoodLog {
  id: number;
  photo_url: string;
  food_type: string;
  guilt_rating: number;
  regret_rating: number;
  estimated_cost: number;
  estimated_calories: number;
  location?: string;
  created_at: string;
  ai_motivation?: string;
}

interface UserProfile {
  id: number;
  email: string;
  username: string;
  streak_count: number;
  best_streak: number;
  total_saved: number;
  avg_guilt_score: number;
  total_logs: number;
  created_at: string;
}

interface WeeklyAnalytics {
  total_logs: number;
  avg_guilt_score: number;
  avg_regret_score: number;
  total_cost: number;
  total_calories: number;
  daily_breakdown: Array<{
    date: string;
    count: number;
    avg_guilt: number;
    avg_regret: number;
    total_cost: number;
    total_calories: number;
  }>;
}

export const useUserProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ['/api/user/profile'],
    queryFn: () => apiRequest('/api/user/profile'),
  });
};

export const useJunkFoodLogs = (limit = 20, offset = 0) => {
  return useQuery<JunkFoodLog[]>({
    queryKey: ['/api/logs', limit, offset],
    queryFn: () => apiRequest(`/api/logs?limit=${limit}&offset=${offset}`),
  });
};

export const useWeeklyAnalytics = () => {
  return useQuery<WeeklyAnalytics>({
    queryKey: ['/api/analytics/weekly'],
    queryFn: () => apiRequest('/api/analytics/weekly'),
  });
};

export const useDailyInsight = () => {
  return useQuery<{ insight: string; generated_at: string }>({
    queryKey: ['/api/ai/daily-insight'],
    queryFn: () => apiRequest('/api/ai/daily-insight'),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCreateJunkFoodLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      photo: File;
      food_type: string;
      guilt_rating: number;
      regret_rating: number;
      estimated_cost?: number;
      location?: string;
    }) => {
      const formData = new FormData();
      formData.append('photo', data.photo);
      formData.append('food_type', data.food_type);
      formData.append('guilt_rating', data.guilt_rating.toString());
      formData.append('regret_rating', data.regret_rating.toString());
      if (data.estimated_cost) {
        formData.append('estimated_cost', data.estimated_cost.toString());
      }
      if (data.location) {
        formData.append('location', data.location);
      }

      return uploadFile('/api/logs', formData);
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/weekly'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/daily-insight'] });

      toast({
        title: "💔 STREAK BROKEN!",
        description: data.ai_motivation || "You can start fresh right now!",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log junk food",
        variant: "destructive",
      });
    },
  });
};

export const useIncrementStreak = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => apiRequest('/api/streak/increment', { method: 'POST' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      if (data.is_new_record) {
        toast({
          title: "🎉 NEW RECORD!",
          description: `Amazing! You've hit ${data.streak_count} days - your best streak yet!`,
        });
      } else {
        toast({
          title: "✨ Streak Updated!",
          description: `Great job! You're now at ${data.streak_count} days clean.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update streak",
        variant: "destructive",
      });
    },
  });
};

export const useChatWithAI = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      message: string;
      guilt_level?: number;
      regret_level?: number;
    }) => apiRequest('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
    },
  });
};