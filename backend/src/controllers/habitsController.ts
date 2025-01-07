import { Habit, IHabit } from '../models/habit';
import { logger } from '../utils/logger';

interface HabitData {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day?: string;
  scheduled_time?: string;
}

export const habitsController = {
  getHabits: async (userId: string): Promise<IHabit[]> => {
    logger.debug('Getting habits for user', { userId });
    return await Habit.find({ user_id: userId });
  },

  createHabit: async (userId: string, habitData: HabitData): Promise<IHabit> => {
    logger.debug('Creating habit', { userId, habitData });
    const habit = new Habit({
      ...habitData,
      user_id: userId,
      completed_dates: []
    });
    return await habit.save();
  },

  toggleHabit: async (habitId: string, date: string): Promise<IHabit> => {
    logger.debug('Toggling habit', { habitId, date });
    const habit = await Habit.findById(habitId);
    if (!habit) {
      logger.error('Habit not found', { habitId });
      throw new Error('Habit not found');
    }

    const completed = habit.completed_dates?.includes(date);
    if (completed) {
      habit.completed_dates = habit.completed_dates?.filter((d: string) => d !== date);
    } else {
      habit.completed_dates = [...(habit.completed_dates || []), date];
    }

    return await habit.save();
  },

  updateHabit: async (habitId: string, updates: Partial<HabitData>): Promise<IHabit | null> => {
    try {
      logger.debug('Updating habit:', { habitId, updates });
      
      if (!habitId) {
        throw new Error('Habit ID is required');
      }

      const habit = await Habit.findById(habitId);
      if (!habit) {
        logger.error('Habit not found:', { habitId });
        throw new Error('Habit not found');
      }

      // Only update allowed fields
      const allowedUpdates = {
        name: updates.name,
        description: updates.description,
        frequency: updates.frequency,
        time_of_day: updates.time_of_day,
        scheduled_time: updates.scheduled_time,
      };

      const updatedHabit = await Habit.findByIdAndUpdate(
        habitId,
        { $set: allowedUpdates },
        { new: true, runValidators: true }
      );

      logger.debug('Habit updated:', updatedHabit);
      return updatedHabit;
    } catch (error) {
      logger.error('Error updating habit:', error);
      throw error;
    }
  },

  deleteHabit: async (habitId: string): Promise<void> => {
    try {
      logger.debug('Deleting habit', { habitId });
      
      if (!habitId) {
        throw new Error('Habit ID is required');
      }

      const habit = await Habit.findById(habitId);
      if (!habit) {
        logger.error('Habit not found for deletion:', { habitId });
        throw new Error('Habit not found');
      }

      await Habit.findByIdAndDelete(habitId);
      logger.debug('Habit deleted successfully:', { habitId });
    } catch (error) {
      logger.error('Error deleting habit:', error);
      throw error;
    }
  }
}; 