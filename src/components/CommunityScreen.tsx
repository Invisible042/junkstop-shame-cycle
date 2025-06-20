
import React, { useState } from 'react';
import { Heart, MessageSquare, Plus, Trophy, Users } from 'lucide-react';

interface Confession {
  id: string;
  text: string;
  timeAgo: string;
  likes: number;
  comments: number;
  shameLevel: number;
  isPositive: boolean;
}

interface CommunityScreenProps {
  onNavigate: (screen: number) => void;
}

export default function CommunityScreen({ onNavigate }: CommunityScreenProps) {
  const [activeTab, setActiveTab] = useState<'confessions' | 'leaderboard'>('confessions');
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState('');

  const confessions: Confession[] = [
    {
      id: '1',
      text: "Broke my 14-day streak with a whole bag of chips and 3 donuts. Feeling terrible but getting back on track tomorrow.",
      timeAgo: "2 hours ago",
      likes: 12,
      comments: 5,
      shameLevel: 9,
      isPositive: false
    },
    {
      id: '2',
      text: "Day 30 clean! Finally fitting into my old jeans. To anyone struggling - it gets easier!",
      timeAgo: "5 hours ago",
      likes: 24,
      comments: 8,
      shameLevel: 10,
      isPositive: true
    },
    {
      id: '3',
      text: "The AI coach just called me out for eating junk food every Tuesday at 4pm. It's scary how accurate it is...",
      timeAgo: "1 day ago",
      likes: 18,
      comments: 3,
      shameLevel: 6,
      isPositive: false
    }
  ];

  const leaderboard = [
    { rank: 1, name: "HealthyHero", streak: 45, avatar: "🏆" },
    { rank: 2, name: "CleanEater23", streak: 32, avatar: "🥈" },
    { rank: 3, name: "NoJunkJoe", streak: 28, avatar: "🥉" },
    { rank: 4, name: "FreshStart", streak: 21, avatar: "💪" },
    { rank: 5, name: "WillpowerWin", streak: 18, avatar: "⭐" }
  ];

  const handleLike = (id: string) => {
    // Mock like functionality
    console.log('Liked confession:', id);
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    
    // Mock post functionality
    console.log('New confession:', newPost);
    setNewPost('');
    setShowPostModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-green-900/20 via-teal-900/20 to-green-800/20 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 text-center border-b border-white/10">
        <h2 className="text-2xl font-bold text-white mb-2">Community</h2>
        <p className="text-white/70 text-sm">Connect with others on the same journey</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white/5 mx-4 mt-4 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('confessions')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'confessions'
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Confessions
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          Leaderboard
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'confessions' && (
          <>
            {/* Add Confession Button */}
            <button
              onClick={() => setShowPostModal(true)}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-xl mb-4 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Share Anonymous Confession
            </button>

            {/* Confessions Feed */}
            <div className="space-y-4">
              {confessions.map((confession) => (
                <div key={confession.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                  <div className="text-white/60 text-xs mb-2">
                    Anonymous • {confession.timeAgo}
                  </div>
                  <p className="text-white text-sm mb-3 leading-relaxed">
                    {confession.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(confession.id)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">{confession.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">{confession.comments}</span>
                      </button>
                    </div>
                    <span className={`text-xs font-bold ${
                      confession.isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {confession.isPositive ? 'Pride' : 'Shame'} Level: {confession.shameLevel}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center justify-between ${
                  user.rank <= 3 ? 'border-yellow-400/30 bg-yellow-400/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{user.avatar}</div>
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-white/60 text-sm">{user.streak} day streak</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  #{user.rank}
                </div>
              </div>
            ))}
            
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 rounded-xl p-4 text-center mt-6">
              <div className="text-white font-medium mb-1">Your Position</div>
              <div className="text-white/70 text-sm">Rank #247 - Keep going!</div>
            </div>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-4">Anonymous Confession</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your experience anonymously..."
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-white/50 text-sm resize-none h-32"
              maxLength={500}
            />
            <div className="text-white/60 text-xs mt-2 mb-4">
              {newPost.length}/500 characters
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPostModal(false)}
                className="flex-1 bg-white/10 border border-white/20 text-white py-2 px-4 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!newPost.trim()}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 disabled:opacity-50 text-white py-2 px-4 rounded-xl text-sm"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
