
import React, { useState } from 'react';
import { LoggedFood } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { BarcodeIcon } from './icons/BarcodeIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface AddFoodScreenProps {
  onClose: () => void;
  onLogFood: (query: string, meal: LoggedFood['meal']) => void;
  isLoading: boolean;
  onScanBarcode: () => void;
}

const mealTypes: LoggedFood['meal'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const AddFoodScreen: React.FC<AddFoodScreenProps> = ({ onClose, onLogFood, isLoading, onScanBarcode }) => {
  const [query, setQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<LoggedFood['meal']>('Breakfast');

  const handleLog = () => {
    if (!query.trim() || isLoading) return;
    onLogFood(query, selectedMeal);
  };

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-40 flex flex-col animate-slide-in">
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <button onClick={onClose} className="p-2 -ml-2 mr-2">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Add Food</h1>
      </header>

      <div className="flex-grow p-4 space-y-6">
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4 flex items-start gap-3">
            <SparklesIcon className="w-6 h-6 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-1" />
            <p className="text-violet-800 dark:text-violet-200 text-sm">
                Use natural language! Try "2 eggs and a slice of toast with butter" or "a bowl of oatmeal with blueberries".
            </p>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">What did you eat?</label>
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., A chicken salad sandwich on whole wheat bread"
                className="w-full p-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[100px]"
                disabled={isLoading}
            />
        </div>
        
         <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Meal</label>
            <div className="grid grid-cols-2 gap-3">
                {mealTypes.map(meal => (
                    <button 
                        key={meal}
                        onClick={() => setSelectedMeal(meal)}
                        className={`py-2 px-3 text-sm font-semibold rounded-lg border-2 transition-colors ${
                            selectedMeal === meal
                            ? 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                    >
                        {meal}
                    </button>
                ))}
            </div>
        </div>

        <button 
            onClick={onScanBarcode}
            className="w-full flex items-center justify-center gap-3 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
            <BarcodeIcon className="w-6 h-6" />
            Scan a Barcode
        </button>
      </div>

      <footer className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
            onClick={handleLog}
            disabled={isLoading || !query.trim()}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
            </>
          ) : 'Log Food'}
        </button>
      </footer>

      <style>{`
          @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AddFoodScreen;
