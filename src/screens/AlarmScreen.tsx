import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Platform,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import * as Notifications from 'expo-notifications';
import { useHabits } from '../context/HabitContext';
import type { Habit } from '../services/api';
import { scheduleSilentMode, scheduleGradualWake } from '../services/notifications';
import { useAuth } from '../context/AuthContext';

interface AlarmScreenProps {
  onClose: () => void;
  onSave: (settings: AlarmSettings) => void;
  initialSettings?: AlarmSettings;
}

export interface AlarmSettings {
  wakeUpTime: Date;
  bedTime: Date;
  enabled: boolean;
  silentMode: boolean;
  gradualWake: boolean;
  volume: number;
  linkedHabits: LinkedHabit[];
}

interface LinkedHabit {
  habitId: string;
  timeOffset: number; // minutes before/after alarm
  enabled: boolean;
}

const BEDTIME_HABIT_SUGGESTIONS = [
  { name: 'Read a book', duration: 15, icon: 'book-outline' },
  { name: 'Meditate', duration: 10, icon: 'leaf-outline' },
  { name: 'Journal', duration: 10, icon: 'document-text-outline' },
  { name: 'Screen time', duration: 0, icon: 'phone-portrait-outline' },
];

const WAKEUP_HABIT_SUGGESTIONS = [
  { name: 'Drink water', duration: 1, icon: 'water-outline' },
  { name: 'Quick stretch', duration: 5, icon: 'fitness-outline' },
  { name: 'Morning walk', duration: 15, icon: 'walk-outline' },
];

function calculateSleepDuration(bedTime: Date, wakeUpTime: Date): number {
  const sleep = new Date(wakeUpTime);
  const bed = new Date(bedTime);
  
  // Adjust for next day if wake time is earlier than bed time
  if (sleep < bed) {
    sleep.setDate(sleep.getDate() + 1);
  }
  
  return (sleep.getTime() - bed.getTime()) / (1000 * 60 * 60);
}

function getSleepQuality(hours: number): {
  label: string;
  color: string;
  message: string;
} {
  if (hours < 6) {
    return { 
      label: 'Poor Sleep', 
      color: '#FF3B30', 
      message: 'Try to get more rest' 
    };
  } else if (hours <= 8) {
    return { 
      label: 'Good Sleep', 
      color: '#34C759', 
      message: 'Maintaining healthy sleep' 
    };
  } else if (hours <= 9) {
    return { 
      label: 'Optimal Sleep', 
      color: '#007AFF', 
      message: 'Perfect sleep duration' 
    };
  } else {
    return { 
      label: 'Excessive Sleep', 
      color: '#FF9500', 
      message: 'Consider reducing sleep time' 
    };
  }
}

function formatSleepDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  let minutes = Math.round((hours % 1) * 60);
  
  // Handle case where minutes round up to 60
  if (minutes === 60) {
    return `${wholeHours + 1}h 00m`;
  }
  
  return `${wholeHours}h ${String(minutes).padStart(2, '0')}m`;
}

const toggleHabit = (habitId: string, enabled: boolean) => {
  setLinkedHabits(prev => 
    prev.map(habit => 
      habit.habitId === habitId 
        ? { ...habit, enabled } 
        : habit
    )
  );
};

const handleAddSuggestion = (suggestion: typeof BEDTIME_HABIT_SUGGESTIONS[0]) => {
  const newHabit: LinkedHabit = {
    habitId: String(Date.now()),
    timeOffset: 0,
    enabled: true
  };
  setLinkedHabits(prev => [...prev, newHabit]);
};

