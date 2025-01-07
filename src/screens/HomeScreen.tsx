import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {HomeHeader} from '../components/HomeHeader';
import {CalendarStrip} from '../components/WeeklyCalendarStrip';
import {FeaturedHabit} from '../components/FeaturedHabit';
import {HabitCard} from '../components/HabitCard';
import {FloatingActionButton} from '../components/FloatingActionButton';
import {AddHabitScreen} from './AddHabitScreen';
import {HabitSettingsScreen} from './HabitSettingsScreen';
import {habitsApi} from '../services/api';
import type {Habit} from '../services/api';
import {colors, spacing, typography} from '../theme';
import {format, parseISO, getDay} from 'date-fns';
import BedtimeBackground from '../../backend/src/assets/images/wakeup.png';
import {FeaturedCard} from '../components/FeaturedCard';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation';
import {AlarmScreen, AlarmSettings} from './AlarmScreen';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).toUpperCase(); // This will show "6:00 AM" format
}

function formatSleepDuration(bedTime: Date, wakeUpTime: Date): string {
  const sleep = new Date(wakeUpTime);
  const bed = new Date(bedTime);
  
  if (sleep < bed) {
    sleep.setDate(sleep.getDate() + 1);
  }
  
  const hours = (sleep.getTime() - bed.getTime()) / (1000 * 60 * 60);
  const wholeHours = Math.floor(hours);
  
  // Just return hours for cleaner look
  return `${wholeHours}hrs of sleep`;
}

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAlarmSettings, setShowAlarmSettings] = useState(false);
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const response = await habitsApi.getTodayHabits();
      if (response.status === 'success') {
        setHabits(response.data);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = () => {
    setShowAddHabit(true);
  };

  const handleHabitCreated = () => {
    setShowAddHabit(false);
    loadHabits();
  };

  const handleHabitPress = (habit: Habit) => {
    setSelectedHabit(habit);
  };

  const handleHabitUpdated = () => {
    setSelectedHabit(null);
    loadHabits();
  };

  const filteredHabits = habits
    .filter(habit => {
      if (habit.frequency === 'daily') return true;
      
      if (habit.frequency === 'weekly') {
        const habitDate = parseISO(habit.created_at);
        return getDay(selectedDate) === getDay(habitDate);
      }

      if (habit.frequency === 'monthly') {
        const habitDate = parseISO(habit.created_at);
        return format(selectedDate, 'd') === format(habitDate, 'd');
      }

      return false;
    })
    .reverse();

  console.log('Filtered habits:', {
    selectedDate: format(selectedDate, 'yyyy-MM-dd'),
    total: habits.length,
    filtered: filteredHabits.length,
    habits: filteredHabits.map(h => ({
      name: h.name,
      frequency: h.frequency,
      created: h.created_at
    }))
  });

  const renderMonthHeader = () => (
    <TouchableOpacity 
      style={styles.calendarButton}
      onPress={() => navigation.navigate('Calendar', {
        selectedDate: format(selectedDate, 'yyyy-MM-dd')
      })}>
      <Ionicons 
        name="calendar-outline"
        size={24} 
        color={colors.primary} 
      />
    </TouchableOpacity>
  );

  const handleSaveAlarms = (settings: AlarmSettings) => {
    setAlarmSettings(settings);
    setShowAlarmSettings(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadHabits} />
        }>
        <HomeHeader />
        {renderMonthHeader()}
        <CalendarStrip
          habits={habits}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
        <FeaturedCard
          title="Bedtime & Wakeup"
          description={alarmSettings?.enabled 
            ? formatSleepDuration(alarmSettings.bedTime, alarmSettings.wakeUpTime)
            : "Schedule the reminder to go to bed early and wake up calmly."}
          onPress={() => setShowAlarmSettings(true)}
          backgroundImage={BedtimeBackground}
          active={alarmSettings?.enabled}
          subtitle={alarmSettings ? `Wake up: ${formatTime(alarmSettings.wakeUpTime)}` : undefined}
        />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          {loading ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : filteredHabits.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyText}>
                No habits scheduled for {format(selectedDate, 'EEEE')}
              </Text>
              <TouchableOpacity 
                style={styles.scheduleButton}
                onPress={handleAddHabit}>
                <Text style={styles.scheduleButtonText}>Schedule a Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredHabits.map((habit, index) => (
              <HabitCard
                key={`habit-${habit.id || index}`}
                habit={habit}
                onPress={() => handleHabitPress(habit)}
                onComplete={() => {}}
              />
            ))
          )}
        </View>
      </ScrollView>
      <FloatingActionButton onPress={handleAddHabit} />

      {/* Add Habit Modal */}
      <Modal
        visible={showAddHabit}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddHabit(false)}>
        <AddHabitScreen 
          onClose={() => setShowAddHabit(false)} 
          onSuccess={handleHabitCreated}
        />
      </Modal>

      {/* Alarm Settings Modal */}
      <Modal
        visible={showAlarmSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAlarmSettings(false)}>
        <AlarmScreen 
          onClose={() => setShowAlarmSettings(false)}
          onSave={handleSaveAlarms}
          initialSettings={alarmSettings || undefined}
        />
      </Modal>

      {/* Habit Settings Modal */}
      <Modal
        visible={!!selectedHabit}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedHabit(null)}>
        {selectedHabit && (
          <HabitSettingsScreen
            habit={selectedHabit}
            onClose={() => setSelectedHabit(null)}
            onSuccess={handleHabitUpdated}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '600' as const,
  },
  loader: {
    marginTop: spacing.xl,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    marginHorizontal: -spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontWeight: '400' as const,
  },
  scheduleButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  scheduleButtonText: {
    ...typography.subhead,
    color: colors.card,
    fontWeight: '500' as const,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  monthTitle: {
    ...typography.title2,
    color: colors.text,
    fontSize: 22,
    fontWeight: '600' as const,
  },
  calendarButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.sm + 84,
    padding: spacing.xs,
    zIndex: 1,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.md,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.text,
    marginBottom: spacing.md,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
}); 