import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const REMINDER_ID = 1001;

class LocalNotificationsService {
  isSupported() {
    return Capacitor.isNativePlatform();
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      let perm = await LocalNotifications.checkPermissions();
      if (perm.display === 'prompt' || perm.display === 'prompt-with-rationale') {
        perm = await LocalNotifications.requestPermissions();
      }
      return perm.display === 'granted';
    } catch (e) {
      console.error('Local notification permission error:', e);
      return false;
    }
  }

  /**
   * Schedule a daily workout reminder at the given local hour:minute.
   */
  async scheduleDailyReminder(hour: number, minute: number, body?: string): Promise<boolean> {
    if (!this.isSupported()) return false;

    const granted = await this.requestPermission();
    if (!granted) return false;

    try {
      // Cancel any existing reminder first
      await this.cancelDailyReminder();

      await LocalNotifications.schedule({
        notifications: [
          {
            id: REMINDER_ID,
            title: 'Time to move',
            body: body ?? 'Keep your streak going. Even 10 minutes counts.',
            schedule: {
              on: { hour, minute },
              allowWhileIdle: true,
              repeats: true,
            },
            smallIcon: 'ic_stat_icon_config_sample',
          },
        ],
      });
      return true;
    } catch (e) {
      console.error('Failed to schedule reminder:', e);
      return false;
    }
  }

  async cancelDailyReminder() {
    if (!this.isSupported()) return;
    try {
      await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    } catch (e) {
      console.error('Failed to cancel reminder:', e);
    }
  }

  async getPending() {
    if (!this.isSupported()) return [];
    try {
      const res = await LocalNotifications.getPending();
      return res.notifications;
    } catch {
      return [];
    }
  }
}

export const localNotificationsService = new LocalNotificationsService();
