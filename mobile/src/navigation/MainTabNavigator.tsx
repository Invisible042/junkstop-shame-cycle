import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Placeholder screens - will be implemented with full functionality
const DashboardScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23' }}>
    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Dashboard</Text>
    <Text style={{ color: '#a1a1aa', marginTop: 8 }}>Streak tracking and stats</Text>
  </View>
);

const LogScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23' }}>
    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Log Junk Food</Text>
    <Text style={{ color: '#a1a1aa', marginTop: 8 }}>Take photos and rate guilt</Text>
  </View>
);

const ProgressScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23' }}>
    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Progress</Text>
    <Text style={{ color: '#a1a1aa', marginTop: 8 }}>Analytics and insights</Text>
  </View>
);

const ChatScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23' }}>
    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>AI Coach</Text>
    <Text style={{ color: '#a1a1aa', marginTop: 8 }}>Get personalized support</Text>
  </View>
);

const CommunityScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23' }}>
    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Community</Text>
    <Text style={{ color: '#a1a1aa', marginTop: 8 }}>Anonymous confessions</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Log') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#71717a',
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
    </Tab.Navigator>
  );
}