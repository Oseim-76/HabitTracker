import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: string;
  time_of_day: string;
  scheduled_time: string;
  created_at: Date;
  is_completed?: boolean;
  current_streak?: number;
  longest_streak?: number;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_date: Date;
  created_at: Date;
}

export interface HabitStreak {
  id: string;
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  updated_at: Date;
} 