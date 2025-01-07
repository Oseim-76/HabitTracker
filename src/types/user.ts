export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  profile_image?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  reminderTime?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
} 