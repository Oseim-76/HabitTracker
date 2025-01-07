import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../context/AuthContext';
import {colors, spacing, typography, shadows} from '../theme';
import type {RootStackNavigationProp} from '../types/navigation';

const baseURL = 'http://localhost:3000';

export function HomeHeader() {
  const {user} = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  const AvatarSection = () => {
    const imageUri = user?.profile_image 
      ? (user.profile_image.startsWith('http') 
          ? user.profile_image 
          : `${baseURL}${user.profile_image}`)
      : null;

    return (
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => navigation.navigate('Profile')}>
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.avatar}
            defaultSource={{ uri: 'https://via.placeholder.com/100' }}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <AvatarSection />
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  avatarContainer: {
    marginRight: 2,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  textContainer: {
    marginLeft: spacing.sm,
  },
  greeting: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  username: {
    ...typography.headline,
    color: colors.text,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    ...shadows.small,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.card,
  },
}); 