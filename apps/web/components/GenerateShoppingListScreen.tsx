
import React, { useState } from 'react';
import { Recipe } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface GenerateShoppingListScreenProps {
  savedRecipes: Recipe[];
  onBack: () => void;
  onConfirm: (selectedIds: Set<string>) => void;
  initialSelectedIds: Set<string>;
}

const GenerateShoppingListScreen: React.FC<GenerateShoppingListScreenProps> = ({ savedRecipes, onBack, onConfirm, initialSelectedIds }) => {
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(initialSelectedIds);

    const toggleRecipeSelection = (recipeId: string) => {
        setSelectedRecipeIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(recipeId)) {
                newSet.delete(recipeId);
            } else {
                newSet.add(recipeId);
            }
            return newSet;
        });
    }
    
    const handleConfirm = () => {
        onConfirm(selectedRecipeIds);
    }

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-950 z-20 flex flex-col animate-slide-in">
       <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <button onClick={onBack} className="p-2 -ml-2 mr-2">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Add Recipes to List</h1>
      </header>

      <div className="flex-grow p-4 overflow-y-auto">
        <h2 className="text-gray-600 dark:text-gray-400 font-semibold mb-3">Select recipes to shop for:</h2>
        <div className="space-y-3">
          {savedRecipes.map(recipe => (
            <div key={recipe.id} onClick={() => toggleRecipeSelection(recipe.id)} className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-colors cursor-pointer ${selectedRecipeIds.has(recipe.id) ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 pointer-events-none"
                    checked={selectedRecipeIds.has(recipe.id)}
                    readOnly
                />
                <img src={recipe.imageUrl} alt={recipe.title} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                    <p className="font-bold text-gray-800 dark:text-white">{recipe.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">by @{recipe.creator?.username || 'unknown_chef'}</p>
                </div>
            </div>
          ))}
        </div>
      </div>
      
      <footer className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
            onClick={handleConfirm}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
        >
            Update List ({selectedRecipeIds.size} recipes)
        </button>
      </footer>
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

export default GenerateShoppingListScreen;