export default function AlarmScreen({ onClose, onSave, initialSettings }: AlarmScreenProps) {
  // Set default wake up time to 6:00 AM
  const defaultWakeUp = () => {
    const date = new Date();
    date.setHours(6, 0, 0);
    return date;
  };

  // Set default bedtime to 9:00 PM
  const defaultBedtime = () => {
    const date = new Date();
    date.setHours(21, 0, 0);
    return date;
  };

  const [wakeUpTime, setWakeUpTime] = useState(
    initialSettings?.wakeUpTime || defaultWakeUp()
  );
  const [bedTime, setBedTime] = useState(
    initialSettings?.bedTime || defaultBedtime()
  );
  const [showWakeUpPicker, setShowWakeUpPicker] = useState(false);
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [alarmsEnabled, setAlarmsEnabled] = useState(initialSettings?.enabled ?? true);
  const [silentMode, setSilentMode] = useState(initialSettings?.silentMode ?? true);
  const [gradualWake, setGradualWake] = useState(initialSettings?.gradualWake ?? true);
  const [volume, setVolume] = useState(initialSettings?.volume ?? 50);
  const [linkedHabits, setLinkedHabits] = useState<LinkedHabit[]>(
    initialSettings?.linkedHabits || []
  );
  const [showHabitPicker, setShowHabitPicker] = useState(false);
  
  const { habits } = useHabits();
  const { user } = useAuth();

  const sleepDuration = calculateSleepDuration(bedTime, wakeUpTime);
  const sleepQuality = getSleepQuality(sleepDuration);

  const handleSave = async () => {
    try {
      if (silentMode) {
        await scheduleSilentMode(bedTime, wakeUpTime);
      }
      
      if (gradualWake) {
        await scheduleGradualWake(wakeUpTime, volume);
      }
      
      onSave({
        wakeUpTime,
        bedTime,
        enabled: alarmsEnabled,
        silentMode,
        gradualWake,
        volume,
        linkedHabits
      });
      
      onClose();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to schedule notifications. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getSuggestions = (isWakeUp: boolean) => {
    return isWakeUp ? WAKEUP_HABIT_SUGGESTIONS : BEDTIME_HABIT_SUGGESTIONS;
  };

  const renderHabitSection = (isWakeUp: boolean) => (
    <View style={styles.habitSection}>
      <Text style={styles.sectionTitle}>
        {isWakeUp ? 'Morning Habits' : 'Bedtime Habits'}
      </Text>
      <Text style={styles.sectionHint}>
        Link habits to build a consistent routine
      </Text>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>
          Suggested Habits
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getSuggestions(isWakeUp).map((suggestion, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.suggestionCard}
              onPress={() => handleAddSuggestion(suggestion)}
            >
              <Ionicons 
                name={suggestion.icon} 
                size={24} 
                color={colors.primary} 
              />
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionName}>
                  {suggestion.name}
                </Text>
                <Text style={styles.suggestionDuration}>
                  {suggestion.duration.toString()} minutes
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Sleep Schedule
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>
              Save
            </Text>
          </TouchableOpacity>
          {user?.profileImage && (
            <Image 
              source={{ uri: user.profileImage }} 
              style={styles.profileImage}
            />
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Sleep Duration Card */}
        <View style={styles.sleepCard}>
          <View style={styles.sleepDuration}>
            <Text style={styles.durationText}>
              {formatSleepDuration(sleepDuration)}
            </Text>
            <Text style={[styles.qualityLabel, { color: sleepQuality.color }]}>
              {sleepQuality.label}
            </Text>
          </View>
          <Text style={styles.qualityMessage}>
            {sleepQuality.message}
          </Text>
        </View>

        {/* Alarm Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingTitle}>Daily Alarms</Text>
            <Switch
              value={alarmsEnabled}
              onValueChange={setAlarmsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              ios_backgroundColor={colors.border}
            />
          </View>

          <TouchableOpacity 
            style={styles.timeItem}
            onPress={() => setShowWakeUpPicker(true)}
          >
            <View style={styles.timeLeft}>
              <Ionicons name="sunny" size={24} color={colors.primary} />
              <View style={styles.timeLabels}>
                <Text style={styles.timeLabel}>Wake Up</Text>
                <Text style={styles.timeHint}>Gentle morning alarm</Text>
              </View>
            </View>
            <Text style={styles.timeValue}>
              {wakeUpTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.timeItem}
            onPress={() => setShowBedTimePicker(true)}
          >
            <View style={styles.timeLeft}>
              <Ionicons name="moon" size={24} color={colors.primary} />
              <View style={styles.timeLabels}>
                <Text style={styles.timeLabel}>Bedtime</Text>
                <Text style={styles.timeHint}>Wind down reminder</Text>
              </View>
            </View>
            <Text style={styles.timeValue}>
              {bedTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </Text>
          </TouchableOpacity>

          {/* Silent Mode Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Bedtime Mode</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon" size={24} color={colors.primary} />
                <View style={styles.settingLabels}>
                  <Text style={styles.settingLabel}>Silent Mode</Text>
                  <Text style={styles.settingHint}>
                    Automatically enable Do Not Disturb
                  </Text>
                </View>
              </View>
              <Switch
                value={silentMode}
                onValueChange={setSilentMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          {/* Natural Wake Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Wake Up Experience</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="sunny" size={24} color={colors.primary} />
                <View style={styles.settingLabels}>
                  <Text style={styles.settingLabel}>Gradual Wake</Text>
                  <Text style={styles.settingHint}>
                    Slowly increase volume and vibration
                  </Text>
                </View>
              </View>
              <Switch
                value={gradualWake}
                onValueChange={setGradualWake}
                trackColor={{ false: colors.border, true: colors.primary }}
                ios_backgroundColor={colors.border}
              />
            </View>

            {gradualWake ? (
              <View style={styles.volumeControl}>
                <Text style={styles.volumeLabel}>Starting Volume</Text>
                <Slider
                  style={styles.slider}
                  value={volume}
                  onValueChange={setVolume}
                  minimumValue={0}
                  maximumValue={100}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                />
                <Text style={styles.volumeValue}>
                  {`${Math.round(volume)}%`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Time Pickers */}
        {(showWakeUpPicker || showBedTimePicker) ? (
          <DateTimePicker
            value={showWakeUpPicker ? wakeUpTime : bedTime}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={(event, selectedDate) => {
              if (showWakeUpPicker) {
                setShowWakeUpPicker(Platform.OS === 'ios');
                selectedDate && setWakeUpTime(selectedDate);
              } else {
                setShowBedTimePicker(Platform.OS === 'ios');
                selectedDate && setBedTime(selectedDate);
              }
            }}
          />
        ) : null}

        {/* Habit Sections */}
        {renderHabitSection(true)}
        {renderHabitSection(false)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  saveButton: {
    color: colors.primary,
    ...typography.button,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sleepCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sleepDuration: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  durationText: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  qualityLabel: {
    ...typography.h3,
    fontWeight: '600',
  },
  qualityMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  settingTitle: {
    ...typography.h3,
    color: colors.text,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabels: {
    marginLeft: spacing.sm,
  },
  timeLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  timeHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timeValue: {
    ...typography.h3,
    color: colors.primary,
  },
  settingSection: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabels: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  settingHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  volumeControl: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  volumeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  slider: {
    height: 40,
  },
  volumeValue: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'right',
  },
  habitSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  linkedHabitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  habitName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  habitTiming: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  suggestionsContainer: {
    marginTop: spacing.md,
  },
  suggestionsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionCard: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginRight: spacing.sm,
    width: 100,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionContent: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  suggestionName: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionDuration: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: spacing.sm,
  },
});

export { AlarmScreen }; 