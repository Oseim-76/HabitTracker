import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isSameDay,
  subMonths,
  addMonths,
} from 'date-fns';

interface Props {
  completedDates: string[];
  month?: Date;
}

export function CompletionCalendar({completedDates, month = new Date()}: Props) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({start, end});

  const isCompleted = (date: Date) => 
    completedDates.some(d => isSameDay(new Date(d), date));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>{format(month, 'MMMM yyyy')}</Text>
      </View>
      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text
            style={styles.weekDay}
            key={`weekday-${index}`}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.days}>
        {days.map((date) => (
          <View
            style={[
              styles.day,
              isCompleted(date) && styles.completed,
              isToday(date) && styles.today,
            ]}
            key={`day-${date.toISOString()}`}>
            <Text
              style={[
                styles.dayText,
                isCompleted(date) && styles.completedText,
                isToday(date) && styles.todayText,
              ]}>
              {format(date, 'd')}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  completed: {
    backgroundColor: '#f4511e',
    borderRadius: 20,
  },
  completedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  today: {
    borderWidth: 2,
    borderColor: '#f4511e',
    borderRadius: 20,
  },
  todayText: {
    color: '#f4511e',
    fontWeight: 'bold',
  },
}); 