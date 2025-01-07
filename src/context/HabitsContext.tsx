import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format, parseISO} from 'date-fns';
import type {Habit} from '../types/habit';

interface HabitsContextType {
  habits: Habit[];
  loading: boolean;
  refreshHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('habits');
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (updatedHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const refreshHabits = async () => {
    setLoading(true);
    await loadHabits();
  };

  const addHabit = async (habit: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Math.random().toString(36).substr(2, 9),
      completedDates: [],
    };
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    await saveHabits(updatedHabits);
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? {...habit, ...updates} : habit,
    );
    setHabits(updatedHabits);
    await saveHabits(updatedHabits);
  };

  const deleteHabit = async (id: string) => {
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    setHabits(updatedHabits);
    await saveHabits(updatedHabits);
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(date);
        const completedDates = isCompleted
          ? habit.completedDates.filter((d) => d !== date)
          : [...habit.completedDates, date];
        return {...habit, completedDates};
      }
      return habit;
    });
    setHabits(updatedHabits);
    await saveHabits(updatedHabits);
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        refreshHabits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
      }}>
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
}; 