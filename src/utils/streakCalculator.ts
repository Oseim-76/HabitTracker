import {
  isSameDay,
  isYesterday,
  differenceInDays,
  parseISO,
  startOfDay,
} from 'date-fns';

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sortedDates = [...completedDates]
    .map(date => parseISO(date))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = startOfDay(new Date());
  let currentStreak = 0;
  let previousDate = today;

  // Check if completed today
  const completedToday = sortedDates.some(date => 
    isSameDay(date, today)
  );

  if (!completedToday && !sortedDates.some(date => isYesterday(date))) {
    return 0;
  }

  for (const date of sortedDates) {
    const diff = differenceInDays(previousDate, date);
    
    if (diff <= 1) {
      currentStreak++;
      previousDate = date;
    } else {
      break;
    }
  }

  return currentStreak;
} 