
import React, { useState } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SendIcon } from './icons/SendIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';

interface SmartSwapsScreenProps {
  onClose: () => void;
  getSwaps: (query: string) => Promise<string>;
}

const SmartSwapsScreen: React.FC<SmartSwapsScreenProps> = ({ onClose, getSwaps }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSwaps = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse('');
    try {
      const result = await getSwaps(query);
      setResponse(result);
    } catch (error) {
      console.error(error);
      setResponse("Sorry, I couldn't find any swaps. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGetSwaps();
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-30 flex flex-col animate-slide-in">
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <button onClick={onClose} className="p-2 -ml-2 mr-2">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Smart Swaps</h1>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <RefreshCwIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Need a substitute for an ingredient? Or want to make a dish healthier? Just ask!
            <br />
            e.g., "Healthier alternative to sugar"
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-center min-h-[100px]">
            <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-0"></span>
                <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        ) : response ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 mt-1">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{response}</p>
            </div>
          </div>
        ) : null}
      </div>

      <footer className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Substitute for eggs in baking"
            className="w-full py-3 pl-4 pr-12 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400"
            disabled={isLoading}
          />
          <button
            onClick={handleGetSwaps}
            disabled={isLoading || query.trim() === ''}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 bg-violet-600 text-white rounded-full disabled:bg-gray-400 transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </footer>
       <style>{`
            @keyframes slide-in {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            .animate-slide-in {
                animation: slide-in 0.3s ease-out;
            }
        `}</style>
    </div>
  );
};

export default SmartSwapsScreen;
