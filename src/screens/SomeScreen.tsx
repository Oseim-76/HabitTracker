import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CalendarScreen } from './CalendarScreen';
import { useHabits } from '../context/HabitContext';

function SomeComponent() {
  const navigation = useNavigation();
  const { habits } = useHabits();

  return (
    <CalendarScreen 
      habits={habits} 
      onDateSelect={(date) => {
        console.log('Selected date:', date);
        // Handle date selection
      }}
    />
  );
} 