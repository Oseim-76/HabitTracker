import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, typography} from '../theme';
import {habitsApi} from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

type Frequency = 'daily' | 'weekly' | 'monthly';

const FREQUENCIES: Array<{
  label: string;
  value: Frequency;
  icon: string;
  description: string;
}> = [
  {label: 'Daily', value: 'daily', icon: 'calendar-outline', description: 'Repeat every day'},
  {label: 'Weekly', value: 'weekly', icon: 'calendar-outline', description: 'Repeat every week'},
  {label: 'Monthly', value: 'monthly', icon: 'calendar-outline', description: 'Repeat every month'},
];

const CATEGORIES = [
  {
    label: 'Health',
    value: 'health',
    icon: 'fitness',
    color: '#4CAF50',
    description: 'Exercise, nutrition, sleep'
  },
  {
    label: 'Productivity',
    value: 'productivity',
    icon: 'briefcase',
    color: '#2196F3',
    description: 'Work, study, organization'
  },
  {
    label: 'Learning',
    value: 'learning',
    icon: 'book',
    color: '#9C27B0',
    description: 'Skills, knowledge, growth'
  },
  {
    label: 'Mindfulness',
    value: 'mindfulness',
    icon: 'leaf',
    color: '#FF9800',
    description: 'Meditation, reflection, peace'
  },
  {
    label: 'Personal',
    value: 'personal',
    icon: 'person-outline',
    color: '#607D8B',
    description: 'Personal development'
  },
  {
    label: 'Custom',
    value: 'custom',
    icon: 'add-circle',
    color: '#795548',
    description: 'Create your own category'
  },
];

const formatTimeWithAMPM = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).replace(/\s/, ''); // Remove space between time and AM/PM
};

export function AddHabitScreen({onClose, onSuccess}: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [category, setCategory] = useState('personal');
  const [customCategory, setCustomCategory] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    try {
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      const finalCategory = category === 'custom' && customCategory.trim() 
        ? customCategory.trim() 
        : category;

      const habitData = {
        name: name.trim(),
        description: description.trim(),
        frequency,
        category: finalCategory,
        scheduled_time: formattedTime,
      };

      console.log('Creating habit with data:', habitData); // Debug log

      await habitsApi.createHabit(habitData);
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  const handleTimeConfirm = (selectedDate: Date) => {
    setShowTimePicker(false);
    setTime(selectedDate);
  };

  const renderTimeButton = () => {
    const formattedTime = formatTimeWithAMPM(time);
    const [timeValue, period] = formattedTime.split(/(?=[AP]M)/);

    return (
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowTimePicker(true)}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeValue}>{timeValue}</Text>
          <Text style={styles.timePeriod}>{period}</Text>
        </View>
        <Text style={styles.timeDescription}>Tap to change time</Text>
      </TouchableOpacity>
    );
  };

  const renderTimePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide">
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Choose Time</Text>
                <TouchableOpacity onPress={() => handleTimeConfirm(time)}>
                  <Text style={[styles.modalButton, styles.modalDoneButton]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={(_, date) => date && setTime(date)}
                style={styles.timePicker}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      );
    }

    return showTimePicker && (
      <DateTimePicker
        value={time}
        mode="time"
        is24Hour={false}
        display="spinner"
        onChange={(_, date) => date && handleTimeConfirm(date)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Habit</Text>
        <View style={{width: 40}}>
          <Text>{/* Spacer */}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="What habit would you like to build?"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add some details about your habit (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>How often?</Text>
        <View style={styles.frequencyContainer}>
          {FREQUENCIES.map(({label, value, icon, description}) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.frequencyOption,
                frequency === value && styles.frequencyOptionSelected,
              ]}
              onPress={() => setFrequency(value)}>
              <Ionicons
                name={icon as any}
                size={24}
                color={frequency === value ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.frequencyLabel,
                frequency === value && styles.frequencyLabelSelected,
              ]}>
                {label}
              </Text>
              <Text style={styles.frequencyDescription}>{description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}>
          {CATEGORIES.map(({label, value, icon, color, description}) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.categoryOption,
                category === value && styles.categoryOptionSelected,
                {borderColor: color},
              ]}
              onPress={() => {
                console.log('Selected category:', value);
                setCategory(value);
              }}>
              <View style={[styles.categoryIcon, {backgroundColor: color + '20'}]}>
                <Ionicons name={icon as any} size={24} color={color} />
              </View>
              <Text style={styles.categoryLabel}>{label}</Text>
              <Text style={styles.categoryDescription}>{description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {category === 'custom' && (
          <View style={styles.customCategoryContainer}>
            <TextInput
              style={styles.customCategoryInput}
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder="Name your category"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>When should we remind you?</Text>
        {renderTimeButton()}
        {renderTimePicker()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            !name && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!name}>
          <Text style={styles.submitButtonText}>Create Habit</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.card} />
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
    backgroundColor: colors.card,
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
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
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  picker: {
    color: colors.text,
  },
  timeButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border + '40',
  },
  timeButtonText: {
    ...typography.body,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text,
  },
  submitButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  inputIcon: {
    marginRight: spacing.sm,
  },

  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  frequencyOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  frequencyOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },

  frequencyLabel: {
    ...typography.subhead,
    color: colors.text,
    marginTop: spacing.xs,
  },

  frequencyLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  frequencyDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  categoryScroll: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },

  categoryOption: {
    width: 140,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginRight: spacing.md,
    borderWidth: 1,
  },

  categoryOptionSelected: {
    backgroundColor: colors.card + '90',
  },

  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  categoryLabel: {
    ...typography.subhead,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  categoryDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },

  timeValue: {
    ...typography.title1,
    color: colors.text,
    fontSize: 32,
  },

  timePeriod: {
    ...typography.headline,
    color: colors.primary,
    fontWeight: '600',
  },

  timeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  inputWrapper: {
    marginBottom: spacing.md,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border + '40',
  },

  inputIconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background + '40',
  },

  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 44,
  },

  textAreaContainer: {
    alignItems: 'flex-start',
  },

  textArea: {
    minHeight: 100,
    paddingTop: spacing.sm,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    ...typography.headline,
    color: colors.text,
  },

  modalButton: {
    ...typography.body,
    color: colors.primary,
    paddingHorizontal: spacing.sm,
  },

  modalDoneButton: {
    fontWeight: '600',
  },

  timePicker: {
    height: 200,
    backgroundColor: colors.card,
  },

  customCategoryContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: spacing.sm,
  },
  
  customCategoryInput: {
    ...typography.body,
    color: colors.text,
    padding: spacing.sm,
    height: 44,
  },
}); 