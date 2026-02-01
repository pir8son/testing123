
import React, { useState } from 'react';
import { NutritionGoals } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface SetGoalsScreenProps {
    onClose: () => void;
    currentGoals: NutritionGoals;
    onSave: (newGoals: NutritionGoals) => void;
}

const GoalInput: React.FC<{ label: string, value: number, onChange: (value: number) => void, unit: string }> = ({ label, value, onChange, unit }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</label>
        <div className="relative">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full p-3 text-lg font-semibold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">{unit}</span>
        </div>
    </div>
);


const SetGoalsScreen: React.FC<SetGoalsScreenProps> = ({ onClose, currentGoals, onSave }) => {
    const [goals, setGoals] = useState(currentGoals);

    const handleSave = () => {
        onSave(goals);
    };

    return (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-40 flex flex-col animate-slide-in">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
                <button onClick={onClose} className="p-2 -ml-2 mr-2">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Set Your Goals</h1>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-6">
                <GoalInput 
                    label="Calories" 
                    unit="kcal"
                    value={goals.calories}
                    onChange={(val) => setGoals(g => ({...g, calories: val}))}
                />
                <GoalInput 
                    label="Protein" 
                    unit="grams"
                    value={goals.protein}
                    onChange={(val) => setGoals(g => ({...g, protein: val}))}
                />
                 <GoalInput 
                    label="Carbohydrates" 
                    unit="grams"
                    value={goals.carbs}
                    onChange={(val) => setGoals(g => ({...g, carbs: val}))}
                />
                 <GoalInput 
                    label="Fat" 
                    unit="grams"
                    value={goals.fat}
                    onChange={(val) => setGoals(g => ({...g, fat: val}))}
                />
            </div>
            
             <footer className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                 <button onClick={handleSave} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
                    Save Goals
                </button>
            </footer>

             <style>{`
                @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in { animation: slide-in 0.3s ease-out; }
                input[type="number"]::-webkit-inner-spin-button, 
                input[type="number"]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                input[type="number"] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
};

export default SetGoalsScreen;
