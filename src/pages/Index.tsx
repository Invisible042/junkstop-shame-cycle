
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Calendar, DollarSign, Target, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface JunkFoodLog {
  id: string;
  photo: string;
  guiltRating: number;
  regretRating: number;
  estimatedCost: number;
  timestamp: Date;
  foodDescription: string;
}

const Index = () => {
  const { toast } = useToast();
  const [currentStreak, setCurrentStreak] = useState(12);
  const [bestStreak, setBestStreak] = useState(28);
  const [totalWasted, setTotalWasted] = useState(147.50);
  const [logs, setLogs] = useState<JunkFoodLog[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [guiltRating, setGuiltRating] = useState([5]);
  const [regretRating, setRegretRating] = useState([5]);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPrideMode = currentStreak >= 7;
  const shameScore = logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + log.guiltRating + log.regretRating, 0) / (logs.length * 2)) : 0;

  const handlePhotoCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string);
        setShowLogForm(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const submitJunkFoodLog = () => {
    if (!capturedPhoto) return;

    const newLog: JunkFoodLog = {
      id: Date.now().toString(),
      photo: capturedPhoto,
      guiltRating: guiltRating[0],
      regretRating: regretRating[0],
      estimatedCost: parseFloat(estimatedCost) || 0,
      timestamp: new Date(),
      foodDescription,
    };

    setLogs(prev => [newLog, ...prev]);
    setTotalWasted(prev => prev + newLog.estimatedCost);
    
    // Break streak with dramatic effect
    if (currentStreak > 0) {
      setCurrentStreak(0);
      toast({
        title: "💔 STREAK BROKEN!",
        description: `You lost your ${currentStreak}-day streak. But you can start again!`,
        variant: "destructive",
      });
    }

    // Reset form
    setCapturedPhoto(null);
    setShowLogForm(false);
    setGuiltRating([5]);
    setRegretRating([5]);
    setEstimatedCost('');
    setFoodDescription('');

    toast({
      title: "Junk food logged",
      description: `Guilt: ${guiltRating[0]}/10, Regret: ${regretRating[0]}/10`,
    });
  };

  const addCleanDay = () => {
    setCurrentStreak(prev => prev + 1);
    if (currentStreak + 1 > bestStreak) {
      setBestStreak(currentStreak + 1);
      toast({
        title: "🎉 NEW RECORD!",
        description: `${currentStreak + 1} days is your best streak yet!`,
      });
    } else {
      toast({
        title: "Clean day added! 🌟",
        description: `${currentStreak + 1} days and counting!`,
      });
    }
  };

  const getMotivationalMessage = () => {
    if (currentStreak === 0) return "Ready for a fresh start?";
    if (currentStreak < 7) return "Building momentum...";
    if (currentStreak < 30) return "You're on fire! 🔥";
    return "Junk Food Warrior! 💪";
  };

  const getCouldHaveBought = () => {
    if (totalWasted < 50) return "a nice meal";
    if (totalWasted < 100) return "quality groceries for a week";
    if (totalWasted < 200) return "a fitness tracker";
    return "a gym membership";
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isPrideMode 
        ? 'bg-gradient-to-br from-green-50 to-emerald-100' 
        : currentStreak === 0 
          ? 'bg-gradient-to-br from-red-50 to-orange-100'
          : 'bg-gradient-to-br from-slate-50 to-blue-50'
    }`}>
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className={`text-3xl font-bold mb-2 ${
            isPrideMode ? 'text-green-800' : currentStreak === 0 ? 'text-red-800' : 'text-slate-800'
          }`}>
            JunkStop
          </h1>
          <p className="text-sm text-slate-600">{getMotivationalMessage()}</p>
        </div>

        {/* Streak Counter - Hero Section */}
        <Card className={`mb-6 border-2 transition-all duration-300 ${
          isPrideMode 
            ? 'border-green-300 shadow-green-200' 
            : currentStreak === 0 
              ? 'border-red-300 shadow-red-200' 
              : 'border-blue-300 shadow-blue-200'
        } shadow-lg`}>
          <CardContent className="pt-6 text-center">
            <div className={`text-6xl font-bold mb-2 transition-colors duration-300 ${
              isPrideMode ? 'text-green-600' : currentStreak === 0 ? 'text-red-600' : 'text-blue-600'
            }`}>
              {currentStreak}
            </div>
            <p className="text-lg font-medium text-slate-700">
              {currentStreak === 0 ? 'Days to rebuild' : 'Clean days'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Best streak: {bestStreak} days
            </p>
            {currentStreak >= 7 && (
              <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium inline-block">
                🏆 On a roll!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={triggerCamera}
            className={`h-24 text-white font-semibold transition-all duration-200 ${
              currentStreak === 0 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-orange-500 hover:bg-orange-600'
            } hover:scale-105 shadow-lg`}
          >
            <div className="flex flex-col items-center">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-sm">Log Junk Food</span>
            </div>
          </Button>
          
          <Button
            onClick={addCleanDay}
            className="h-24 bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <div className="flex flex-col items-center">
              <Target className="w-6 h-6 mb-1" />
              <span className="text-sm">Add Clean Day</span>
            </div>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="shadow-md">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">${totalWasted.toFixed(2)}</p>
                  <p className="text-xs text-slate-600">Wasted on junk</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Could've bought {getCouldHaveBought()}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{logs.length}</p>
                  <p className="text-xs text-slate-600">Junk food logs</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-400" />
              </div>
              {logs.length > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Avg shame: {shameScore}/10
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Logs */}
        {logs.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Wall of Shame
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <img 
                      src={log.photo} 
                      alt="Junk food" 
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{log.foodDescription || 'Junk food'}</p>
                      <p className="text-xs text-slate-600">
                        Guilt: {log.guiltRating}/10 • Regret: {log.regretRating}/10
                      </p>
                      <p className="text-xs text-slate-500">
                        ${log.estimatedCost.toFixed(2)} • {log.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Current streak vs. best</span>
                  <span>{currentStreak}/{bestStreak}</span>
                </div>
                <Progress 
                  value={(currentStreak / Math.max(bestStreak, 1)) * 100} 
                  className="h-2"
                />
              </div>
              
              {currentStreak >= 3 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Keep going!</p>
                  <p className="text-xs text-green-600">
                    You're {7 - currentStreak} days away from a weekly milestone!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hidden file input for camera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCapture}
          className="hidden"
        />

        {/* Log Form Modal */}
        {showLogForm && capturedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-red-700">Log This Junk Food</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img 
                  src={capturedPhoto} 
                  alt="Captured junk food" 
                  className="w-full h-48 object-cover rounded-md"
                />
                
                <div>
                  <Label htmlFor="description">What did you eat?</Label>
                  <Input
                    id="description"
                    value={foodDescription}
                    onChange={(e) => setFoodDescription(e.target.value)}
                    placeholder="e.g., Big Mac meal, chocolate cake..."
                  />
                </div>

                <div>
                  <Label>How guilty do you feel? ({guiltRating[0]}/10)</Label>
                  <Slider
                    value={guiltRating}
                    onValueChange={setGuiltRating}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>How much do you regret this? ({regretRating[0]}/10)</Label>
                  <Slider
                    value={regretRating}
                    onValueChange={setRegretRating}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Estimated cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="e.g., 12.99"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setCapturedPhoto(null);
                      setShowLogForm(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitJunkFoodLog}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Log Shame
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
