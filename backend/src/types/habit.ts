export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  scheduledTime: string; // HH:mm format
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedDate: string; // YYYY-MM-DD format
  completedAt: Date;
}

export interface HabitStreak {
  id: string;
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD format
  updatedAt: Date;
} 