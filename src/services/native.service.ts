import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { PushNotifications } from '@capacitor/push-notifications';

class NativeService {
  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Running in web mode');
      return;
    }

    try {
      // Set initial status bar style based on theme
      const isDark = window.document.documentElement.classList.contains('dark');
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      
      // Request push notification permissions
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
      }
      
      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
        if (isActive) {
          // App became active - refresh data
          window.dispatchEvent(new Event('app-resumed'));
        }
      });
      
      // Handle push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
      });

      console.log('Native features initialized successfully');
    } catch (error) {
      console.error('Error initializing native features:', error);
    }
  }

  async setStatusBarStyle(style: 'light' | 'dark'): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await StatusBar.setStyle({ 
        style: style === 'light' ? Style.Light : Style.Dark 
      });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  }

  async hideStatusBar(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Error hiding status bar:', error);
    }
  }

  async showStatusBar(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Error showing status bar:', error);
    }
  }
}

export const nativeService = new NativeService();
