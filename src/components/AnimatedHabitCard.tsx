import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import type {Habit} from '../types/habit';
import {format, parse} from 'date-fns';

interface Props {
  habit: Habit;
  index: number;
  onPress: () => void;
  onComplete: () => void;
  isCompleted?: boolean;
}

const {width} = Dimensions.get('window');

export function AnimatedHabitCard({
  habit,
  index,
  onPress,
  onComplete,
  isCompleted,
}: Props) {
  const formattedTime = habit.schedule.time 
    ? format(parse(habit.schedule.time, 'HH:mm', new Date()), 'h:mm a')
    : '';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(isCompleted ? 20 : 0, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
      opacity: withSpring(isCompleted ? 0.6 : 1),
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={[styles.card, isCompleted && styles.completedCard]}
        onPress={onPress}
        activeOpacity={0.8}>
        {formattedTime && (
          <View style={styles.timeContainer}>
            <View style={[styles.timeBox, isCompleted && styles.completedTimeBox]}>
              <Text style={[styles.time, isCompleted && styles.completedTime]}>
                {formattedTime}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isCompleted && styles.completedText]}>
              {habit.title}
            </Text>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.checkButton, isCompleted && styles.completedCheckButton]}
              onPress={onComplete}>
              <Ionicons
                name={isCompleted ? "close-circle" : "checkmark-circle-outline"}
                size={24}
                color={isCompleted ? "#f44336" : "#4CAF50"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completedCard: {
    backgroundColor: '#f8f9fa',
  },
  timeContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  timeBox: {
    backgroundColor: '#fff5f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedTimeBox: {
    backgroundColor: '#e8f5e9',
  },
  time: {
    fontSize: 14,
    color: '#f4511e',
    fontWeight: '600',
  },
  completedTime: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  completedText: {
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  checkButton: {
    padding: 4,
  },
  completedCheckButton: {
    transform: [{scale: 1.1}],
  },
}); 