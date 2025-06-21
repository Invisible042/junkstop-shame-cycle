
import React from 'react';
import { Button } from '@/components/ui/button';

const CommunityScreen = () => {
  const confessions = [
    {
      user: 'Anonymous • 2 hours ago',
      text: 'Broke my 14-day streak with a whole bag of chips and 3 donuts. Feeling terrible but getting back on track tomorrow.',
      shameLevel: 9,
      type: 'shame'
    },
    {
      user: 'Anonymous • 5 hours ago',
      text: 'Day 30 clean! Finally fitting into my old jeans. To anyone struggling - it gets easier!',
      shameLevel: 10,
      type: 'pride'
    },
    {
      user: 'Anonymous • 1 day ago',
      text: "The AI coach just called me out for eating junk food every Tuesday at 4pm. It's scary how accurate it is...",
      shameLevel: 6,
      type: 'shame'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl">
      <div className="p-5 text-center border-b border-white/20">
        <h2 className="text-2xl font-bold text-white mb-2">Anonymous Confessions</h2>
        <p className="text-white/70 text-sm">Share your struggles, support others</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {confessions.map((confession, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5"
          >
            <div className="text-xs text-white/60 mb-2">{confession.user}</div>
            <div className="text-sm text-white/90 mb-3 leading-relaxed">{confession.text}</div>
            <div className="flex justify-between items-center">
              <Button className="bg-green-600/80 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-2xl">
                💪 You got this!
              </Button>
              <span className={`text-xs font-bold ${
                confession.type === 'pride' ? 'text-green-400' : 'text-red-400'
              }`}>
                {confession.type === 'pride' ? 'Pride' : 'Shame'} Level: {confession.shameLevel}/10
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityScreen;
