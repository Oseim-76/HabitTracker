import React, {useEffect, useRef, useState} from 'react';
import {
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity, 
  Animated,
  Platform,
  Pressable,
  useColorScheme,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, typography} from '../theme';
import type {Habit} from '../types/habit';
import {useHabits} from '../context/HabitContext';
import {format} from 'date-fns';

interface Props {
  habit: {
    scheduled_time: string;
    name: string;
    category?: string;
    frequency?: string;
    is_completed?: boolean;
    current_streak?: number;
    completedDates?: string[];
    id: string;
  };
  onPress?: () => void;
  onComplete?: () => void;
  index?: number;
}

const DEFAULT_CATEGORY = 'Personal';

const getCategoryIcon = (category?: string): string => {
  if (!category) return 'person-outline';
  
  const icons: Record<string, string> = {
    health: 'fitness',
    productivity: 'briefcase',
    learning: 'book',
    mindfulness: 'leaf',
    personal: 'person-outline',
    custom: 'apps',
  };
  return icons[category.toLowerCase()] || icons.personal;
};

const getCategoryColor = (category?: string): string => {
  if (!category) return '#607D8B';
  
  const categoryColors: Record<string, string> = {
    health: '#4CAF50',
    productivity: '#2196F3',
    learning: '#9C27B0',
    mindfulness: '#FF9800',
    personal: '#607D8B',
    custom: '#795548',
  };
  return categoryColors[category.toLowerCase()] || categoryColors.personal;
};

const getFrequencyIcon = (frequency?: string): string => {
  const icons: Record<string, string> = {
    daily: 'today',
    weekly: 'calendar',
    monthly: 'calendar',
  };
  return icons[frequency?.toLowerCase() || 'daily'] || 'today';
};

export function HabitCard({
  habit, 
  onPress, 
  onComplete, 
  index = 0
}: Props) {
  console.log('Habit data:', {
    name: habit.name,
    time: habit.scheduled_time,
    parsed: {
      hours: habit.scheduled_time?.split(':')[0],
      minutes: habit.scheduled_time?.split(':')[1]
    }
  });

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(1)).current;

  const {toggleHabitCompletion} = useHabits();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Track completion state locally
  const [isCompleted, setIsCompleted] = useState(
    habit.is_completed || habit.completedDates?.includes(today)
  );

  // Update local state when prop changes
  useEffect(() => {
    setIsCompleted(habit.is_completed || habit.completedDates?.includes(today));
  }, [habit.is_completed, habit.completedDates, today]);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 80),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleComplete = async () => {
    if (!habit.id) return;

    try {
      // Toggle local state immediately for better UX
      setIsCompleted(!isCompleted);
      
      console.log('1. HabitCard handleComplete clicked:', {
        habitId: habit.id,
        isCompleted: !isCompleted, // Log the new state
        completedDates: habit.completedDates || []
      });
      
      // Call parent's onComplete handler
      await onComplete?.();
      
      // Animate the checkmark
      Animated.sequence([
        Animated.spring(checkAnim, {
          toValue: 1.2,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(checkAnim, {
          toValue: 1,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      // Revert local state if there's an error
      setIsCompleted(!isCompleted);
      console.error('Error in handleComplete:', error);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      if (!timeString || !timeString.includes(':')) {
        console.warn('Invalid time format:', timeString);
        return '12:00 AM';
      }

      const [hoursStr, minutesStr] = timeString.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (isNaN(hours) || isNaN(minutes)) {
        console.warn('Invalid time numbers:', timeString);
        return '12:00 AM';
      }

      const period = hours >= 12 ? 'PM' : 'AM';
      const hour = hours % 12 || 12;
      const minutesFormatted = minutes.toString().padStart(2, '0');

      return `${hour}:${minutesFormatted} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error, timeString);
      return '12:00 AM';
    }
  };

  const handleToggle = async () => {
    if (!habit.id) {
      console.error('No habit ID provided');
      return;
    }

    try {
      await toggleHabitCompletion(habit.id, today);
      Animated.sequence([
        Animated.spring(checkAnim, {
          toValue: 1.2,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(checkAnim, {
          toValue: 1,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isDark && styles.containerDark,
        {
          opacity: opacityAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.8}>
        <View style={styles.leftContent}>
          <View style={styles.timeLabel}>
            <Text style={styles.time}>
              {formatTime(habit.scheduled_time)}
            </Text>
          </View>
          {habit.current_streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>
                {habit.current_streak}d streak
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mainContent}>
          <Text 
            style={[styles.title, isDark && styles.textDark]}
            numberOfLines={1}>
            {habit.name}
          </Text>
          
          <View style={styles.details}>
            <View style={[
              styles.categoryBadge, 
              { backgroundColor: getCategoryColor(habit?.category) + '15' }
            ]}>
              <Ionicons 
                name={getCategoryIcon(habit?.category)} 
                size={12} 
                color={getCategoryColor(habit?.category)} 
              />
              <Text style={[
                styles.categoryText,
                { color: getCategoryColor(habit?.category) }
              ]}>
                {habit?.category || DEFAULT_CATEGORY}
              </Text>
            </View>
            <View style={styles.frequencyBadge}>
              <Ionicons 
                name={getFrequencyIcon(habit?.frequency)}
                size={12} 
                color={colors.textSecondary} 
              />
              <Text style={styles.frequency}>
                {habit?.frequency}
              </Text>
            </View>
          </View>
        </View>

        <Animated.View style={{transform: [{scale: checkAnim}]}}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              isCompleted && styles.checkButtonCompleted
            ]}
            onPress={handleComplete}
            disabled={!habit.id}>
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
              size={28}
              color={isCompleted ? colors.success : colors.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.card,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  containerDark: {
    backgroundColor: colors.cardDark,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  leftContent: {
    width: 80,
  },
  timeLabel: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  time: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  streakBadge: {
    marginTop: spacing.xs,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  streakText: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  mainContent: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  categoryText: {
    ...typography.caption2,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  frequency: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: colors.success + '10',
  },
  textDark: {
    color: colors.textDark,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
}); 