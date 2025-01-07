import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AppNavigator} from './navigation/AppNavigator';
import {AuthProvider} from './context/AuthContext';
import {useServerHealth} from './hooks/useServerHealth';

export default function App() {
  // Use the health check hook
  useServerHealth();

  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
} 