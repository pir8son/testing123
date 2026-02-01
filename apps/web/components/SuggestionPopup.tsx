import React, { useState } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

interface SuggestionPopupProps {
  type: 'Category' | 'Collection';
  onClose: () => void;
  onSubmit: (suggestion: string) => void;
}

const SuggestionPopup: React.FC<SuggestionPopupProps> = ({ type, onClose, onSubmit }) => {
    const [suggestion, setSuggestion] = useState('');
    
    const handleSubmit = () => {
        if (!suggestion.trim()) return;
        onSubmit(suggestion);
    }

  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-6 animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Suggest a {type}</h2>
            <button onClick={onClose} className="p-1 -mr-2 -mt-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XCircleIcon className="w-7 h-7" />
            </button>
        </header>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Have an idea for a new {type.toLowerCase()}? Let us know!</p>

        <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder={`e.g., "Baking Recipes" or "Thai Cuisine"`}
            className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[80px]"
        />
        
        <button 
            onClick={handleSubmit}
            disabled={!suggestion.trim()}
            className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          Submit Suggestion
        </button>
        
        <style>{`
            @keyframes popup {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-popup {
                animation: popup 0.2s ease-out;
            }
        `}</style>
      </div>
    </div>
  );
};

export default SuggestionPopup;
