import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  format,
  startOfWeek,
  addDays,
  isToday,
  isSameDay,
  parseISO,
} from 'date-fns';

interface Props {
  completedDates: string[];
  onDateSelect?: (date: Date) => void;
}

function WeekDay({
  date,
  isSelected,
  isCompleted,
  onPress,
  index,
}: {
  date: Date;
  isSelected: boolean;
  isCompleted: boolean;
  onPress: () => void;
  index: number;
}) {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const animatedStyle = {
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
    ],
    opacity: animatedValue,
  };

  return (
    <Animated.View style={[styles.weekDay, animatedStyle]}>
      <TouchableOpacity
        style={[styles.weekDayContent, isSelected && styles.selectedDay]}
        onPress={onPress}>
        <Text style={[styles.weekDayText, isSelected && styles.selectedDayText]}>
          {format(date, 'EEE')}
        </Text>
        <View
          style={[
            styles.dateCircle,
            isToday(date) && styles.today,
            isSelected && styles.selectedDateCircle,
          ]}>
          <Text
            style={[
              styles.dateText,
              isToday(date) && styles.todayText,
              isSelected && styles.selectedDateText,
            ]}>
            {format(date, 'd')}
          </Text>
        </View>
        {isCompleted && <View style={styles.completedDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function AnimatedWeekStrip({completedDates, onDateSelect}: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const startDate = startOfWeek(new Date());
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const isDateCompleted = (date: Date) =>
    completedDates.some(d => isSameDay(parseISO(d), date));

  return (
    <View style={styles.container}>
      {weekDays.map((date, index) => (
        <WeekDay
          key={`weekday-${date.toISOString()}`}
          date={date}
          isSelected={isSameDay(date, selectedDate)}
          isCompleted={isDateCompleted(date)}
          onPress={() => handleDateSelect(date)}
          index={index}
        />
      ))}
    </View>
  );
}

const {width} = Dimensions.get('window');
const dayWidth = (width - 32) / 7;

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
  weekDay: {
    width: dayWidth,
    alignItems: 'center',
  },
  weekDayContent: {
    alignItems: 'center',
    padding: 8,
  },
  weekDayText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    transform: [{scale: 1.1}],
  },
  selectedDateCircle: {
    backgroundColor: '#f4511e',
  },
  today: {
    borderWidth: 2,
    borderColor: '#f4511e',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todayText: {
    color: '#f4511e',
    fontWeight: 'bold',
  },
  completedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  selectedDayText: {
    color: '#f4511e',
    fontWeight: 'bold',
  },
}); 