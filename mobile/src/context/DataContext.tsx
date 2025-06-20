import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JunkFoodLog {
  id: string;
  photoUri: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  guiltRating: number;
  regretRating: number;
  estimatedCalories: number;
  estimatedCost?: number;
  aiMessage?: string;
}

interface DataContextType {
  logs: JunkFoodLog[];
  currentStreak: number;
  bestStreak: number;
  addLog: (log: Omit<JunkFoodLog, 'id' | 'timestamp'>) => Promise<void>;
  getWeekStats: () => {
    avgGuilt: number;
    avgRegret: number;
    totalCalories: number;
    totalCost: number;
    frequency: number;
  };
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<JunkFoodLog[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    calculateStreak();
  }, [logs]);

  const loadStoredData = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem('junkFoodLogs');
      const storedBestStreak = await AsyncStorage.getItem('bestStreak');
      
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
      
      if (storedBestStreak) {
        setBestStreak(parseInt(storedBestStreak));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newLogs: JunkFoodLog[], newBestStreak?: number) => {
    try {
      await AsyncStorage.setItem('junkFoodLogs', JSON.stringify(newLogs));
      if (newBestStreak !== undefined) {
        await AsyncStorage.setItem('bestStreak', newBestStreak.toString());
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const calculateStreak = () => {
    if (logs.length === 0) {
      setCurrentStreak(0);
      return;
    }

    const now = Date.now();
    const lastLogDate = Math.max(...logs.map(log => log.timestamp));
    const daysSinceLastLog = Math.floor((now - lastLogDate) / (1000 * 60 * 60 * 24));
    
    setCurrentStreak(daysSinceLastLog);
  };

  const addLog = async (logData: Omit<JunkFoodLog, 'id' | 'timestamp'>) => {
    const newLog: JunkFoodLog = {
      ...logData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const newLogs = [...logs, newLog];
    setLogs(newLogs);

    // Update best streak if current streak was better
    if (currentStreak > bestStreak) {
      setBestStreak(currentStreak);
      await saveData(newLogs, currentStreak);
    } else {
      await saveData(newLogs);
    }

    // Reset current streak to 0 since we just logged junk food
    setCurrentStreak(0);
  };

  const getWeekStats = () => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weekLogs = logs.filter(log => log.timestamp >= oneWeekAgo);

    if (weekLogs.length === 0) {
      return {
        avgGuilt: 0,
        avgRegret: 0,
        totalCalories: 0,
        totalCost: 0,
        frequency: 0,
      };
    }

    const totalGuilt = weekLogs.reduce((sum, log) => sum + log.guiltRating, 0);
    const totalRegret = weekLogs.reduce((sum, log) => sum + log.regretRating, 0);
    const totalCalories = weekLogs.reduce((sum, log) => sum + log.estimatedCalories, 0);
    const totalCost = weekLogs.reduce((sum, log) => sum + (log.estimatedCost || 0), 0);

    return {
      avgGuilt: totalGuilt / weekLogs.length,
      avgRegret: totalRegret / weekLogs.length,
      totalCalories,
      totalCost,
      frequency: weekLogs.length,
    };
  };

  return (
    <DataContext.Provider value={{
      logs,
      currentStreak,
      bestStreak,
      addLog,
      getWeekStats,
      loading,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}