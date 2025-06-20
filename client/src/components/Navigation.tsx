
import React from 'react';
import { Home, Camera, TrendingUp, MessageCircle, Users } from 'lucide-react';

interface NavigationProps {
  currentScreen: number;
  onScreenChange: (screen: number) => void;
}

const Navigation = ({ currentScreen, onScreenChange }: NavigationProps) => {
  const navItems = [
    { icon: Home, label: 'Dashboard' },
    { icon: Camera, label: 'Log' },
    { icon: TrendingUp, label: 'Progress' },
    { icon: MessageCircle, label: 'Chat' },
    { icon: Users, label: 'Community' }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-white/10">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onScreenChange(index)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                currentScreen === index
                  ? 'text-red-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
