import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {DynamicCalendar} from './DynamicCalendar';
import {format} from 'date-fns';
import {useHabits} from '../context/HabitsContext';

interface Props {
  habitId: string;
}

export function HabitCalendarView({habitId}: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const {toggleHabitCompletion, getHabitCompletions} = useHabits();
  const completedDates = getHabitCompletions(habitId);

  const handleDateSelect = useCallback(async (date: Date) => {
    setSelectedDate(date);
    await toggleHabitCompletion(habitId, format(date, 'yyyy-MM-dd'));
  }, [habitId, toggleHabitCompletion]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Completion Calendar</Text>
        <TouchableOpacity style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      <DynamicCalendar
        completedDates={completedDates}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {completedDates.length}
          </Text>
          <Text style={styles.statLabel}>
            Total Days
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {/* Calculate current streak */}
            5
          </Text>
          <Text style={styles.statLabel}>
            Current Streak
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {/* Calculate best streak */}
            12
          </Text>
          <Text style={styles.statLabel}>
            Best Streak
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  todayButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
}); 