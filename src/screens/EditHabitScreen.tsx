import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, typography} from '../theme';
import {habitsApi} from '../services/api';
import {CATEGORIES, FREQUENCIES} from '../constants';

interface Props {
  habit: {
    id: string;
    name: string;
    description?: string;
    category: string;
    frequency: string;
    scheduled_time: string;
  };
  onClose: () => void;
  onSave: () => void;
}

export function EditHabitScreen({habit, onClose, onSave}: Props) {
  const [name, setName] = useState(habit.name);
  const [frequency, setFrequency] = useState(habit.frequency);
  const [category, setCategory] = useState(habit.category);
  const [time, setTime] = useState(() => {
    const [hours, minutes] = habit.scheduled_time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    try {
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const scheduled_time = `${hours}:${minutes}`;

      await habitsApi.updateHabit(habit.id, {
        name: name.trim(),
        frequency,
        category,
        scheduled_time,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Habit</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Habit name"
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}>
          {CATEGORIES.map(({label, value, icon, color}) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.categoryOption,
                category === value && styles.categoryOptionSelected,
                {borderColor: color},
              ]}
              onPress={() => setCategory(value)}>
              <Ionicons name={icon} size={24} color={color} />
              <Text style={styles.categoryLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyContainer}>
          {FREQUENCIES.map(({label, value}) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.frequencyOption,
                frequency === value && styles.frequencyOptionSelected,
              ]}
              onPress={() => setFrequency(value)}>
              <Text style={styles.frequencyText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}>
          <Text style={styles.timeText}>{formatTime(time)}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={handleTimeChange}
          />
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Habit',
              'Are you sure you want to delete this habit?',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await habitsApi.deleteHabit(habit.id);
                      onSave();
                      onClose();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete habit');
                    }
                  },
                },
              ],
            );
          }}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={styles.deleteText}>Delete Habit</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  title: {
    ...typography.headline,
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  label: {
    ...typography.subhead,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  categoryOption: {
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryOptionSelected: {
    backgroundColor: colors.card,
  },
  categoryLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  frequencyContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  frequencyOption: {
    flex: 1,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  frequencyOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyText: {
    color: colors.text,
  },
  timeButton: {
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeText: {
    color: colors.text,
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  deleteText: {
    color: colors.error,
    marginLeft: spacing.xs,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.card,
    fontWeight: '600',
  },
}); 