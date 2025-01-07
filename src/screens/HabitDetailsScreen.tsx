import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetails'>;

export default function HabitDetailsScreen({route}: Props) {
  const {habitId} = route.params;

  return (
    <View style={styles.container}>
      <Text>Habit Details Screen</Text>
      <Text>Habit ID: {habitId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 