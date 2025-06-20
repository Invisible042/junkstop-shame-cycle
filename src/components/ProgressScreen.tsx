
import React from 'react';
import { TrendingUp, Calendar, DollarSign, Zap } from 'lucide-react';

interface ProgressScreenProps {
  onNavigate: (screen: number) => void;
}

export default function ProgressScreen({ onNavigate }: ProgressScreenProps) {
  // Mock data - would come from API/context in real app
  const weeklyData = [
    { day: 'Mon', score: 2.1, percentage: 21 },
    { day: 'Tue', score: 0.0, percentage: 0 },
    { day: 'Wed', score: 0.0, percentage: 0 },
    { day: 'Thu', score: 0.0, percentage: 0 },
    { day: 'Fri', score: 4.2, percentage: 42 },
    { day: 'Sat', score: 0.0, percentage: 0 },
    { day: 'Sun', score: 0.0, percentage: 0 }
  ];

  const monthlyStats = {
    totalSaved: 180,
    caloriesAvoided: 8500,
    avgStreakLength: 12,
    improvement: 40
  };

  const achievements = [
    { name: 'First Week Clean', unlocked: true, icon: '🏆' },
    { name: 'Money Saver', unlocked: true, icon: '💰' },
    { name: 'Resisted 10 Temptations', unlocked: false, icon: '💪' },
    { name: 'Month Champion', unlocked: false, icon: '👑' }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-800/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-center text-white mb-6">Your Progress</h2>

      {/* Weekly Shame Score Chart */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Weekly Shame Score</h3>
        </div>
        <div className="space-y-3">
          {weeklyData.map((data, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-white/80 text-sm w-8">{data.day}</span>
              <div className="flex-1 mx-3 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.percentage}%` }}
                ></div>
              </div>
              <span className="text-white text-sm w-8 text-right">{data.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
          <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-400">${monthlyStats.totalSaved}</div>
          <div className="text-white/70 text-xs">Saved This Month</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
          <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-yellow-400">{monthlyStats.caloriesAvoided}</div>
          <div className="text-white/70 text-xs">Calories Avoided</div>
        </div>
      </div>

      {/* AI Pattern Analysis */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
          <h3 className="text-lg font-semibold text-white">AI Pattern Analysis</h3>
        </div>
        <p className="text-white/80 text-sm leading-relaxed">
          Your data shows you're most vulnerable on Mondays and Fridays. Your average guilt score has dropped {monthlyStats.improvement}% this month - great progress! You typically crave junk food around 3pm, so plan healthy snacks for that time.
        </p>
      </div>

      {/* Achievements */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Achievements</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`p-3 rounded-xl text-center transition-all ${
                achievement.unlocked 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <div className={`text-xs ${achievement.unlocked ? 'text-green-400' : 'text-white/50'}`}>
                {achievement.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
