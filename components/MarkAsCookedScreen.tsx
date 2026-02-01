import React from 'react';
import { Ingredient, Recipe } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface MarkAsCookedScreenProps {
  onClose: () => void;
  pantryItems: Ingredient[];
  recipes: Recipe[];
  onCook: (recipeId: string) => void;
}

const MarkAsCookedScreen: React.FC<MarkAsCookedScreenProps> = ({ onClose, pantryItems, recipes, onCook }) => {
    const pantryItemNames = new Set(pantryItems.map(item => item.name.toLowerCase()));
    
    const cookableRecipes = recipes.filter(recipe => 
        recipe.ingredients.length > 0 && 
        recipe.ingredients.every(ingredient => pantryItemNames.has(ingredient.name.toLowerCase()))
    );

    return (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-40 flex flex-col animate-slide-in">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
                <button onClick={onClose} className="p-2 -ml-2 mr-2">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Mark Recipe as Cooked</h1>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select a recipe you've cooked to remove its ingredients from your pantry.</p>

                {cookableRecipes.length > 0 ? (
                    <div className="space-y-3">
                        {cookableRecipes.map(recipe => (
                            <div key={recipe.id} className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700">
                                <img src={recipe.imageUrl} alt={recipe.title} className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex-grow">
                                    <p className="font-bold text-gray-800 dark:text-white">{recipe.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{recipe.ingredients.length} ingredients</p>
                                </div>
                                <button onClick={() => onCook(recipe.id)} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-lg hover:bg-green-200">
                                    <CheckCircleIcon className="w-5 h-5"/>
                                    Cooked
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500">No recipes can be made with your current pantry.</p>
                    </div>
                )}
            </div>
             <style>{`
              @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
              .animate-slide-in { animation: slide-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default MarkAsCookedScreen;
