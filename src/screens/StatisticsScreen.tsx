import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type TimeFrame = 'week' | 'month' | 'year';

interface HabitStats {
  name: string;
  streak: number;
  completionRate: number;
  totalCompletions: number;
  lastCompleted: string;
  category: string;
}

interface ExtraAdvantage {
  title: string;
  subtitle: string;
  tag?: string;
  icon: string;
}

export function StatisticsScreen() {
  const { user } = useAuth();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');

  const calculateStats = () => {
    return {
      activeHabits: user?.habits?.length || 0,
      streak: calculateStreak(),
      completionRate: calculateCompletionRate(),
      totalCompletions: calculateTotalCompletions(),
    };
  };

  const calculateStreak = () => {
    // Implement streak calculation logic
    return 15;
  };

  const calculateCompletionRate = () => {
    const totalHabits = user?.habits?.length || 0;
    const completedHabits = user?.habits?.filter(habit => habit.isComplete)?.length || 0;
    return totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  };

  const calculateTotalCompletions = () => {
    // Implement total completions calculation
    return 45;
  };

  const stats = calculateStats();

  const StatCard = ({ number, label, icon }: { number: number | string; label: string; icon: string }) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
      </View>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const TimeFrameSelector = () => (
    <View style={styles.timeFrameContainer}>
      {(['week', 'month', 'year'] as TimeFrame[]).map((frame) => (
        <TouchableOpacity
          key={frame}
          style={[
            styles.timeFrameButton,
            timeFrame === frame && styles.timeFrameButtonActive,
          ]}
          onPress={() => setTimeFrame(frame)}
        >
          <Text
            style={[
              styles.timeFrameText,
              timeFrame === frame && styles.timeFrameTextActive,
            ]}
          >
            {frame.charAt(0).toUpperCase() + frame.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getHabitStats = (): HabitStats[] => {
    // This should come from your actual habit data
    return [
      {
        name: "Morning Meditation",
        streak: 15,
        completionRate: 92,
        totalCompletions: 45,
        lastCompleted: "Today",
        category: "Mindfulness"
      },
      {
        name: "Daily Exercise",
        streak: 7,
        completionRate: 85,
        totalCompletions: 38,
        lastCompleted: "Today",
        category: "Health"
      },
      // Add more habits
    ];
  };

  const HabitBreakdown = () => (
    <View style={styles.habitBreakdown}>
      {getHabitStats().map((habit, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.habitCard}
          onPress={() => {/* Navigate to detailed habit view */}}
        >
          <View style={styles.habitHeader}>
            <View style={styles.habitMainInfo}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitCategory}>{habit.category}</Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color="#FF9500" />
              <Text style={styles.streakText}>{habit.streak}</Text>
            </View>
          </View>

          <View style={styles.habitMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{habit.completionRate}%</Text>
              <Text style={styles.metricLabel}>Success Rate</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{habit.totalCompletions}</Text>
              <Text style={styles.metricLabel}>Total</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{habit.lastCompleted}</Text>
              <Text style={styles.metricLabel}>Last Done</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${habit.completionRate}%` }
                ]} 
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const WeeklyOverview = () => (
    <View style={styles.weeklyOverview}>
      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
        <View key={day} style={styles.dayColumn}>
          <View style={[styles.dayBar, { height: `${Math.random() * 100}%` }]} />
          <Text style={styles.dayLabel}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'][day]}
          </Text>
        </View>
      ))}
    </View>
  );

  const ProfileHeader = () => {
    const baseURL = 'http://localhost:3000';
    const imageUri = user?.profile_image 
      ? (user.profile_image.startsWith('http') 
          ? user.profile_image 
          : `${baseURL}${user.profile_image}`)
      : null;

    return (
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Image 
            source={{ uri: imageUri || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const RewardCard = () => (
    <View style={styles.rewardCard}>
      <View style={styles.rewardContent}>
        <View>
          <Text style={styles.rewardTitle}>Get 1 streak bonus point!</Text>
          <Text style={styles.rewardSubtitle}>
            Complete all your habits today to earn bonus points
          </Text>
        </View>
        <View style={styles.percentageIcon}>
          <Ionicons name="trophy" size={24} color={colors.primary} />
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '80%' }]} />
      </View>
    </View>
  );

  const ExtraAdvantages = () => {
    const advantages: ExtraAdvantage[] = [
      {
        title: "Habit Streaks",
        subtitle: "Earn points for consistent habits",
        tag: "Loyalty",
        icon: "flame-outline"
      },
      {
        title: "Achievement Coins",
        subtitle: "Get your achievement coins!",
        icon: "medal-outline"
      }
    ];

    return (
      <View style={styles.advantagesSection}>
        <Text style={styles.sectionLabel}>Extra Advantages</Text>
        {advantages.map((advantage, index) => (
          <TouchableOpacity key={index} style={styles.advantageCard}>
            <View style={styles.advantageInfo}>
              <View style={styles.advantageHeader}>
                <Text style={styles.advantageTitle}>{advantage.title}</Text>
                {advantage.tag && (
                  <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{advantage.tag}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.advantageSubtitle}>{advantage.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ProfileHeader />
        <RewardCard />
        <ExtraAdvantages />
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionLabel}>Settings</Text>
          {renderSettingItem({
            icon: 'notifications-outline',
            label: 'Reminders',
          })}
          {renderSettingItem({
            icon: 'time-outline',
            label: 'Daily Reset Time',
          })}
          {renderSettingItem({
            icon: 'shield-outline',
            label: 'Privacy Settings',
          })}
          {renderSettingItem({
            icon: 'language-outline',
            label: 'Language',
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  detailedStats: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statIconContainer: {
    backgroundColor: `${colors.primary}15`,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  timeFrameButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  timeFrameButtonActive: {
    backgroundColor: '#fff',
  },
  timeFrameText: {
    fontSize: 12,
    color: '#666',
  },
  timeFrameTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitBreakdown: {
    gap: 16,
  },
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitMainInfo: {
    flex: 1,
  },
  habitCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 4,
  },
  habitMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginTop: 8,
  },
  weeklyOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    paddingVertical: 16,
    alignItems: 'flex-end',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  dayBar: {
    width: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
    opacity: 0.8,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
  },
  filterButton: {
    padding: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  rewardCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  rewardSubtitle: {
    fontSize: 14,
    color: '#666',
    maxWidth: '80%',
  },
  percentageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advantagesSection: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  advantageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  advantageInfo: {
    flex: 1,
  },
  advantageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  advantageTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginRight: 8,
  },
  tagContainer: {
    backgroundColor: '#FFF5DC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#FFB800',
    fontWeight: '500',
  },
  advantageSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
});