
import React, { useState } from 'react';
import DashboardScreen from '../components/DashboardScreen';
import LogScreen from '../components/LogScreen';
import ProgressScreen from '../components/ProgressScreen';
import ChatScreen from '../components/ChatScreen';
import CommunityScreen from '../components/CommunityScreen';
import Navigation from '../components/Navigation';

export default function Index() {
  const [activeScreen, setActiveScreen] = useState(0);

  const screens = [
    DashboardScreen,
    LogScreen,
    ProgressScreen,
    ChatScreen,
    CommunityScreen,
  ];

  const CurrentScreen = screens[activeScreen];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Phone Container */}
      <div className="w-full max-w-sm h-[800px] bg-black rounded-[40px] p-2 shadow-2xl">
        {/* Screen */}
        <div className="w-full h-full bg-gradient-to-br from-gray-900/50 to-black/50 rounded-[32px] overflow-hidden flex flex-col">
          {/* Content Area */}
          <div className="flex-1 p-4">
            <CurrentScreen onNavigate={setActiveScreen} />
          </div>
          
          {/* Navigation */}
          <Navigation activeScreen={activeScreen} onNavigate={setActiveScreen} />
        </div>
      </div>
    </div>
  );
}
