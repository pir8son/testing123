
import React from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SmartSuggestion } from '../types';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface SmartSuggestionsScreenProps {
  onClose: () => void;
  isLoading: boolean;
  suggestions: SmartSuggestion[];
}

const LoadingSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
);

const SmartSuggestionsScreen: React.FC<SmartSuggestionsScreenProps> = ({
  onClose,
  isLoading,
  suggestions,
}) => {
  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-30 flex flex-col animate-slide-in">
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <button onClick={onClose} className="p-2 -ml-2 mr-2">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Smart Suggestions</h1>
      </header>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-start gap-3">
            <LightbulbIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
            <p className="text-green-800 dark:text-green-200 text-sm">Based on your saved recipes and preferences, here are a few new ideas you might love!</p>
        </div>
        
        {isLoading ? (
            <div className="space-y-4">
                <LoadingSkeleton />
                <LoadingSkeleton />
                <LoadingSkeleton />
            </div>
        ) : (
            <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{suggestion.recipeName}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{suggestion.description}</p>
                        
                        <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg flex items-start gap-2">
                            <SparklesIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-green-800 dark:text-green-200 font-medium">
                                <span className="font-bold">Why you'll like it:</span> {suggestion.reason}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
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

export default SmartSuggestionsScreen;
