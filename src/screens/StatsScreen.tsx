import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextStyle} from 'react-native';
import {colors, spacing, typography} from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useHabits} from '../context/HabitContext';
import {format, subDays} from 'date-fns';
import {Habit} from '../types/habit';

type Stats = {
  completionRate: number;
  weeklyProgress: number[];
  activeHabits: Array<Habit & {
    completionCount: number;
    completionRate: number;
  }>;
}

// Add a caption style to typography
const captionStyle = {
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '400' as const,
  letterSpacing: 0.4,
};

export function StatsScreen() {
  const {habits} = useHabits();
  const [stats, setStats] = useState<Stats>({
    completionRate: 0,
    weeklyProgress: [],
    activeHabits: [],
  });

  // Recalculate stats whenever habits change
  useEffect(() => {
    calculateStats();
  }, [habits]);

  const calculateStats = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    console.log('Calculating stats with habits:', habits.map(h => ({
      name: h.name,
      completed_dates: h.completed_dates,
      isCompleted: h.is_completed
    })));

    // Calculate today's completion rate
    const totalHabitsToday = habits.length;
    const completedToday = habits.filter(habit => {
      const isCompletedToday = habit.completed_dates?.includes(todayStr) || habit.is_completed;
      console.log(`Habit ${habit.name} completed today:`, isCompletedToday);
      return isCompletedToday;
    }).length;
    
    const completionRate = totalHabitsToday > 0 
      ? (completedToday / totalHabitsToday) * 100 
      : 0;

    console.log('Completion rate calculation:', {
      totalHabits: totalHabitsToday,
      completedToday,
      rate: completionRate
    });

    // Calculate weekly progress
    const weeklyProgress = Array.from({length: 7}).map((_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const activeHabits = habits.filter(habit => {
        const createdDate = new Date(habit.created_at);
        return createdDate <= date;
      });

      const completedOnDate = activeHabits.filter(habit => 
        habit.completed_dates?.includes(dateStr) || 
        (dateStr === todayStr && habit.is_completed)
      ).length;

      return activeHabits.length > 0 
        ? (completedOnDate / activeHabits.length) * 100 
        : 0;
    });

    // Get most active habits - already in reverse chronological order
    const activeHabits = habits
      .map(habit => ({
        ...habit,
        completionCount: (habit.completed_dates?.length || 0) + (habit.is_completed ? 1 : 0)
      }))
      .sort((a, b) => b.completionCount - a.completionCount)
      .slice(0, 3)
      .map(habit => ({
        ...habit,
        completionRate: ((habit.completionCount / 7) * 100)
      }));

    console.log('Final stats:', {
      completionRate,
      weeklyProgress,
      activeHabits: activeHabits.map(h => ({
        name: h.name,
        completions: h.completionCount,
        rate: h.completionRate
      }))
    });

    setStats({
      completionRate, 
      weeklyProgress, 
      activeHabits: activeHabits as Array<Habit & {
        completionCount: number;
        completionRate: number;
      }>
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>

      {/* Overall Progress Section */}
      <View style={styles.presenceSection}>
        <View style={styles.presenceHeader}>
          <View style={styles.presenceIcon}>
            <Ionicons name="trending-up" size={20} color={colors.primary} />
          </View>
          <Text style={styles.presenceTitle}>Overall Progress</Text>
        </View>

        <View style={styles.presenceStats}>
          <View>
            <Text style={styles.presenceValue}>
              {Math.round(stats.completionRate)}%
            </Text>
            <Text style={styles.presenceLabel}>HABIT COMPLETION</Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Weekly Progress Bar Chart */}
        <View style={styles.chartContainer}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <View key={`day-${index}`} style={styles.chartColumn}>
              <View 
                style={[
                  styles.bar,
                  { height: (stats.weeklyProgress[index] || 0) * 1.2 },
                  stats.weeklyProgress[index] > 80 && styles.activeBar,
                ]} 
              />
              <Text style={styles.weekLabel}>{day}</Text>
              {stats.weeklyProgress[index] > 80 && (
                <View key={`badge-${index}`} style={styles.percentageBadge}>
                  <Text style={styles.percentageText}>
                    {Math.round(stats.weeklyProgress[index])}%
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Active Habits Section */}
      <View style={styles.assignmentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Habits</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        {stats.activeHabits.map((habit, index) => (
          <View key={`habit-${habit.id || index}`} style={styles.habitItem}>
            <View style={styles.habitIcon}>
              <Ionicons 
                name="checkmark-circle"
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.habitInfo}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitFreq}>{habit.frequency}</Text>
            </View>
            <Text style={styles.habitStreak}>
              {habit.current_streak} day streak
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.title1,
    marginBottom: spacing.xl,
    fontWeight: '600' as const,
  },
  presenceSection: {
    marginBottom: spacing.xl,
  },
  presenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  presenceIcon: {
    marginRight: spacing.md,
  },
  presenceTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  presenceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presenceValue: {
    color: '#000',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
  presenceLabel: {
    ...captionStyle,
    color: colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    ...captionStyle,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'flex-end',
  },
  chartColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  activeBar: {
    backgroundColor: colors.primary,
  },
  weekLabel: {
    ...captionStyle,
    color: colors.textSecondary,
  },
  percentageBadge: {
    backgroundColor: colors.primary,
    padding: spacing.xs,
    borderRadius: 4,
    marginTop: spacing.xs,
  },
  percentageText: {
    ...captionStyle,
    color: colors.background,
  },
  assignmentSection: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  viewAllLink: {
    ...captionStyle,
    color: colors.primary,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  habitIcon: {
    marginRight: spacing.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    ...captionStyle,
    color: colors.text,
  },
  habitFreq: {
    ...captionStyle,
    color: colors.textSecondary,
  },
  habitStreak: {
    ...captionStyle,
    color: colors.textSecondary,
  },
}); 