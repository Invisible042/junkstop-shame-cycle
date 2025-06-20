
import React from 'react';
import { Camera, DollarSign, TrendingUp, Brain } from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (screen: number) => void;
}

export default function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  // Mock data - in real app this would come from context/API
  const streakData = {
    currentStreak: 7,
    bestStreak: 21,
    moneySaved: 45,
    avgGuiltScore: 2.3,
    totalCalories: 1250
  };

  const aiInsight = "You tend to eat junk food on Fridays around 3pm. Let's prepare for tomorrow!";

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-red-900/20 via-orange-900/20 to-red-800/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">JunkStop</h1>
        <p className="text-white/70 text-sm">Your junk food accountability coach</p>
      </div>

      {/* AI Insight */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-6 border-l-4 border-l-blue-400">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 font-semibold text-sm">AI Insight</span>
        </div>
        <p className="text-white/90 text-sm">{aiInsight}</p>
      </div>

      {/* Streak Counter */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center mb-6">
        <div className="text-5xl font-bold text-green-400 mb-2">{streakData.currentStreak}</div>
        <div className="text-white/80 text-lg">Days Clean</div>
        <div className="text-white/60 text-sm mt-2">Best: {streakData.bestStreak} days</div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">${streakData.moneySaved}</div>
          <div className="text-white/70 text-xs">Money Saved</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{streakData.avgGuiltScore}</div>
          <div className="text-white/70 text-xs">Avg Guilt Score</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-6 text-center">
        <div className="text-xl font-bold text-red-400">{streakData.totalCalories}</div>
        <div className="text-white/70 text-xs">Calories Avoided This Week</div>
      </div>

      {/* CTA Button */}
      <button 
        onClick={() => onNavigate(1)}
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <Camera className="w-5 h-5" />
        Log Junk Food
      </button>
    </div>
  );
}
