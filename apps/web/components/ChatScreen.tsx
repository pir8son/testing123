import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage, Ingredient, LoggedFood, MealPlan, Recipe, UserSettings } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SendIcon } from './icons/SendIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatScreenProps {
  onBack: () => void;
  pantryItems: Ingredient[];
  nutritionLog: LoggedFood[];
  mealPlan: MealPlan | null;
  savedRecipes: Recipe[];
  userSettings: UserSettings;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ 
    onBack, pantryItems, nutritionLog, mealPlan, savedRecipes, userSettings 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your kitchen assistant. I have access to your pantry, nutrition stats, and saved recipes. How can I help you today?",
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContextString = () => {
    const pantryList = pantryItems.map(i => `${i.amount} ${i.name}`).join(', ');
    const savedTitles = savedRecipes.map(r => r.title).join(', ');
    const todayStats = nutritionLog.reduce((acc, item) => {
        acc.calories += item.nutrition.calories;
        return acc;
    }, { calories: 0 });
    
    let context = `PANTRY: ${pantryList || 'Empty'}.\n`;
    context += `SAVED RECIPES: ${savedTitles || 'None'}.\n`;
    context += `NUTRITION TODAY: ${Math.round(todayStats.calories)} calories logged so far.\n`;
    if (mealPlan) {
        context += `MEAL PLAN: Active plan for ${mealPlan.length} days.\n`;
    }
    context += `DIET: ${Array.from(userSettings.dietaryPreferences).join(', ') || 'None'}.`;
    
    return context;
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const context = buildContextString();
    const botResponseText = await getChatResponse(input, context);

    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: 'bot',
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-10">
        <button onClick={onBack} className="p-2 -ml-2 mr-2">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">AI Assistant</h1>
      </header>
      
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-green-600 text-white rounded-br-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-lg'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <UserCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-lg">
                <div className="flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-300"></span>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for a recipe..."
            className="w-full py-3 pl-4 pr-12 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-transparent dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 bg-violet-600 text-white rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;