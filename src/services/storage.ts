import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Habit} from '../types/habit';

const HABITS_KEY = '@habits';

export const StorageService = {
  async getHabits(): Promise<Habit[]> {
    try {
      const data = await AsyncStorage.getItem(HABITS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  },

  async saveHabit(habit: Habit): Promise<boolean> {
    try {
      const habits = await this.getHabits();
      const updatedHabits = [...habits, habit];
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
      return true;
    } catch (error) {
      console.error('Error saving habit:', error);
      return false;
    }
  },

  async updateHabit(habit: Habit): Promise<boolean> {
    try {
      const habits = await this.getHabits();
      const updatedHabits = habits.map(h => h.id === habit.id ? habit : h);
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
      return true;
    } catch (error) {
      console.error('Error updating habit:', error);
      return false;
    }
  },

  async deleteHabit(habitId: string): Promise<boolean> {
    try {
      const habits = await this.getHabits();
      const updatedHabits = habits.filter(h => h.id !== habitId);
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
      return true;
    } catch (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
  },
}; 