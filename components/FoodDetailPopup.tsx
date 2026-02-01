
import React from 'react';
import { LoggedFood } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface FoodDetailPopupProps {
  foodItem: LoggedFood;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: number; unit: string; color: string }> = ({ label, value, unit, color }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
        <p className="font-semibold text-gray-800 dark:text-gray-100">{label}</p>
        <p className={`font-bold text-lg ${color}`}>{value.toFixed(1)} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{unit}</span></p>
    </div>
);


const FoodDetailPopup: React.FC<FoodDetailPopupProps> = ({ foodItem, onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-4 animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-start mb-2">
            <div>
                 <p className="text-xs font-bold uppercase text-violet-600 dark:text-violet-400">{foodItem.meal}</p>
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">{foodItem.name}</h2>
            </div>
            <button onClick={onClose} className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XCircleIcon className="w-7 h-7" />
            </button>
        </header>

        <div className="space-y-1">
             <div className="flex justify-between items-baseline py-3">
                <p className="font-semibold text-gray-800 dark:text-gray-100">Calories</p>
                <p className="font-bold text-3xl text-green-600 dark:text-green-400">{foodItem.nutrition.calories.toFixed(0)} <span className="text-lg font-medium text-gray-500 dark:text-gray-400">kcal</span></p>
            </div>
            <DetailRow label="Protein" value={foodItem.nutrition.protein} unit="g" color="text-sky-500" />
            <DetailRow label="Carbohydrates" value={foodItem.nutrition.carbs} unit="g" color="text-amber-500" />
            <DetailRow label="Fat" value={foodItem.nutrition.fat} unit="g" color="text-pink-500" />
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

export default FoodDetailPopup;
