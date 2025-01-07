import type {Habit} from '../types/habit';

export const ValidationService = {
  isValidHabit(habit: unknown): habit is Habit {
    if (!habit || typeof habit !== 'object') return false;

    const h = habit as Partial<Habit>;
    
    return (
      typeof h.id === 'string' &&
      typeof h.name === 'string' &&
      h.name.length > 0 &&
      typeof h.description === 'string' &&
      ['daily', 'weekly', 'monthly'].includes(h.frequency as string) &&
      ['morning', 'afternoon', 'evening'].includes(h.timeOfDay as string) &&
      typeof h.schedule === 'object' &&
      typeof h.schedule?.time === 'string' &&
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(h.schedule.time) &&
      Array.isArray(h.completedDates) &&
      h.completedDates.every(date => typeof date === 'string' && !isNaN(Date.parse(date)))
    );
  },

  validateHabits(habits: unknown[]): Habit[] {
    return habits.filter(this.isValidHabit);
  },
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUsername = (username: string): boolean => {
  // Allow letters, numbers, underscores, and hyphens, 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateFullName = (fullName: string): boolean => {
  // Allow letters, spaces, and hyphens, at least 2 characters
  const fullNameRegex = /^[a-zA-Z\s-]{2,}$/;
  return fullNameRegex.test(fullName);
}; 