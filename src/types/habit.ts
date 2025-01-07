export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day: string;
  scheduled_time: string;
  completed_dates: string[];
  current_streak: number;
  longest_streak: number;
  created_at: Date;
  is_completed: boolean;
}

export interface HabitFormData {
  name: string;
  description?: string;
  frequency: string;
  timeOfDay: string;
  scheduledTime: string;
} 