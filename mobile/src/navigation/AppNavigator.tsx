import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import MainTabNavigator from './MainTabNavigator';
import LogJunkFoodScreen from '../screens/LogJunkFoodScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyActivityScreen from '../screens/MyActivityScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import FeatureHighlightScreen from '../screens/onboarding/FeatureHighlightScreen';
import FinishOnboardingScreen from '../screens/onboarding/FinishOnboardingScreen';
import VideoPreviewScreen, { RootStackParamList } from '../screens/VideoPreviewScreen';
import ProgressScreen from '../screens/ProgressScreen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        onboardingComplete ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="ProgressScreen" component={ProgressScreen} />
          <Stack.Screen name="LogJunkFood" component={LogJunkFoodScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="MyActivity" component={MyActivityScreen} />
            <Stack.Screen name="VideoPreview">
              {props => <VideoPreviewScreen {...props as NativeStackScreenProps<RootStackParamList, 'VideoPreview'>} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" options={{ headerShown: false }}>
              {props => <WelcomeScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name="FeatureHighlight" options={{ headerShown: false }}>
              {props => <FeatureHighlightScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name="FinishOnboarding" options={{ headerShown: false }}>
              {props => <FinishOnboardingScreen onFinish={() => setOnboardingComplete(true)} {...props} />}
            </Stack.Screen>
          </>
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}