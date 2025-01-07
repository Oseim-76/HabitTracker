import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TabNavigator} from './TabNavigator';
import {HabitSettingsScreen} from '../screens/HabitSettingsScreen';
import {AddHabitScreen} from '../screens/AddHabitScreen';
import {useAuth} from '../context/AuthContext';
import {LoadingScreen} from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const {user, loading} = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user ? (
        // Auth stack
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // App stack
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
            name="HabitSettings" 
            component={HabitSettingsScreen}
            options={{presentation: 'modal'}}
          />
          <Stack.Screen 
            name="AddHabit" 
            component={AddHabitScreen}
            options={{presentation: 'modal'}}
          />
        </>
      )}
    </Stack.Navigator>
  );
} 