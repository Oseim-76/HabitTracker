import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {Habit} from '../services/api';

interface Props {
  habits: Habit[];
  loading?: boolean;
  onHabitPress?: (habit: Habit) => void;
}

export function TodaySchedule({habits = [], loading = false, onHabitPress}: Props) {
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!habits?.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Today's Schedule</Text>
        <Text style={styles.emptyText}>No habits scheduled for today</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Schedule</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {habits.map(habit => (
        <TouchableOpacity
          key={habit.id}
          style={styles.habitItem}
          onPress={() => onHabitPress?.(habit)}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{habit.scheduled_time}</Text>
          </View>
          <View style={styles.habitContent}>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.habitDescription}>{habit.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  seeAll: {
    color: '#007AFF',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeContainer: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  habitContent: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
}); 