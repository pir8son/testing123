import React, { useState } from 'react';
import { Recipe } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface SubstituteIngredientPopupProps {
  recipe: Recipe;
  onClose: () => void;
  getSuggestions: (ingredientName: string, recipeContext: string) => Promise<string[]>;
}

const SubstituteIngredientPopup: React.FC<SubstituteIngredientPopupProps> = ({ recipe, onClose, getSuggestions }) => {
    const [selectedIngredient, setSelectedIngredient] = useState(recipe.ingredients[0]?.name || '');
    const [suggestions, setSuggestions] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGetSuggestions = async () => {
        if (!selectedIngredient) return;
        setIsLoading(true);
        try {
            const result = await getSuggestions(selectedIngredient, recipe.title);
            setSuggestions(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-4 animate-popup"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-start mb-4">
                     <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Find a Substitute</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">For "{recipe.title}"</p>
                    </div>
                    <button onClick={onClose} className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </header>

                <div className="flex items-center gap-2 mb-4">
                    <select
                        value={selectedIngredient}
                        onChange={(e) => setSelectedIngredient(e.target.value)}
                        className="flex-grow p-2 border-2 rounded-lg"
                    >
                        {recipe.ingredients.map((ing, i) => (
                            <option key={i} value={ing.name}>{ing.name}</option>
                        ))}
                    </select>
                    <button onClick={handleGetSuggestions} disabled={isLoading} className="py-2 px-4 bg-violet-600 text-white font-bold rounded-lg disabled:bg-gray-400">
                        {isLoading ? '...' : 'Find'}
                    </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg min-h-[120px]">
                     <h3 className="font-bold mb-2">Suggestions for {selectedIngredient}:</h3>
                     {isLoading ? (
                         <div className="flex justify-center items-center h-20">
                            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                     ) : suggestions ? (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                     ) : (
                         <p className="text-sm text-gray-500 text-center pt-4">Select an ingredient and tap "Find"</p>
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

export default SubstituteIngredientPopup;