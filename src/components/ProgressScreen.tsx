
import React from 'react';
import { Progress } from '@/components/ui/progress';

const ProgressScreen = () => {
  const weeklyData = [
    { day: 'Mon', score: 2.1, percentage: 21 },
    { day: 'Tue', score: 0.0, percentage: 0 },
    { day: 'Wed', score: 0.0, percentage: 0 },
    { day: 'Thu', score: 1.5, percentage: 15 },
    { day: 'Fri', score: 0.0, percentage: 0 },
    { day: 'Sat', score: 0.0, percentage: 0 },
    { day: 'Sun', score: 0.0, percentage: 0 },
  ];

  return (
    <div className="h-full flex flex-col p-5 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl">
      <h2 className="text-center text-xl font-bold text-white mb-6">Your Progress</h2>
      
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 mb-5">
        <div className="text-lg font-bold text-white mb-4">Weekly Shame Score</div>
        <div className="space-y-3">
          {weeklyData.map((item) => (
            <div key={item.day} className="flex items-center justify-between">
              <span className="text-white/80 text-sm w-8">{item.day}</span>
              <div className="flex-1 mx-3">
                <Progress value={item.percentage} className="h-2" />
              </div>
              <span className="text-white/80 text-sm w-8">{item.score}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5">
        <div className="text-lg font-bold text-white mb-3">🤖 AI Pattern Analysis</div>
        <p className="text-white/70 text-sm leading-relaxed">
          Your data shows you're most vulnerable on Mondays and Fridays. Your average guilt score has dropped 40% this month - great progress!
        </p>
      </div>
    </div>
  );
};

export default ProgressScreen;
