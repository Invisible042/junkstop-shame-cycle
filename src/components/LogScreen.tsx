
import React, { useState } from 'react';
import { Camera, Upload, HeartCrack } from 'lucide-react';

interface LogScreenProps {
  onNavigate: (screen: number) => void;
}

export default function LogScreen({ onNavigate }: LogScreenProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [guiltRating, setGuiltRating] = useState(5);
  const [regretRating, setRegretRating] = useState(5);
  const [calories, setCalories] = useState('');
  const [cost, setCost] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoCapture = () => {
    // Mock photo capture - in real app would use camera API
    const mockPhoto = "https://via.placeholder.com/300x200/ff6b6b/ffffff?text=Junk+Food+Photo";
    setPhoto(mockPhoto);
  };

  const handleSubmit = async () => {
    if (!photo) {
      alert('Please take a photo first!');
      return;
    }

    setLoading(true);
    
    // Mock API call to log junk food
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show streak broken animation
    alert('💔 STREAK BROKEN! But don\'t give up - start fresh tomorrow!');
    
    setLoading(false);
    
    // Reset form
    setPhoto(null);
    setGuiltRating(5);
    setRegretRating(5);
    setCalories('');
    setCost('');
    
    // Navigate back to dashboard
    onNavigate(0);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h2 className="text-2xl font-bold text-center text-white mb-6">Log Your Junk Food</h2>

      {/* Photo Section */}
      <div className="mb-6">
        {photo ? (
          <div className="relative">
            <img src={photo} alt="Junk food" className="w-full h-48 object-cover rounded-2xl" />
            <button
              onClick={handlePhotoCapture}
              className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <Camera className="w-8 h-8 text-white" />
              <span className="text-white ml-2">Change Photo</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handlePhotoCapture}
            className="w-full h-48 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center text-white/70 hover:bg-white/20 transition-all"
          >
            <Camera className="w-12 h-12 mb-2" />
            <span>Tap to take photo</span>
          </button>
        )}
      </div>

      {/* Rating Sections */}
      <div className="space-y-6 mb-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
          <label className="block text-white font-semibold mb-3">
            How guilty do you feel? ({guiltRating}/10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={guiltRating}
            onChange={(e) => setGuiltRating(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
          <label className="block text-white font-semibold mb-3">
            How much do you regret this? ({regretRating}/10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={regretRating}
            onChange={(e) => setRegretRating(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-blue-500 to-red-500 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-white/80 font-medium mb-2">Estimated Calories (optional)</label>
          <input
            type="number"
            placeholder="e.g., 650"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-white/50"
          />
        </div>

        <div>
          <label className="block text-white/80 font-medium mb-2">Estimated Cost (optional)</label>
          <input
            type="number"
            placeholder="e.g., 12.50"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-white/50"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !photo}
        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Breaking Streak...
          </>
        ) : (
          <>
            <HeartCrack className="w-5 h-5" />
            Break My Streak
          </>
        )}
      </button>
    </div>
  );
}
