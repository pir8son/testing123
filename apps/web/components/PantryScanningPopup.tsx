
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface PantryScanningPopupProps {
  onClose: () => void;
}

const PantryScanningPopup: React.FC<PantryScanningPopupProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-6 items-center text-center animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mb-4 relative">
            <SparklesIcon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            <div className="absolute inset-0 border-2 border-violet-300 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Scanning Your Fridge...</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
            This should only take a few seconds. Feel free to wait, or close this and continue using the app. We'll show you the results when they're ready.
        </p>
        
        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          OK, Got It
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

export default PantryScanningPopup;
