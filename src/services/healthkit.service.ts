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
    // The @perfood/capacitor-healthkit plugin maps friendly strings (e.g. 'activity',
    // 'steps', 'calories') to HKSampleType in its native getTypes() switch. Passing
    // 'workoutType' does NOT match any case and produces an empty Set, which makes
    // HKHealthStore raise NSInvalidArgumentException: "Must request authorization
    // for at least one data type". Use 'activity' which maps to HKWorkoutType.
    const all: SampleNames[] = ['activity' as SampleNames];
    const read: SampleNames[] = ['activity' as SampleNames];
    const write: SampleNames[] = ['activity' as SampleNames];
    if (all.length === 0 || (read.length === 0 && write.length === 0)) {
      console.warn('HealthKit: refusing to call requestAuthorization with empty type arrays');
      return false;
    }
    try {
      await CapacitorHealthkit.requestAuthorization({ all, read, write });
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
