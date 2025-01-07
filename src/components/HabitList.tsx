import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {Habit} from '../services/api';
import {HabitCard} from './HabitCard';

interface HabitListProps {
  habits: Habit[];
  onRefresh?: () => void;
  onHabitPress?: (habit: Habit) => void;
}

export function HabitList({habits, onRefresh, onHabitPress}: HabitListProps) {
  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => item.id}
      renderItem={({item}) => (
        <HabitCard
          habit={item}
          onPress={() => onHabitPress?.(item)}
        />
      )}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
} 