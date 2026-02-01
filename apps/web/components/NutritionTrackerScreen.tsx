
import React from 'react';
import { LoggedFood, NutritionGoals } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { BarcodeIcon } from './icons/BarcodeIcon';

interface NutritionTrackerScreenProps {
    onClose: () => void;
    log: LoggedFood[];
    goals: NutritionGoals;
    onAddFood: () => void;
    onShowHistory: () => void;
    onRemoveFood: (foodId: string) => void;
    onResetLog: () => void;
    onEditGoals: () => void;
    onShowDetails: (foodItem: LoggedFood) => void;
    onScanBarcode: () => void;
}

const ProgressBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const MacroStat: React.FC<{ label: string; value: number; goal: number; color: string }> = ({ label, value, goal, color }) => (
    <div className="flex-1">
        <div className="flex justify-between items-baseline mb-1">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{Math.round(value)}</span> / {goal}g
            </p>
        </div>
        <ProgressBar value={value} max={goal} color={color} />
    </div>
);

const NutritionTrackerScreen: React.FC<NutritionTrackerScreenProps> = ({ onClose, log, goals, onAddFood, onShowHistory, onRemoveFood, onResetLog, onEditGoals, onShowDetails, onScanBarcode }) => {
    const dailyTotals = log.reduce((acc, item) => {
        acc.calories += item.nutrition.calories;
        acc.protein += item.nutrition.protein;
        acc.carbs += item.nutrition.carbs;
        acc.fat += item.nutrition.fat;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const meals: Record<LoggedFood['meal'], LoggedFood[]> = {
        Breakfast: log.filter(item => item.meal === 'Breakfast'),
        Lunch: log.filter(item => item.meal === 'Lunch'),
        Dinner: log.filter(item => item.meal === 'Dinner'),
        Snacks: log.filter(item => item.meal === 'Snacks'),
    };

    return (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-30 flex flex-col animate-slide-in">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg">
                <div className="flex items-center">
                    <button onClick={onClose} className="p-2 -ml-2 mr-2">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Nutrition Tracker</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onScanBarcode} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <BarcodeIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onShowHistory} className="text-sm font-semibold text-green-600 dark:text-green-400">History</button>
                </div>
            </header>

            <div className="flex-grow p-4 overflow-y-auto space-y-6">
                {/* Daily Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                             <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                             <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{Math.round(dailyTotals.calories)} <span className="text-lg font-medium text-gray-500">/ {goals.calories} kcal</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onEditGoals} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <EditIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                            <button onClick={onResetLog} className="text-xs font-semibold text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-400 px-3 py-1 rounded-full">Clear All</button>
                        </div>
                    </div>
                    <ProgressBar value={dailyTotals.calories} max={goals.calories} color="bg-green-500" />
                    <div className="flex items-center gap-4 mt-4">
                        <MacroStat label="Protein" value={dailyTotals.protein} goal={goals.protein} color="bg-sky-500" />
                        <MacroStat label="Carbs" value={dailyTotals.carbs} goal={goals.carbs} color="bg-amber-500" />
                        <MacroStat label="Fat" value={dailyTotals.fat} goal={goals.fat} color="bg-pink-500" />
                    </div>
                </div>

                {/* Meals */}
                {Object.entries(meals).map(([mealName, items]) => (
                    <div key={mealName}>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{mealName}</h2>
                            <button onClick={onAddFood} className="p-1">
                                <PlusCircleIcon className="w-6 h-6 text-green-600" />
                            </button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 space-y-1">
                            {items.length > 0 ? (
                                items.map(item => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => onShowDetails(item)}
                                        className="w-full flex justify-between items-center text-sm p-1 group rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <p className="font-semibold text-gray-700 dark:text-gray-200 flex-1 min-w-0 truncate pr-2 text-left">{item.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{Math.round(item.nutrition.calories)} kcal</p>
                                            <button onClick={(e) => { e.stopPropagation(); onRemoveFood(item.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                <TrashIcon className="w-4 h-4 text-red-500"/>
                                            </button>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">No items logged</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <footer className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                 <button onClick={onAddFood} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <PlusCircleIcon className="w-5 h-5"/>
                    Add Food
                </button>
            </footer>

            <style>{`
                @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in { animation: slide-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default NutritionTrackerScreen;
