
import React from 'react';

interface NavigationProps {
  currentScreen: number;
  onScreenChange: (screen: number) => void;
}

const Navigation = ({ currentScreen, onScreenChange }: NavigationProps) => {
  return (
    <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-3 z-50">
      {[0, 1, 2, 3, 4].map((index) => (
        <button
          key={index}
          onClick={() => onScreenChange(index)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            currentScreen === index
              ? 'bg-red-500 shadow-lg shadow-red-500/50'
              : 'bg-white/30 hover:bg-white/50'
          }`}
        />
      ))}
    </div>
  );
};

export default Navigation;
