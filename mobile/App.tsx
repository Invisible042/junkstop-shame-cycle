import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ThemedApp() {
  const { theme } = useTheme();
  return (
    <LinearGradient
      colors={theme.backgroundGradient}
      style={{ flex: 1 }}
    >
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </LinearGradient>
  );
}

export default function App() {
  useEffect(() => {
    // Request notification permissions and schedule motivational notification
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        // Cancel previous scheduled notifications to avoid duplicates
        await Notifications.cancelAllScheduledNotificationsAsync();
        // Schedule a motivational notification every 5 hours
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Stay Strong! 💪",
            body: "Remember your goals. You are stronger than your cravings! Keep it up!",
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            seconds: 5 * 60 * 60, // 5 hours
            repeats: true,
          },
        });
      }
    };
    setupNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <ThemedApp />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}