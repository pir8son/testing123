import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface GenerationNoticePopupProps {
  onClose: () => void;
}

const GenerationNoticePopup: React.FC<GenerationNoticePopupProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-6 items-center text-center animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mb-4">
            <SparklesIcon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Generating Your Plan...</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
            This can take a moment. Feel free to explore other parts of the app while the AI works its magic. We'll have your plan ready on the Meal Planner screen when you return.
        </p>
        
        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          OK, Got It!
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

export default GenerationNoticePopup;