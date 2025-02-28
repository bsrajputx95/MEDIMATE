import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MedicationReminder } from '@/types/medication';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface ReminderSchedule {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  days: string[];
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
        sound: 'default',
      });
    }

    return true;
  }

  async scheduleMedicationReminder(reminder: ReminderSchedule): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      // Cancel existing notifications for this reminder
      await this.cancelReminder(reminder.id);

      if (!reminder.enabled) {
        return null;
      }

      const [hours, minutes] = reminder.time.split(':').map(Number);
      const dayMap: Record<string, number> = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
      };

      const notificationIds: string[] = [];

      for (const day of reminder.days) {
        const weekday = dayMap[day];
        
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '💊 Medication Reminder',
            body: `Time to take ${reminder.medicationName}${reminder.dosage ? ` (${reminder.dosage})` : ''}`,
            data: {
              type: 'medication',
              medicationId: reminder.medicationId,
              reminderId: reminder.id,
            },
            sound: reminder.soundEnabled,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: weekday + 1, // Expo uses 1-7 for weekdays
            hour: hours,
            minute: minutes,
          },
        });

        notificationIds.push(notificationId);
      }

      // Store the notification IDs for later cancellation
      console.log(`Scheduled ${notificationIds.length} notifications for ${reminder.medicationName}`);
      return notificationIds.join(',');
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      return null;
    }
  }

  async cancelReminder(reminderId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.reminderId === reminderId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling reminder:', error);
    }
  }

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async sendTestNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Notification',
        body: 'This is a test notification from MediMate',
        sound: true,
      },
      trigger: {
        seconds: 2,
      },
    });
  }

  // Handle notification received while app is in foreground
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Handle notification tapped
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Calculate next reminder time
  getNextReminderTime(reminder: ReminderSchedule): Date | null {
    if (!reminder.enabled) return null;

    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const dayMap: Record<string, number> = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    };

    let nextDate: Date | null = null;

    for (const day of reminder.days) {
      const targetDay = dayMap[day];
      const candidate = new Date(now);
      candidate.setHours(hours, minutes, 0, 0);

      // Find the next occurrence of this day
      const currentDay = now.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7;
      candidate.setDate(now.getDate() + daysUntil);

      // If it's today but the time has passed, move to next week
      if (daysUntil === 0 && (hours < now.getHours() || 
          (hours === now.getHours() && minutes <= now.getMinutes()))) {
        candidate.setDate(candidate.getDate() + 7);
      }

      if (!nextDate || candidate < nextDate) {
        nextDate = candidate;
      }
    }

    return nextDate;
  }

  // Format time until next reminder
  formatTimeUntil(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
      return `in ${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      return `in ${days} day${days !== 1 ? 's' : ''}`;
    }
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;
