import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isSameMonth,
} from 'date-fns';
import {Ionicons} from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const MONTH_WIDTH = SCREEN_WIDTH - 32;
const SWIPE_THRESHOLD = 50;

interface Props {
  completedDates: string[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function DynamicCalendar({
  completedDates,
  onDateSelect,
  selectedDate,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const months = [
    subMonths(currentMonth, 1),
    currentMonth,
    addMonths(currentMonth, 1),
  ];

  // Pan Responder setup for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, {dx, dy}) => {
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderMove: (_, {dx}) => {
        slideAnim.setValue(dx);
        fadeAnim.setValue(1 - Math.abs(dx) / (MONTH_WIDTH * 2));
      },
      onPanResponderRelease: (_, {dx, vx}) => {
        if (Math.abs(dx) >= SWIPE_THRESHOLD || Math.abs(vx) >= 0.5) {
          const direction = dx > 0 ? 'prev' : 'next';
          animateTransition(direction, true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          // Reset to center if swipe wasn't far enough
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
            Animated.spring(fadeAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const animateTransition = useCallback((direction: 'prev' | 'next', isSwipe = false) => {
    const slideValue = direction === 'next' ? -MONTH_WIDTH : MONTH_WIDTH;
    
    if (!isSwipe) {
      slideAnim.setValue(0);
      fadeAnim.setValue(1);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideValue,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentMonth(prev => 
        direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
      );
      
      slideAnim.setValue(0);
      fadeAnim.setValue(1);
    });
  }, [fadeAnim, slideAnim]);

  const handleDateSelect = useCallback(async (date: Date) => {
    await Haptics.selectionAsync();
    
    // If clicking a date from another month, switch to that month
    if (!isSameMonth(date, currentMonth)) {
      setCurrentMonth(date);
    }
    
    // Animate selected date
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
    ]).start();

    onDateSelect?.(date);
  }, [onDateSelect, scaleAnim, currentMonth]);

  const getMonthDays = useCallback((month: Date) => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({start, end});
  }, []);

  const isDateCompleted = useCallback((date: Date) => {
    return completedDates.some(completedDate => 
      isSameDay(new Date(completedDate), date)
    );
  }, [completedDates]);

  const renderDay = (date: Date, monthDate: Date) => {
    const isCompleted = isDateCompleted(date);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isToday = isSameDay(date, new Date());
    const isCurrentMonth = isSameMonth(date, monthDate);

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.dayCell,
          isSelected && styles.selectedDay,
          isToday && styles.today,
          !isCurrentMonth && styles.outsideMonthDay,
        ]}
        onPress={() => handleDateSelect(date)}
      >
        <Animated.View
          style={[
            styles.dayCellContent,
            isSelected && {transform: [{scale: scaleAnim}]},
          ]}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isToday && styles.todayText,
            !isCurrentMonth && styles.outsideMonthDayText,
          ]}>
            {format(date, 'd')}
          </Text>
          {isCompleted && (
            <View style={[
              styles.completionDot,
              isSelected && styles.selectedCompletionDot,
            ]} />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={() => animateTransition('prev')}
            style={styles.navigationButton}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <Animated.View
            style={[
              styles.monthTitleContainer,
              {
                opacity: fadeAnim,
                transform: [{translateX: slideAnim}],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setDatePickerVisible(true)}
              style={styles.monthButton}
            >
              <Text style={styles.monthText}>
                {format(currentMonth, 'MMMM yyyy')}
              </Text>
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color="#007AFF" 
                style={styles.calendarIcon} 
              />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={() => animateTransition('next')}
            style={styles.navigationButton}
          >
            <Ionicons name="chevron-forward" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekdayText}>
              {day}
            </Text>
          ))}
        </View>
      </View>

      <Animated.View 
        style={[{
          opacity: fadeAnim,
          transform: [{translateX: slideAnim}],
        }]}
        {...panResponder.panHandlers}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentOffset={{x: MONTH_WIDTH, y: 0}}
        >
          {months.map(month => (
            <View
              key={month.toISOString()}
              style={styles.monthContainer}
            >
              <View style={styles.daysGrid}>
                {getMonthDays(month).map(date => 
                  renderDay(date, month)
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setDatePickerVisible(false);
          setCurrentMonth(date);
          onDateSelect?.(date);
        }}
        onCancel={() => setDatePickerVisible(false)}
        date={selectedDate || new Date()}
        {...Platform.select({
          ios: {
            modalStyleIOS: styles.datePickerModal,
            pickerStyleIOS: styles.datePickerIOS,
          },
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navigationButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  calendarIcon: {
    marginLeft: 4,
  },
  monthContainer: {
    width: MONTH_WIDTH,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  monthText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 15,
    color: '#000',
  },
  today: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  todayText: {
    fontWeight: '600',
  },
  selectedDay: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  outsideMonthDay: {
    opacity: 0.5,
  },
  outsideMonthDayText: {
    color: '#666',
  },
  completionDot: {
    position: 'absolute',
    bottom: '15%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  selectedCompletionDot: {
    backgroundColor: '#fff',
  },
  monthTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  datePickerIOS: {
    backgroundColor: 'white',
  },
  dayCellContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 