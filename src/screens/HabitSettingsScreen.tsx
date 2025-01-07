import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, typography, shadows} from '../theme';
import {useHabits} from '../context/HabitContext';
import type {RootStackParamList} from '../types/navigation';

type HabitSettingsRouteProp = RouteProp<RootStackParamList, 'HabitSettings'>;

interface Props {
  habit: Habit;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  {
    label: 'Health',
    value: 'health',
    icon: 'fitness',
    color: '#4CAF50',
  },
  {
    label: 'Productivity',
    value: 'productivity',
    icon: 'briefcase',
    color: '#2196F3',
  },
  {
    label: 'Learning',
    value: 'learning',
    icon: 'book',
    color: '#9C27B0',
  },
  {
    label: 'Mindfulness',
    value: 'mindfulness',
    icon: 'leaf',
    color: '#FF9800',
  },
  {
    label: 'Personal',
    value: 'personal',
    icon: 'person-outline',
    color: '#607D8B',
  },
];

export function HabitSettingsScreen({habit, onClose, onSuccess}: Props) {
  const {deleteHabit, updateHabit} = useHabits();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(habit.name);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(
    habit.frequency as 'daily' | 'weekly' | 'monthly'
  );
  const [time, setTime] = useState(habit.scheduled_time);
  const [category, setCategory] = useState(habit.category);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!habit._id) {
        Alert.alert('Error', 'Cannot update habit: Invalid ID');
        return;
      }

      await updateHabit(habit._id, {
        name,
        frequency,
        scheduled_time: time,
        category,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!habit?._id) {
        Alert.alert('Error', 'Cannot delete habit: Invalid ID');
        return;
      }

      Alert.alert(
        'Delete Habit',
        'Are you sure you want to delete this habit? This action cannot be undone.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                await deleteHabit(habit._id);
                onSuccess?.();
                onClose();
              } catch (error) {
                console.error('Failed to delete habit:', error);
                Alert.alert('Error', 'Failed to delete habit. Please try again.');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Delete dialog error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Habit</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Habit name"
        />
      </View>

      <View style={styles.section}>
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
              <View style={[styles.categoryIcon, {backgroundColor: color + '20'}]}>
                <Ionicons name={icon as any} size={24} color={color} />
              </View>
              <Text style={styles.categoryLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.optionsContainer}>
          {['daily', 'weekly', 'monthly'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                frequency === option && styles.selectedOption,
              ]}
              onPress={() => setFrequency(option)}>
              <Text
                style={[
                  styles.optionText,
                  frequency === option && styles.selectedOptionText,
                ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color={colors.error} />
        <Text style={styles.deleteButtonText}>Delete Habit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    backgroundColor: colors.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.text,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.callout,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.card,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  deleteButtonText: {
    ...typography.body,
    color: colors.error,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...typography.headline,
    color: colors.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  closeButton: {
    padding: spacing.xs,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  categoryOption: {
    width: 100,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryOptionSelected: {
    backgroundColor: colors.card + '90',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    ...typography.caption,
    color: colors.text,
  },
}); 