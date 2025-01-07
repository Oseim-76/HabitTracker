import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {format, isSameDay, isToday, addDays} from 'date-fns';

interface Props {
  dates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  completedDates: string[];
}

export function WeekStrip({dates, selectedDate, onSelectDate, completedDates}: Props) {
  return (
    <View style={styles.container}>
      {dates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isCurrentDay = isToday(date);
        const dayName = format(date, 'EEE');
        const dayNumber = format(date, 'd');

        return (
          <View key={date.toISOString()}>
            <TouchableOpacity
              style={styles.dayContainer}
              onPress={() => onSelectDate(date)}>
              <Text 
                style={[
                  styles.dayName, 
                  isSelected && styles.selectedText,
                  isCurrentDay && styles.todayText,
                ]}>
                {dayName}
              </Text>
              <View
                style={[
                  styles.dayNumber,
                  isSelected && styles.selectedDayNumber,
                  isCurrentDay && styles.todayCircle,
                ]}>
                <Text
                  style={[
                    styles.dayNumberText,
                    isSelected && styles.selectedDayNumberText,
                    isCurrentDay && !isSelected && styles.todayText,
                  ]}>
                  {dayNumber}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayContainer: {
    alignItems: 'center',
    padding: 4,
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayNumber: {
    backgroundColor: '#f4511e',
  },
  todayCircle: {
    borderWidth: 1,
    borderColor: '#f4511e',
  },
  dayNumberText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#f4511e',
  },
  todayText: {
    color: '#f4511e',
  },
  selectedDayNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 