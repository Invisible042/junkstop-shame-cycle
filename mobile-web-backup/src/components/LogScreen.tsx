import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface LogScreenProps {
  onSubmitLog: (data: {
    photo: File;
    food_type: string;
    guilt_rating: number;
    regret_rating: number;
    estimated_cost?: number;
    location?: string;
  }) => void;
  isSubmitting?: boolean;
}

const LogScreen = ({ onSubmitLog, isSubmitting = false }: LogScreenProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [foodType, setFoodType] = useState('');
  const [guilt, setGuilt] = useState([5]);
  const [regret, setRegret] = useState([5]);
  const [cost, setCost] = useState('');
  const [location, setLocation] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
        toast({
          title: "Photo captured",
          description: "Rate your guilt and regret below",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    if (!photoFile || !foodType.trim()) {
      toast({
        title: "Missing information",
        description: "Please take a photo and describe the food",
        variant: "destructive",
      });
      return;
    }

    const logData = {
      photo: photoFile,
      food_type: foodType.trim(),
      guilt_rating: guilt[0],
      regret_rating: regret[0],
      estimated_cost: cost ? parseFloat(cost) : undefined,
      location: location.trim() || undefined,
    };

    onSubmitLog(logData);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Log Junk Food</h2>
        <p className="text-gray-400 text-sm">Take a photo and rate your feelings</p>
      </div>

      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="text-center">
              {photo ? (
                <div className="space-y-4">
                  <img 
                    src={photo} 
                    alt="Junk food" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCameraCapture}
                      disabled={isSubmitting}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleFileSelect}
                      disabled={isSubmitting}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-400 mb-4">Capture your junk food</p>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCameraCapture}
                        disabled={isSubmitting}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Camera
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleFileSelect}
                        disabled={isSubmitting}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div>
              <Label htmlFor="food-type" className="text-white">What did you eat?</Label>
              <Input
                id="food-type"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                placeholder="e.g., Big Mac, pizza slice, cookies"
                className="bg-gray-800 border-gray-600 text-white mt-1"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label className="text-white">How guilty do you feel? ({guilt[0]}/10)</Label>
              <div className="px-2 py-4">
                <Slider
                  value={guilt}
                  onValueChange={setGuilt}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>No guilt</span>
                <span>Extremely guilty</span>
              </div>
            </div>

            <div>
              <Label className="text-white">How much do you regret this? ({regret[0]}/10)</Label>
              <div className="px-2 py-4">
                <Slider
                  value={regret}
                  onValueChange={setRegret}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>No regret</span>
                <span>Complete regret</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost" className="text-white">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="5.99"
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="McDonald's"
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !photoFile || !foodType.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Confession'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogScreen;