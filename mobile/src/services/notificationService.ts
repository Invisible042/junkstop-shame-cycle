import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'JunkStop Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8B5CF6',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleDailyReminder(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Stay Strong Today! 💪",
          body: "How are you feeling? Remember your goals and make healthy choices.",
        },
        trigger: {
          hour: 10,
          minute: 0,
          repeats: true,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Evening Check-in",
          body: "How did your day go? Log any slip-ups to stay accountable.",
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  async scheduleStreakCelebration(streak: number): Promise<void> {
    if (streak === 0) return;

    const milestones = [1, 3, 7, 14, 30, 60, 90, 365];
    if (!milestones.includes(streak)) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${streak} Day Streak! 🔥`,
          body: streak === 1 
            ? "Great start! You're building momentum."
            : streak < 7
            ? `${streak} days clean! You're forming a habit.`
            : streak < 30
            ? `${streak} days! You're mastering self-control.`
            : `${streak} days! You're a habit transformation champion!`,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error scheduling streak celebration:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();