import React, { useState } from 'react';
import { Recipe, Ingredient } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface ScaleRecipePopupProps {
  recipe: Recipe;
  onClose: () => void;
  getScaledIngredients: (ingredients: Ingredient[], originalServings: number, newServings: number) => Promise<Ingredient[]>;
}

const ScaleRecipePopup: React.FC<ScaleRecipePopupProps> = ({ recipe, onClose, getScaledIngredients }) => {
    const [servings, setServings] = useState(recipe.servings);
    const [scaledIngredients, setScaledIngredients] = useState<Ingredient[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleScale = async () => {
        if (servings === recipe.servings) {
            setScaledIngredients(recipe.ingredients);
            return;
        }
        setIsLoading(true);
        try {
            const result = await getScaledIngredients(recipe.ingredients, recipe.servings, servings);
            setScaledIngredients(result);
        } catch (error) {
            console.error(error);
            // Handle error state in UI if needed
        } finally {
            setIsLoading(false);
        }
    };

    const displayIngredients = scaledIngredients || recipe.ingredients;

    return (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-4 animate-popup"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Scale Recipe</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{recipe.title}</p>
                    </div>
                    <button onClick={onClose} className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </header>
                
                <div className="flex items-center gap-4 mb-4">
                    <label htmlFor="servings-input" className="font-semibold">Servings:</label>
                    <input 
                        id="servings-input"
                        type="number"
                        min="1"
                        value={servings}
                        onChange={(e) => setServings(Number(e.target.value))}
                        className="w-20 p-2 text-center font-bold border-2 rounded-lg"
                    />
                    <button onClick={handleScale} disabled={isLoading} className="flex-1 py-2 bg-violet-600 text-white font-bold rounded-lg disabled:bg-gray-400">
                         {isLoading ? 'Scaling...' : 'Update'}
                    </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg max-h-60 overflow-y-auto">
                    <h3 className="font-bold mb-2">Ingredients</h3>
                    {isLoading ? (
                         <div className="flex justify-center items-center h-20">
                            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                    ) : (
                        <ul className="space-y-2">
                            {displayIngredients.map((ing, i) => (
                                <li key={i} className="text-sm">
                                    <span className="font-semibold">{ing.amount}</span> {ing.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                 <style>{`
                    @keyframes popup {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-popup { animation: popup 0.2s ease-out; }
                `}</style>
            </div>
        </div>
    );
};

export default ScaleRecipePopup;