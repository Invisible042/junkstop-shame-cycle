
import React, { useState } from 'react';
import DashboardScreen from '@/components/DashboardScreen';
import LogScreen from '@/components/LogScreen';
import ProgressScreen from '@/components/ProgressScreen';
import ChatScreen from '@/components/ChatScreen';
import CommunityScreen from '@/components/CommunityScreen';
import Navigation from '@/components/Navigation';
import { useUserProfile, useCreateJunkFoodLog } from '@/hooks/useJunkFoodData';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile();
  const createLogMutation = useCreateJunkFoodLog();

  const handleLogJunkFood = () => {
    setCurrentScreen(1);
  };

  const handleSubmitLog = async (data: {
    photo: File;
    food_type: string;
    guilt_rating: number;
    regret_rating: number;
    estimated_cost?: number;
    location?: string;
  }) => {
    try {
      await createLogMutation.mutateAsync(data);
      setCurrentScreen(0); // Return to dashboard after successful log
    } catch (error) {
      console.error('Failed to submit log:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your data...</div>
      </div>
    );
  }

  const screens = [
    <DashboardScreen 
      currentStreak={profile?.streak_count || 0}
      totalSaved={profile?.total_saved || 0}
      avgGuiltScore={profile?.avg_guilt_score || 0}
      onLogJunkFood={handleLogJunkFood}
    />,
    <LogScreen 
      onSubmitLog={handleSubmitLog} 
      isSubmitting={createLogMutation.isPending}
    />,
    <ProgressScreen />,
    <ChatScreen />,
    <CommunityScreen />
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-5">
      <div className="w-full max-w-sm h-[812px] bg-black rounded-[40px] p-2 shadow-2xl shadow-black/50">
        <div className="w-full h-full bg-gray-950/90 backdrop-blur-xl rounded-[32px] overflow-hidden relative border border-white/10">
          <div className="w-full h-full pb-20">
            {screens[currentScreen]}
          </div>
          
          <Navigation currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
        </div>
      </div>
    </div>
  );
};

export default Index;
