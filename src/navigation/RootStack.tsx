import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { EditProfileScreen } from '../screens/EditProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();

// In your RootStack navigator
<Stack.Group screenOptions={{ presentation: 'modal' }}>
  <Stack.Screen
    name="EditProfile"
    component={EditProfileScreen}
    options={{ 
      headerShown: false,
      cardStyle: { backgroundColor: 'transparent' },
    }}
  />
</Stack.Group> 