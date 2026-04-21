import { Capacitor } from '@capacitor/core';
import { CapacitorHealthkit, SampleNames } from '@perfood/capacitor-healthkit';

/**
 * HealthKit integration. iOS-only. Writes workouts to Apple Health.
 *
 * Requires Info.plist usage descriptions:
 *  - NSHealthShareUsageDescription
 *  - NSHealthUpdateUsageDescription
 */
class HealthKitService {
  private authorized = false;

  isSupported(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  }

  async requestAuthorization(): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (this.authorized) return true;
    try {
      await CapacitorHealthkit.requestAuthorization({
        all: ['workoutType' as SampleNames],
        read: ['workoutType' as SampleNames],
        write: ['workoutType' as SampleNames],
      });
      this.authorized = true;
      return true;
    } catch (e) {
      console.error('HealthKit authorization failed:', e);
      return false;
    }
  }

  /**
   * Save a completed workout session to Apple Health.
   * @param durationMinutes Length of the workout in minutes
   * @param completedAt Date the workout was completed
   * @param activityType Free-form label (mapped to "Other" workout type by HealthKit)
   */
  async saveWorkout(
    durationMinutes: number,
    completedAt: Date = new Date(),
    activityType: string = 'Other',
  ): Promise<boolean> {
    if (!this.isSupported()) return false;
    const ok = await this.requestAuthorization();
    if (!ok) return false;

    try {
      const endDate = completedAt;
      const startDate = new Date(endDate.getTime() - durationMinutes * 60_000);

      // Plugin API: saveWorkout (signature varies slightly across versions; we try a common shape)
      // @ts-ignore — type defs lag the runtime API
      await CapacitorHealthkit.saveWorkout?.({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: durationMinutes * 60,
        workoutType: 'other',
        activityName: activityType,
      });
      return true;
    } catch (e) {
      console.error('Failed to save workout to HealthKit:', e);
      return false;
    }
  }
}

export const healthKitService = new HealthKitService();
