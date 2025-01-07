import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import type {Habit} from '../types/habit';
import {habitsApi} from '../services/api';

// Helper function to transform API habit to our Habit type
const transformHabit = (apiHabit: any): Habit => {
  console.log('Transforming habit:', apiHabit);
  return {
    ...apiHabit,
    id: apiHabit._id || apiHabit.id,
    time_of_day: apiHabit.time_of_day || '',
    scheduled_time: apiHabit.scheduled_time || '',
    completed_dates: apiHabit.completed_dates || [],
    current_streak: apiHabit.current_streak || 0,
    longest_streak: apiHabit.longest_streak || 0,
    created_at: new Date(apiHabit.created_at),
    is_completed: apiHabit.is_completed || false
  };
};

interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  loadHabits: () => Promise<void>;
  addHabit: (habitData: Partial<Habit>) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  lastUpdate: number;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({children}: {children: React.ReactNode}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const loadHabits = async () => {
    try {
      console.log('Loading habits...');
      setLoading(true);
      const response = await habitsApi.getTodayHabits();
      if (response.status === 'success') {
        const transformedHabits = response.data.map(transformHabit).reverse();
        console.log('Loaded habits:', transformedHabits);
        setHabits(transformedHabits);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
      setError('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habitData: Partial<Habit>) => {
    try {
      console.log('Adding new habit:', habitData);
      setLoading(true);
      const response = await habitsApi.createHabit(habitData);
      if (response.status === 'success') {
        const newHabit = transformHabit(response.data);
        console.log('New habit created:', newHabit);
        
        // First update local state - add new habit to the beginning
        setHabits(prev => {
          const updated = [newHabit, ...prev];
          console.log('Updated habits locally:', updated);
          return updated;
        });

        // Then trigger a full reload and calendar update
        setTimeout(async () => {
          const response = await habitsApi.getTodayHabits();
          if (response.status === 'success') {
            const transformedHabits = response.data.map(transformHabit).reverse();
            setHabits(transformedHabits);
            setLastUpdate(Date.now());
            console.log('Calendar update triggered');
          }
        }, 0); //RELOAD DELAY TIME
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    try {
      if (!habitId) {
        throw new Error('Habit ID is required');
      }

      console.log('Updating habit:', { habitId, updates });
      const response = await habitsApi.updateHabit(habitId, updates);
      
      if (response.status === 'success') {
        setHabits(prev => 
          prev.map(habit => 
            habit.id === habitId ? transformHabit(response.data) : habit
          )
        );
        setLastUpdate(Date.now());
        console.log('Habit updated successfully:', response.data);
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      console.log('Deleting habit:', { habitId });
      if (!habitId) {
        throw new Error('Habit ID is required');
      }

      // First update local state optimistically
      setHabits(prev => {
        const updated = prev.filter(habit => habit.id !== habitId);
        console.log('Updated habits locally:', updated);
        return updated;
      });

      // Then make API call
      await habitsApi.deleteHabit(habitId);
      
      // Reload habits to ensure consistency
      await loadHabits();
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error deleting habit:', error);
      // Revert on error
      await loadHabits();
      throw error;
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    try {
      const response = await habitsApi.toggleHabit(habitId, date);
      if (response.status === 'success') {
        setHabits(prev => 
          prev.map(habit => 
            habit.id === habitId ? transformHabit(response.data) : habit
          )
        );
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      throw error;
    }
  };

  // Initial load only
  useEffect(() => {
    loadHabits();
  }, []); // Remove lastUpdate dependency

  const contextValue = {
    habits,
    loading,
    error,
    fetchHabits: loadHabits,
    toggleHabitCompletion,
    loadHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    lastUpdate,
  };

  console.log('HabitProvider rendering with:', { 
    habitCount: habits.length, 
    loading, 
    lastUpdate 
  });

  return (
    <HabitContext.Provider value={contextValue}>
      {children}
    </HabitContext.Provider>
  );
}

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}; 