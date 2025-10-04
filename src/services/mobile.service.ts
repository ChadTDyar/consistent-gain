import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class MobileService {
  // Check if running on mobile
  isMobile(): boolean {
    return Capacitor.isNativePlatform();
  }

  // Get platform
  getPlatform(): 'ios' | 'android' | 'web' {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  }

  // Haptic feedback for UI interactions
  async hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!this.isMobile()) return;
    
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    };

    try {
      await Haptics.impact({ style: styleMap[style] });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }

  // Success haptic
  async hapticSuccess() {
    if (!this.isMobile()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }

  // Warning haptic
  async hapticWarning() {
    if (!this.isMobile()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }

  // Error haptic
  async hapticError() {
    if (!this.isMobile()) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }

  // Preferences (mobile-optimized storage)
  async setPreference(key: string, value: string): Promise<void> {
    if (this.isMobile()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  async getPreference(key: string): Promise<string | null> {
    if (this.isMobile()) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  }

  async removePreference(key: string): Promise<void> {
    if (this.isMobile()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clearPreferences(): Promise<void> {
    if (this.isMobile()) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }
}

export const mobileService = new MobileService();
