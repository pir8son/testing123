import React from 'react';

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div 
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-6 animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            No, thanks
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-colors"
          >
            Yes, analyze
          </button>
        </div>
        
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

export default ConfirmationDialog;
