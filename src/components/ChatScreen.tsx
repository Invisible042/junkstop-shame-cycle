
import React, { useState } from 'react';
import { Send, Brain } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
}

interface ChatScreenProps {
  onNavigate: (screen: number) => void;
}

export default function ChatScreen({ onNavigate }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! I noticed you're approaching your usual Friday 3pm craving time. How are you feeling right now?",
      isAI: true,
      timestamp: new Date(Date.now() - 10000)
    },
    {
      id: '2',
      text: "I'm really tempted to get McDonald's...",
      isAI: false,
      timestamp: new Date(Date.now() - 5000)
    },
    {
      id: '3',
      text: "I get it. You've been clean for 7 days though - that's $45 saved! Remember what you told me about wanting to buy those new shoes? What if you walked past McDonald's and went to the shoe store instead?",
      isAI: true,
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickResponses = [
    "I'm feeling tempted",
    "How am I doing?", 
    "I need motivation",
    "Help me resist",
    "I just failed"
  ];

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isAI: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponses = [
        "You're stronger than your cravings! Remember why you started this journey.",
        "That's a normal feeling. Your 7-day streak shows you have the willpower. What's one healthy thing you can do right now?",
        "I believe in you! You've saved $45 this week by making better choices. Keep going!",
        "Let's think about this differently. What would your future self thank you for doing right now?",
        "It's okay to feel tempted. The fact that you're here talking to me shows you're fighting it. That's growth!"
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isAI: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickResponse = (response: string) => {
    setInputText(response);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-800/20 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">AI Coach</h2>
        </div>
        <p className="text-white/80 text-sm">Your personal junk food coach</p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.isAI
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Responses */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickResponses.map((response, index) => (
            <button
              key={index}
              onClick={() => handleQuickResponse(response)}
              className="whitespace-nowrap bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-full text-xs hover:bg-white/20 transition-all"
            >
              {response}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your coach anything..."
            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/50 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className="bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-50 p-2 rounded-full hover:scale-105 transition-all"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
