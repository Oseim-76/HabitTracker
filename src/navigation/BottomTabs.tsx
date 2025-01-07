import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {HomeScreen} from '../screens/HomeScreen';
import {CalendarScreen} from '../screens/CalendarScreen';
import {StatsScreen} from '../screens/StatsScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {useHabits} from '../context/HabitContext';

const Tab = createBottomTabNavigator();

// Create a wrapper component for CalendarScreen
function CalendarScreenWrapper() {
  const {habits, loadHabits} = useHabits();
  
  // Load habits when component mounts
  useEffect(() => {
    loadHabits();
  }, []);
  
  console.log('Calendar habits from wrapper:', {
    count: habits.length,
    habits: habits.map(h => ({
      name: h.name,
      frequency: h.frequency,
      created: h.created_at
    }))
  });
  
  return <CalendarScreen habits={habits} />;
}

export function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          switch (route.name) {
            case 'Today':
              iconName = focused ? 'today' : 'today-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'alert';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Today" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreenWrapper} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
} 