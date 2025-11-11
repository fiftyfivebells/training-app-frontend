import type { RunResponse } from '@domains/runs/api/runsApi';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface DashboardStats {
  weeklyRuns: number;
  weeklyDistance: number;
  currentStreak: number;
  totalRuns: number;
}

export interface DashboardActivity {
  id: string;
  type: 'run' | 'block_started';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
}

const defaultStats: DashboardStats = {
  weeklyRuns: 0,
  weeklyDistance: 0,
  currentStreak: 0,
  totalRuns: 0,
};

export function calculateDashboardStats(runs?: RunResponse[]): DashboardStats {
  if (!runs || runs.length === 0) {
    return defaultStats;
  }

  const today = startOfDay(new Date());
  const weekAgo = new Date(today.getTime() - 7 * DAY_IN_MS);

  let weeklyRuns = 0;
  let weeklyDistanceMeters = 0;
  let currentStreak = 0;

  const sortedRuns = [...runs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streakCursor = today;

  for (const run of sortedRuns) {
    const runDate = startOfDay(new Date(run.date));

    if (runDate >= weekAgo) {
      weeklyRuns += 1;
      weeklyDistanceMeters += run.distanceMeters;
    }

    const diffDays = Math.floor((streakCursor.getTime() - runDate.getTime()) / DAY_IN_MS);

    if (diffDays === 0 || diffDays === 1) {
      currentStreak += 1;
      streakCursor = runDate;
    } else if (diffDays > 1) {
      break;
    }
  }

  return {
    weeklyRuns,
    weeklyDistance: Math.round((weeklyDistanceMeters / 1000) * 10) / 10,
    currentStreak,
    totalRuns: runs.length,
  };
}

export function formatRunsAsActivities(
  runs?: RunResponse[],
  options?: { limit?: number }
): DashboardActivity[] {
  if (!runs || runs.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 5;

  return [...runs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map((run) => {
      const distanceKm = (run.distanceMeters / 1000).toFixed(1);
      const durationMin = Math.floor(run.durationSeconds / 60);

      return {
        id: run.id,
        type: 'run' as const,
        title: run.workoutName ?? 'Run',
        subtitle: `${distanceKm} km • ${durationMin} min`,
        timestamp: formatRelativeTime(run.date),
        icon: '🏃',
      };
    });
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes < 1 ? 'Just now' : `${diffMinutes} min ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
