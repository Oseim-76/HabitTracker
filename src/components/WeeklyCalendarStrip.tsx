import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  format,
  addDays,
  isSameDay,
  isToday,
  parseISO,
  isSameWeek,
  getDay,
} from 'date-fns';
import {colors, spacing, typography} from '../theme';
import type {Habit} from '../services/api';

interface Props {
  habits: Habit[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const ITEM_WIDTH = (Dimensions.get('window').width - spacing.md * 2) / 7;

export function CalendarStrip({habits, onDateSelect, selectedDate}: Props) {
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate next 31 days from today
    const nextDays = Array.from({length: 31}, (_, i) => addDays(new Date(), i));
    setDates(nextDays);
  }, []);

  const hasHabitOnDate = (date: Date) => {
    // Get the day number (1-31)
    const dayOfMonth = parseInt(format(date, 'd'));
    
    // Get the day of week (0-6, where 0 is Sunday)
    const dayOfWeek = getDay(date);
    
    return habits.some(habit => {
      const habitDate = parseISO(habit.created_at);
      
      switch (habit.frequency) {
        case 'daily':
          // Show dot if after creation date
          return date >= habitDate;
          
        case 'weekly':
          // Show dot on same day of week as creation
          return dayOfWeek === getDay(habitDate) && date >= habitDate;
          
        case 'monthly':
          // Show dot on same day of month as creation
          return dayOfMonth === parseInt(format(habitDate, 'd')) && date >= habitDate;
          
        default:
          return false;
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.monthLabel}>
        {format(selectedDate, 'MMMM yyyy')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);
          const hasHabit = hasHabitOnDate(date);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateItem,
                isSelected && styles.selectedDateItem,
                isCurrentDay && styles.todayDateItem,
              ]}
              onPress={() => onDateSelect(date)}>
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.selectedText,
                  isCurrentDay && styles.todayText,
                ]}>
                {format(date, 'EEE')}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  isSelected && styles.selectedText,
                  isCurrentDay && styles.todayText,
                ]}>
                {format(date, 'd')}
              </Text>
              {hasHabit && <View style={styles.habitIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  monthLabel: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  dateItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.card,
    marginHorizontal: 2,
  },
  selectedDateItem: {
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  todayDateItem: {
    backgroundColor: '#000000' + '10',
    borderWidth: 1,
    borderColor: '#000000',
  },
  dayText: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateText: {
    ...typography.headline,
    color: colors.text,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '600',
  },
  todayText: {
    color: colors.text,
    fontWeight: '600',
  },
  habitIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: spacing.xs,
  },
});

export {CalendarStrip as WeeklyCalendarStrip}; 