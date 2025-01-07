import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [tokenResult, userResult] = await AsyncStorage.multiGet(['token', 'user']);
      const [_, token] = tokenResult;
      const [__, userJson] = userResult;
      
      console.log('Stored auth data:', {
        hasToken: !!token,
        hasUser: !!userJson,
        userData: userJson ? JSON.parse(userJson) : null
      });

      if (token && userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      console.log('User data loaded:', user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  async function signUp(email: string, password: string, username: string) {
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        username,
      });
      
      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        
        // Store auth data
        await AsyncStorage.multiSet([
          ['token', token],
          ['user', JSON.stringify(user)]
        ]);
        
        // Update state
        setUser(user);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  const updateUser = async (updatedUser: User) => {
    try {
      // Save updated user data to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      // Update state
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{user, loading, signIn, signUp, signOut, setUser, updateUser}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 