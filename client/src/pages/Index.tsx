
import React, { useState } from 'react';
import DashboardScreen from '@/components/DashboardScreen';
import LogScreen from '@/components/LogScreen';
import ProgressScreen from '@/components/ProgressScreen';
import ChatScreen from '@/components/ChatScreen';
import CommunityScreen from '@/components/CommunityScreen';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalSaved, setTotalSaved] = useState(45);
  const [avgGuiltScore, setAvgGuiltScore] = useState(2.3);

  const handleLogJunkFood = () => {
    setCurrentScreen(1);
  };

  const handleSubmitLog = (data: any) => {
    setCurrentStreak(0);
    setAvgGuiltScore(data.guilt);
    toast({
      title: "💔 STREAK BROKEN!",
      description: `You lost your ${currentStreak}-day streak. But you can start again!`,
      variant: "destructive",
    });
    setCurrentScreen(0);
  };

  const handleTakePhoto = () => {
    toast({
      title: "📸 Photo captured",
      description: "Rate your guilt and regret below",
    });
  };

  const screens = [
    <DashboardScreen 
      currentStreak={currentStreak}
      totalSaved={totalSaved}
      avgGuiltScore={avgGuiltScore}
      onLogJunkFood={handleLogJunkFood}
    />,
    <LogScreen onSubmitLog={handleSubmitLog} onTakePhoto={handleTakePhoto} />,
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
