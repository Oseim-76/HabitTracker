import { Response } from 'express';
import { AuthRequest } from '../types';
import { pool } from '../config/database';

// In-memory store for habits (temporary solution for testing)
let habits: any[] = [{
  id: 'i90t8v806',
  user_id: '1',
  name: 'Run',
  description: '',
  frequency: 'daily',
  time_of_day: 'morning',
  scheduled_time: '09:00',
  created_at: '2025-01-05T22:13:43.566Z',
  is_completed: false,
  current_streak: 0,
  longest_streak: 0
}];

export const getHabits = async (req: AuthRequest, res: Response) => {
  try {
    // Return habits for the current user
    const userHabits = habits.filter(habit => habit.user_id === req.user?.id);
    
    res.json({
      status: 'success',
      data: userHabits
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Error fetching habits' });
  }
};

export const createHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, frequency = 'daily', category = 'personal', scheduled_time = '09:00' } = req.body;
    
    console.log('Creating habit with params:', { name, category, scheduled_time }); // Debug log
    
    const habit = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: req.user?.id,
      name,
      description,
      frequency,
      category,
      scheduled_time,
      created_at: new Date().toISOString(),
      is_completed: false,
      current_streak: 0,
      longest_streak: 0
    };

    // Add to in-memory store
    habits.push(habit);

    res.json({
      status: 'success',
      data: habit
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Error creating habit' });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    // For testing, return dummy stats
    res.json({
      status: 'success',
      data: {
        total_habits: 0,
        completed_today: 0,
        current_streak: 0,
        longest_streak: 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};

export const updateHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find habit index
    const habitIndex = habits.findIndex(h => h.id === id && h.user_id === req.user?.id);
    
    if (habitIndex === -1) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Habit not found' 
      });
    }

    // Update habit
    habits[habitIndex] = {
      ...habits[habitIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    console.log('Updated habit:', habits[habitIndex]); // Debug log

    res.json({
      status: 'success',
      data: habits[habitIndex]
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Error updating habit' });
  }
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find and remove habit
    const habitIndex = habits.findIndex(h => h.id === id && h.user_id === req.user?.id);
    
    if (habitIndex === -1) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Habit not found' 
      });
    }

    habits.splice(habitIndex, 1);

    res.json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error deleting habit' 
    });
  }
}; 