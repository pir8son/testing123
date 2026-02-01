import React from 'react';
import { Ingredient } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { PackageIcon } from './icons/PackageIcon';
import { categorizeIngredients, getCategoryIcon, getIngredientIcon } from '../utils/ingredientUtils';
import { PlusIcon } from './icons/PlusIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { Trash2Icon } from './icons/Trash2Icon';

interface PantryScreenProps {
  items: Ingredient[];
  onBack: () => void;
  onAddItem: () => void;
  onRemoveItem: (itemName: string) => void;
  onCookRecipe: () => void;
}

const PantryScreen: React.FC<PantryScreenProps> = ({ items, onBack, onAddItem, onRemoveItem, onCookRecipe }) => {
  const categorizedItems = categorizeIngredients(items);

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-20 flex flex-col animate-slide-in">
       <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 mr-2">
              <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">My Pantry</h1>
        </div>
        <div className="flex items-center gap-2">
             <button onClick={onCookRecipe} className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-100 rounded-lg flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4" />
                Cook Recipe
            </button>
             <button onClick={onAddItem} className="p-2 bg-green-600 text-white rounded-full">
                <PlusIcon className="w-5 h-5" />
            </button>
        </div>
      </header>

      <div className="flex-grow p-4 overflow-y-auto">
        {items.length > 0 ? (
            <div className="space-y-4">
                {Object.entries(categorizedItems).map(([category, ingredients]) => {
                    const CategoryIcon = getCategoryIcon(category);
                    return (
                        <div key={category}>
                            <div className="flex items-center gap-3 mb-2">
                                <CategoryIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                <h2 className="font-bold text-gray-700 dark:text-gray-200">{category} ({ingredients.length})</h2>
                            </div>
                            <div className="space-y-2">
                                {ingredients.map((item, index) => {
                                    const IngredientIcon = getIngredientIcon(item.name);
                                    return (
                                    <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg flex items-center gap-3 border border-gray-200 dark:border-gray-700 group">
                                        <div className="bg-amber-50 dark:bg-amber-900/30 p-1.5 rounded-full">
                                            <IngredientIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{item.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.amount}</p>
                                        </div>
                                        <button onClick={() => onRemoveItem(item.name)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2Icon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        ) : (
             <div className="text-center py-20 px-4">
                <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-800 text-lg">Your pantry is empty</h3>
                <p className="text-gray-500 dark:text-gray-400">Tap the '+' button to add items.</p>
            </div>
        )}
      </div>
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

export default PantryScreen;