import { PushNotifications } from '@capacitor/push-notifications';
import { mobileService } from './mobile.service';
import { supabase } from '@/integrations/supabase/client';

class NotificationService {
  private initialized = false;

  async initialize() {
    if (!mobileService.isMobile() || this.initialized) return;

    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }

      // Register with APNs / FCM
      await PushNotifications.register();

      // Listen for registration
      await PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token:', token.value);
        await this.savePushToken(token.value);
      });

      // Handle errors
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // Handle incoming notifications
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        mobileService.hapticSuccess();
      });

      // Handle notification tap
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async savePushToken(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save token to user profile
      await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          push_token: token,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }

  // Schedule local notification (for reminders)
  async scheduleStreakReminder(hour: number = 9, minute: number = 0) {
    if (!mobileService.isMobile()) return;

    // Note: For local scheduled notifications, you'd typically use a plugin like
    // @capacitor/local-notifications. For now, we'll set up the infrastructure.
    console.log(`Streak reminder would be scheduled for ${hour}:${minute}`);
  }

  async cancelAllNotifications() {
    if (!mobileService.isMobile()) return;

    try {
      await PushNotifications.removeAllDeliveredNotifications();
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
