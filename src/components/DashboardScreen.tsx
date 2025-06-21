
import React from 'react';
import { Camera, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardScreenProps {
  currentStreak: number;
  totalSaved: number;
  avgGuiltScore: number;
  onLogJunkFood: () => void;
}

const DashboardScreen = ({ currentStreak, totalSaved, avgGuiltScore, onLogJunkFood }: DashboardScreenProps) => {
  return (
    <div className="h-full flex flex-col p-5 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">JunkStop</h1>
        <p className="text-gray-300 text-sm">Your junk food accountability coach</p>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 mb-6">
        <div className="text-sm font-semibold text-green-300 mb-2">🤖 AI Insight</div>
        <div className="text-xs text-gray-200">
          You tend to eat junk food on Fridays around 3pm. Let's prepare for tomorrow!
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center mb-8">
        <div className="text-5xl font-bold text-white mb-2">{currentStreak}</div>
        <div className="text-white/80">Days Clean</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">${totalSaved}</div>
          <div className="text-xs text-gray-300">Money Saved</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">{avgGuiltScore}</div>
          <div className="text-xs text-gray-300">Avg Guilt Score</div>
        </div>
      </div>
      
      <Button
        onClick={onLogJunkFood}
        className="bg-white hover:bg-gray-100 text-red-600 font-bold py-4 rounded-3xl transition-all duration-200 hover:scale-105"
      >
        <Camera className="w-5 h-5 mr-2" />
        Log Junk Food
      </Button>
    </div>
  );
};

export default DashboardScreen;
