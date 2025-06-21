
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface LogScreenProps {
  onSubmitLog: (data: any) => void;
  onTakePhoto: () => void;
}

const LogScreen = ({ onSubmitLog, onTakePhoto }: LogScreenProps) => {
  const [guiltRating, setGuiltRating] = useState([5]);
  const [regretRating, setRegretRating] = useState([5]);
  const [calories, setCalories] = useState('');

  const handleSubmit = () => {
    onSubmitLog({
      guilt: guiltRating[0],
      regret: regretRating[0],
      calories: calories
    });
  };

  return (
    <div className="h-full flex flex-col p-5 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl">
      <h2 className="text-center text-xl font-bold text-white mb-6">Log Your Junk Food</h2>
      
      <div 
        onClick={onTakePhoto}
        className="bg-white/5 backdrop-blur-lg border-2 border-dashed border-white/30 rounded-2xl h-64 flex flex-col items-center justify-center mb-8 cursor-pointer hover:bg-white/10 transition-all duration-300"
      >
        <Camera className="w-12 h-12 text-white/60 mb-3" />
        <p className="text-white/60">Tap to take photo</p>
      </div>
      
      <div className="space-y-6 flex-1">
        <div>
          <Label className="text-white mb-3 block">How guilty do you feel? ({guiltRating[0]}/10)</Label>
          <Slider
            value={guiltRating}
            onValueChange={setGuiltRating}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
        
        <div>
          <Label className="text-white mb-3 block">How much do you regret this? ({regretRating[0]}/10)</Label>
          <Slider
            value={regretRating}
            onValueChange={setRegretRating}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
        
        <div>
          <Label className="text-white mb-3 block">Estimated calories (optional)</Label>
          <Input
            type="number"
            placeholder="e.g., 650"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-white/50"
          />
        </div>
      </div>
      
      <Button
        onClick={handleSubmit}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-3xl mt-6"
      >
        💔 Break My Streak
      </Button>
    </div>
  );
};

export default LogScreen;
