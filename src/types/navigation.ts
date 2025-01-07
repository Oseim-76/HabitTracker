import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type TabParamList = {
  Home: undefined;
  Alarm: undefined;
};

export type RootStackParamList = {
  SignUp: undefined;
  SignIn: undefined;
  MainTabs: undefined;
  Calendar: {
    selectedDate?: string;
  };
  EditProfile: undefined;
}; 