import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens directly from the src/screens directory
import HomeScreen from './src/screens/HomeScreen';
import WalkTestScreen from './src/screens/WalkTestScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';

// Define the type for the navigation stack parameters
export type RootStackParamList = {
  Home: undefined;
  WalkTest: undefined;
  History: undefined;
  Profile: undefined;
  Achievements: undefined;
};

// Create the navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4A90E2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: '6-Minute Walk Test' }}
          />
          <Stack.Screen 
            name="WalkTest" 
            component={WalkTestScreen}
            options={{ title: 'Walk Test' }}
          />
          <Stack.Screen 
            name="History" 
            component={HistoryScreen}
            options={{ title: 'History' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
          <Stack.Screen 
            name="Achievements" 
            component={AchievementsScreen}
            options={{ title: 'Achievements' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
} 