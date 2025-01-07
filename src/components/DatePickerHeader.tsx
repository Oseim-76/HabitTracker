import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {CustomDatePicker} from './CustomDatePicker';
import {format} from 'date-fns';
import {Ionicons} from '@expo/vector-icons';

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  completionRate: number;
  totalHabits: number;
  completedHabits: number;
}

export function DatePickerHeader({
  selectedDate,
  onDateChange,
  completionRate,
  totalHabits,
  completedHabits,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>
          {format(selectedDate, 'EEEE, MMMM d')}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#666" />
      </TouchableOpacity>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedHabits}/{totalHabits}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(completionRate * 100)}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>

      <CustomDatePicker
        value={selectedDate}
        onChange={onDateChange}
        visible={showPicker}
        onClose={() => setShowPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 