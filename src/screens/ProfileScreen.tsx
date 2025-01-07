import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
  Alert,
  Image,
  Modal,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import {habitsApi} from '../services/api';
import {EditProfileScreen} from './EditProfileScreen';
import InviteImage from '../assets/images/Invite.png';
import { colors } from '../theme';

export function ProfileScreen() {
  const {user, signOut, updateUser} = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const calculateHabitProgress = () => {
    // Calculate the percentage of completed habits
    const totalHabits = user?.habits?.length || 0;
    const completedHabits = user?.habits?.filter(habit => habit.isComplete)?.length || 0;
    return totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  };

  const renderSettingItem = ({
    icon,
    label,
    value,
    onPress,
    showArrow = true,
    showSwitch = false,
    switchValue = false,
    onToggle,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    showSwitch?: boolean;
    switchValue?: boolean;
    onToggle?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !onToggle}>
      <View style={styles.settingLeft}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={colors.textSecondary} 
          style={styles.settingIcon} 
        />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showSwitch && (
          <Switch
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={switchValue ? colors.card : '#f4f3f4'}
            ios_backgroundColor={colors.border}
            onValueChange={onToggle}
            value={switchValue}
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        )}
        {showArrow && (
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.border} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const handleImageUpdate = (imageUrl: string) => {
    // Update local state or context with new image URL
    console.log('Profile image updated:', imageUrl);
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos to change profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        console.log('Selected image:', result.assets[0]);
        
        const response = await habitsApi.uploadProfileImage({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });

        console.log('Upload response:', response);

        if (response.status === 'success' && updateUser && user) {
          // Create updated user object with new profile image
          const updatedUser = {
            ...user,
            profile_image: response.data.profile_image
          };

          // Save to AsyncStorage and update state
          await updateUser(updatedUser);
          console.log('User data updated with new profile:', updatedUser);
        }
      }
    } catch (error) {
      console.error('Image pick/upload error:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
  };

  const ProfileHeader = () => {
    const baseURL = 'http://localhost:3000';
    const imageUri = user?.profile_image 
      ? (user.profile_image.startsWith('http') 
          ? user.profile_image 
          : `${baseURL}${user.profile_image}`)
      : null;

    return (
      <View style={styles.profileHeader}>
        <View style={styles.userSection}>
          <Image 
            source={{ uri: imageUri || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.username}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setShowEditProfile(true)}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const TodayProgress = () => {
    const totalHabits = user?.habits?.length || 0;
    const completedHabits = user?.habits?.filter(habit => habit.isComplete)?.length || 0;

    return (
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressCount}>{completedHabits}/{totalHabits} Habits</Text>
        </View>
        <Text style={styles.progressSubtitle}>
          {totalHabits === 0 
            ? "Add your first habit to get started!"
            : completedHabits === totalHabits 
              ? "All done for today! 🎉" 
              : "100% to go - You can do it!"}
        </Text>
      </View>
    );
  };

  const Achievements = () => (
    <View style={styles.achievementsCard}>
      <Text style={styles.sectionTitle}>Your Achievements</Text>
      <View style={styles.achievementsGrid}>
        <View style={styles.achievementItem}>
          <Ionicons name="flame" size={24} color="#FF9500" />
          <Text style={styles.achievementValue}>15</Text>
          <Text style={styles.achievementLabel}>Day Streak</Text>
        </View>
        <View style={styles.achievementItem}>
          <Ionicons name="trophy" size={24} color="#FFB800" />
          <Text style={styles.achievementValue}>3</Text>
          <Text style={styles.achievementLabel}>Badges Earned</Text>
        </View>
        <View style={styles.achievementItem}>
          <Ionicons name="star" size={24} color="#007AFF" />
          <Text style={styles.achievementValue}>250</Text>
          <Text style={styles.achievementLabel}>Points</Text>
        </View>
      </View>
    </View>
  );

  const NextMilestone = () => (
    <View style={styles.milestoneCard}>
      <Text style={styles.milestoneTitle}>Next Milestone</Text>
      <Text style={styles.milestoneSubtitle}>2 more days to unlock Gold Badge!</Text>
      <View style={styles.milestoneProgress}>
        <View style={[styles.milestoneProgressBar, { width: '80%' }]} />
      </View>
    </View>
  );

  const CompleteHabits = () => (
    <View style={styles.completeCard}>
      <View style={styles.completeContent}>
        <View>
          <Text style={styles.completeTitle}>Complete Your Daily Habits!</Text>
          <Text style={styles.completeSubtitle}>
            Complete all habits to unlock achievements
          </Text>
        </View>
        <View style={styles.completeIcon}>
          <Ionicons name="trending-up" size={24} color={colors.primary} />
        </View>
      </View>
    </View>
  );

  const HabitStreak = () => (
    <View style={styles.streakCard}>
      <View style={styles.streakContent}>
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakTitle}>Get 1 coupon for free{'\n'}shipping cost!</Text>
          <Text style={styles.streakSubtitle}>
            Let's complete your data and get our coupon
          </Text>
        </View>
        <View style={styles.giftIconContainer}>
          <Ionicons name="gift-outline" size={24} color={colors.primary} />
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '60%' }]} />
      </View>
    </View>
  );

  const HabitAchievements = () => (
    <View style={styles.achievementsCard}>
      <Text style={styles.sectionLabel}>Achievements</Text>
      <TouchableOpacity style={styles.achievementRow}>
        <View style={styles.achievementLeft}>
          <View style={styles.achievementIconContainer}>
            <Ionicons name="trophy-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.achievementTitle}>Early Bird</Text>
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementBadgeText}>Gold</Text>
            </View>
          </View>
        </View>
        <View style={styles.achievementRight}>
          <Text style={styles.achievementSubtitle}>Complete morning habits</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.border} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const CommunitySection = () => (
    <View style={styles.communityCard}>
      <View style={styles.communityContent}>
        <View style={styles.communityTextSection}>
          <Text style={styles.communityTitle}>Join Habit Groups!</Text>
          <Text style={styles.communitySubtitle}>
            Connect with others who share your goals and motivate each other daily
          </Text>
        </View>
        <View style={styles.communityImageContainer}>
          <Image source={InviteImage} style={styles.communityImage} />
        </View>
      </View>
      <TouchableOpacity style={styles.communityButton}>
        <Text style={styles.communityButtonText}>Browse Groups</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ProfileHeader />
        <HabitStreak />
        <HabitAchievements />
        <CommunitySection />
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {renderSettingItem({
            icon: 'notifications-outline',
            label: 'Reminders',
            onPress: () => {},
          })}
          {renderSettingItem({
            icon: 'time-outline',
            label: 'Reset Time',
            onPress: () => {},
          })}
          {renderSettingItem({
            icon: 'calendar-outline',
            label: 'Weekly Goals',
            onPress: () => {},
          })}
          {renderSettingItem({
            icon: 'shield-outline',
            label: 'Privacy',
            onPress: () => {},
          })}
          {renderSettingItem({
            icon: 'moon-outline',
            label: 'Dark Mode',
            showSwitch: true,
            switchValue: darkMode,
            onToggle: setDarkMode,
          })}
        </View>
      </ScrollView>

      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}>
        <EditProfileScreen 
          onClose={() => setShowEditProfile(false)}
          onSuccess={() => setShowEditProfile(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileHeader: {
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  rewardCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  rewardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    maxWidth: '70%',
  },
  rewardIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  inviteCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 8,
  },
  inviteTextSection: {
    flex: 1,
    marginRight: 20,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inviteSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    maxWidth: '90%',
  },
  inviteImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginRight: -8,
  },
  referralButton: {
    backgroundColor: `${colors.primary}15`,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  referralButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 10,
    width: 20,
    color: colors.textSecondary,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 15,
    color: colors.textSecondary,
    marginRight: 8,
  },
  progressCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  progressStats: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  achievementsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  achievementItem: {
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  achievementLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  milestoneCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  milestoneSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneProgress: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  milestoneProgressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  couponCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  couponContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  couponTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  couponTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  couponSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  giftIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#F0F0F0',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  advantagesCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  advantageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
  },
  advantageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  advantageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advantageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  loyaltyBadge: {
    backgroundColor: '#FFF3DC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  loyaltyText: {
    fontSize: 11,
    color: '#FFB800',
    fontWeight: '600',
  },
  advantageRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  advantageSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  streakCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  streakTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  streakTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  streakSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  giftIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#F0F0F0',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  achievementBadge: {
    backgroundColor: '#FFF3DC',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  achievementBadgeText: {
    fontSize: 11,
    color: '#FFB800',
    fontWeight: '500',
  },
  achievementRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievementSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  communityCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.card,
  },
  communityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  communityTextSection: {
    flex: 1,
    paddingRight: 16,
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  communitySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  communityImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  communityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  communityButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
}); 