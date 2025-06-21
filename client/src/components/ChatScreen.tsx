
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages] = useState([
    {
      type: 'ai',
      text: "Hey! I noticed you're approaching your usual Friday 3pm craving time. How are you feeling right now?"
    },
    {
      type: 'user',
      text: "I'm really tempted to get McDonald's..."
    },
    {
      type: 'ai',
      text: "I get it. You've been clean for 7 days though - that's $45 saved! Remember what you told me about wanting to buy those new shoes? What if you walked past McDonald's and went to the shoe store instead?"
    }
  ]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl">
      <div className="bg-red-600/90 backdrop-blur-lg p-5 text-center border-b border-white/20">
        <h2 className="text-xl font-bold text-white">🤖 AI Coach</h2>
        <p className="text-sm text-white/80">Your personal junk food coach</p>
      </div>
      
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] p-4 rounded-2xl ${
              msg.type === 'ai'
                ? 'bg-blue-600/20 backdrop-blur-lg border border-blue-400/30 text-blue-200'
                : 'bg-red-600/20 backdrop-blur-lg border border-red-400/30 text-red-200 ml-auto'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="p-5 bg-white/10 backdrop-blur-lg border-t border-white/20 flex gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-white/50 rounded-3xl"
        />
        <Button className="bg-red-600 hover:bg-red-700 rounded-full w-12 h-12 p-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatScreen;
