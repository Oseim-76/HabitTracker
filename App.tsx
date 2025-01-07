import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import {AuthProvider} from './src/context/AuthContext';
import {HabitProvider} from './src/context/HabitContext';
import {ErrorBoundary} from './src/components/ErrorBoundary';
import {SignInScreen} from './src/screens/SignInScreen';
import {SignUpScreen} from './src/screens/SignUpScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {BottomTabs} from './src/navigation/BottomTabs';
import {useAuth} from './src/context/AuthContext';
import {LoadingScreen} from './src/components/LoadingScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
  const {user, loading} = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user ? (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={BottomTabs} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        <AuthProvider>
          <HabitProvider>
            <NavigationContainer>
              <Navigation />
            </NavigationContainer>
          </HabitProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 