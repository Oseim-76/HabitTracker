import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

// Get development URL based on platform
const getDevelopmentBaseURL = () => {
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000/api';  // For iOS simulator
  } else {
    return 'http://10.0.2.2:3000/api';   // For Android emulator
  }
};

// Create API instance
const api = axios.create({
  baseURL: __DEV__ ? getDevelopmentBaseURL() : 'https://your-production-api.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout and other configurations
  timeout: 10000,
});

// Add request interceptor to include token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Update response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      await AsyncStorage.multiRemove(['token', 'user']);
      // You might want to trigger a navigation to login screen here
    }
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day: string;
  scheduled_time: string;
  created_at: string;
  is_completed: boolean;
  current_streak: number;
  longest_streak: number;
}

export interface Stats {
  total_habits: number;
  completed_today: number;
  current_streak: number;
  longest_streak: number;
  completion_rate: number;
  weekly_completions: number[];
}

// Habits API methods
export const habitsApi = {
  getTodayHabits: async (): Promise<ApiResponse<Habit[]>> => {
    try {
      const response = await api.get<ApiResponse<Habit[]>>('/habits');
      return response.data;
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }
  },

  createHabit: async (habitData: Partial<Habit>): Promise<ApiResponse<Habit>> => {
    try {
      const response = await api.post<ApiResponse<Habit>>('/habits', habitData);
      return response.data;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  },

  updateHabit: async (habitId: string, updates: Partial<Habit>): Promise<ApiResponse<Habit>> => {
    try {
      if (!habitId) {
        throw new Error('Habit ID is required');
      }

      console.log('API: Updating habit:', { habitId, updates });
      const response = await api.patch(`/habits/${habitId}`, updates);
      console.log('API: Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error updating habit:', error);
      throw error;
    }
  },

  deleteHabit: async (habitId: string): Promise<ApiResponse<void>> => {
    try {
      console.log('API: Deleting habit:', { habitId });
      if (!habitId) {
        throw new Error('Habit ID is required');
      }
      const response = await api.delete<ApiResponse<void>>(`/habits/${habitId}`);
      console.log('API: Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error deleting habit:', error);
      throw error;
    }
  },

  getStats: async (): Promise<ApiResponse<Stats>> => {
    try {
      const response = await api.get<ApiResponse<Stats>>('/habits/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  async toggleHabit(habitId: string, date: string): Promise<any> {
    try {
      console.log('API: Toggling habit:', { habitId, date });
      const response = await api.post(`/habits/${habitId}/toggle`, { date });
      console.log('API: Toggle response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error toggling habit:', error);
      throw error;
    }
  },

  uploadProfileImage: async (imageData: any): Promise<ApiResponse<{profile_image: string}>> => {
    try {
      const formData = new FormData();
      
      if (!imageData?.uri) {
        throw new Error('Image URI is required');
      }

      formData.append('image', {
        uri: imageData.uri,
        type: 'image/jpeg',
        name: 'profile.jpg'
      });

      // Use auth upload endpoint
      const response = await api.post('/auth/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Upload failed:', {
        error: error.message
      });
      throw error;
    }
  },
};

// Health check method
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${getDevelopmentBaseURL()}/health`);
    console.log('Server health check:', response.data);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api; 