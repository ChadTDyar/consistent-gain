import { supabase } from "@/integrations/supabase/client";

interface ActivityLog {
  completed_at: string;
}

/**
 * Calculate the current streak from activity logs
 * A streak is consecutive days with at least one activity
 */
export const calculateStreak = (logs: ActivityLog[]): number => {
  if (!logs || logs.length === 0) return 0;

  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  // Get unique dates
  const uniqueDates = Array.from(
    new Set(sortedLogs.map(log => log.completed_at))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentDate = new Date(uniqueDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  // Streak must start from today or yesterday
  if (mostRecentDate.getTime() !== today.getTime() && 
      mostRecentDate.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(mostRecentDate);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i]);
    prevDate.setHours(0, 0, 0, 0);
    
    currentDate.setDate(currentDate.getDate() - 1);

    if (prevDate.getTime() === currentDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get all activity logs for the current user
 */
export const getUserActivityLogs = async (): Promise<ActivityLog[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("activity_logs")
    .select("completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }

  return data || [];
};

/**
 * Calculate days since last activity
 */
export const getDaysSinceLastActivity = (logs: ActivityLog[]): number => {
  if (!logs || logs.length === 0) return 999;

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  const lastActivityDate = new Date(sortedLogs[0].completed_at);
  lastActivityDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastActivityDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
