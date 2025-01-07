import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, ScrollView, TouchableOpacity} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars';
import {colors, spacing, typography} from '../theme';
import type {RootStackScreenProps} from '../types/navigation';
import {format, parseISO, isSameDay} from 'date-fns';
import {useHabits} from '../context/HabitContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = RootStackScreenProps<'Calendar'>;
type MarkedDates = {
  [date: string]: {
    marked: boolean;
    dotColor?: string;
    selected?: boolean;
  };
};

const captionStyle = {
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '400' as const,
  letterSpacing: 0.4,
};

export function CalendarScreen({navigation}: Props) {
  const {habits, toggleHabitCompletion, lastUpdate} = useHabits();
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDateHabits, setSelectedDateHabits] = useState<typeof habits>([]);

  // Helper function to check if a habit should be shown on a date
  const shouldShowHabitOnDate = (habit: typeof habits[0], date: Date) => {
    const habitDate = parseISO(habit.created_at.toString());
    
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekly') return habitDate.getDay() === date.getDay();
    if (habit.frequency === 'monthly') return habitDate.getDate() === date.getDate();
    return false;
  };

  // Update when habits change or new habits are added
  useEffect(() => {
    console.log('Calendar updating, trigger:', { habitCount: habits.length, lastUpdate });
    updateCalendarMarks();
  }, [habits.length, lastUpdate]); // Respond to habit count changes and lastUpdate

  const updateCalendarMarks = () => {
    const marked: MarkedDates = {};
    
    // Get all dates from habits
    habits.forEach(habit => {
      const habitStartDate = parseISO(habit.created_at.toString());
      const today = new Date();
      let currentDate = new Date(habitStartDate);

      // Iterate through dates from habit creation to today
      while (currentDate <= today) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Check if habit should appear on this date based on frequency
        let shouldMark = false;
        switch (habit.frequency) {
          case 'daily':
            shouldMark = true;
            break;
          case 'weekly':
            shouldMark = currentDate.getDay() === habitStartDate.getDay();
            break;
          case 'monthly':
            shouldMark = currentDate.getDate() === habitStartDate.getDate();
            break;
        }

        if (shouldMark) {
          // Initialize or update the marked date
          if (!marked[dateStr]) {
            marked[dateStr] = {
              marked: true,
              dotColor: colors.textSecondary, // Default gray dot
            };
          }
          
          // If habit is completed on this date, make the dot green
          if (habit.completed_dates?.includes(dateStr)) {
            marked[dateStr].dotColor = colors.primary; // Green dot
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Mark selected date
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
    };

    setMarkedDates(marked);
    updateSelectedDateHabits();
  };

  const updateSelectedDateHabits = () => {
    const selectedDateObj = parseISO(selectedDate);
    const habitsForSelectedDate = habits.filter(habit => {
      const habitStartDate = parseISO(habit.created_at.toString());

      switch (habit.frequency) {
        case 'daily':
          return true;
        case 'weekly':
          return selectedDateObj.getDay() === habitStartDate.getDay();
        case 'monthly':
          return selectedDateObj.getDate() === habitStartDate.getDate();
        default:
          return false;
      }
    });
    setSelectedDateHabits(habitsForSelectedDate);
  };

  useEffect(() => {
    console.log('Calendar habits updated:', habits);
    // Recalculate any calendar-specific state here
  }, [habits]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      await toggleHabitCompletion(habitId, selectedDate);
      // Update UI immediately for better UX
      setSelectedDateHabits(prev => 
        prev.map(habit => {
          if (habit.id === habitId) {
            const completed = habit.completed_dates?.includes(selectedDate);
            return {
              ...habit,
              completed_dates: completed
                ? habit.completed_dates?.filter(d => d !== selectedDate)
                : [...(habit.completed_dates || []), selectedDate],
            };
          }
          return habit;
        })
      );
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.text,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.background,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textSecondary,
          dotColor: colors.primary,
          monthTextColor: colors.text,
          arrowColor: colors.primary,
          indicatorColor: colors.primary,
        }}
      />
      
      <ScrollView style={styles.habitList}>
        <Text style={styles.dateHeader}>
          {format(parseISO(selectedDate), 'MMMM d, yyyy')}
        </Text>
        
        {selectedDateHabits.length === 0 ? (
          <Text style={styles.emptyText}>No habits scheduled for this day</Text>
        ) : (
          selectedDateHabits.map((habit, index) => {
            const isCompleted = habit.completed_dates?.includes(selectedDate);
            return (
              <TouchableOpacity
                key={`habit-${habit.id || index}-${selectedDate}`}
                style={[
                  styles.habitItem,
                  isCompleted && styles.completedHabit
                ]}
                onPress={() => handleToggleHabit(habit.id)}>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitFreq}>
                    {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                </Text>
                </View>
                <Ionicons 
                  name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={isCompleted ? colors.primary : colors.textSecondary} 
                />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  habitList: {
    flex: 1,
    padding: spacing.lg,
  },
  dateHeader: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '600' as const,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontWeight: '400' as const,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  completedHabit: {
    backgroundColor: `${colors.primary}10`, // 10% opacity
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500' as const,
    marginBottom: spacing.xs,
  },
  habitFreq: {
    ...captionStyle,
    color: colors.textSecondary,
  },
}); 