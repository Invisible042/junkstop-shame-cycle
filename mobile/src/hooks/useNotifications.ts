import { useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useData } from '../context/DataContext';

export const useNotifications = () => {
  const { currentStreak } = useData();

  useEffect(() => {
    // Celebrate streak milestones
    if (currentStreak > 0) {
      notificationService.scheduleStreakCelebration(currentStreak);
    }
  }, [currentStreak]);

  return {
    requestPermissions: notificationService.requestPermissions,
    scheduleDailyReminder: notificationService.scheduleDailyReminder,
    cancelAllNotifications: notificationService.cancelAllNotifications,
  };
};