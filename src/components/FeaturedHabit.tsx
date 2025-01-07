import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, typography, shadows} from '../theme';

export function FeaturedHabit() {
  return (
    <TouchableOpacity style={styles.container}>
      <LinearGradient
        colors={['#4C6EF5', '#3B5BDB']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}>
        <View style={styles.content}>
          <View>
            <Text style={styles.title}>Bedtime & Wakeup</Text>
            <Text style={styles.description}>
              Schedule the reminder to go to bed early and wake up calmly.
            </Text>
          </View>
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Set Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    borderRadius: 20,
    ...shadows.medium,
  },
  gradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.title3,
    color: '#FFF',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.callout,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.lg,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
  },
  actionText: {
    ...typography.subhead,
    color: '#FFF',
    marginRight: spacing.xs,
  },
}); 