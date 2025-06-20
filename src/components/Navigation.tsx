
import React from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Camera, 
  Calendar 
} from 'lucide-react';

interface NavigationProps {
  activeScreen: number;
  onNavigate: (screen: number) => void;
}

export default function Navigation({ activeScreen, onNavigate }: NavigationProps) {
  const navItems = [
    { icon: Calendar, label: 'Dashboard', screen: 0 },
    { icon: Camera, label: 'Log', screen: 1 },
    { icon: TrendingUp, label: 'Progress', screen: 2 },
    { icon: MessageSquare, label: 'Coach', screen: 3 },
    { icon: Users, label: 'Community', screen: 4 },
  ];

  return (
    <div className="bg-black/80 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.screen;
          
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                isActive 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
