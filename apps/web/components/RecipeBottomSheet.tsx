
import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { XIcon } from './icons/XIcon';
import { ClockIcon } from './icons/ClockIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShareIcon } from './icons/ShareIcon';
import { recipeService } from '../services/recipeService';
import { shareService } from '../services/shareService';

interface RecipeBottomSheetProps {
  recipe: Recipe;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  isRecipeInShoppingList: boolean;
  toggleRecipeInShoppingList: () => void;
  onSendToSmartHome: () => void;
  onScale: () => void;
  onSubstitute: () => void;
  onMakeHealthier: () => void;
}

const AiActionChip: React.FC<{ label: string; icon: React.ReactNode, onClick?: () => void }> = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-2 py-2 px-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-xl border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
    </button>
);


const RecipeBottomSheet: React.FC<RecipeBottomSheetProps> = ({ 
    recipe: initialRecipe, onClose, isSaved, onToggleSave, isRecipeInShoppingList, toggleRecipeInShoppingList, 
    onSendToSmartHome, onScale, onSubstitute, onMakeHealthier 
}) => {
  const [fullRecipe, setFullRecipe] = useState<Recipe>(initialRecipe);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Hydrate full recipe details if opening from a "Saved" state (which might be partial data)
  useEffect(() => {
      const hasMissingData = !initialRecipe.ingredients || initialRecipe.ingredients.length === 0 || !initialRecipe.instructions || initialRecipe.instructions.length === 0;
      
      if (hasMissingData) {
          const fetchFullDetails = async () => {
              setIsLoadingDetails(true);
              try {
                  const data = await recipeService.getById(initialRecipe.id);
                  if (data) {
                      setFullRecipe(data);
                  }
              } catch (error) {
                  console.error("Failed to load full recipe details:", error);
              } finally {
                  setIsLoadingDetails(false);
              }
          };
          fetchFullDetails();
      } else {
          setFullRecipe(initialRecipe);
      }
  }, [initialRecipe]);

  const handleShare = async () => {
      await shareService.shareRecipe(fullRecipe);
  }

  return (
    <div className="absolute inset-0 bg-black/40 z-50" onClick={onClose}>
      <div 
        className="absolute bottom-0 left-0 right-0 max-h-[95%] bg-white dark:bg-gray-900 rounded-t-3xl shadow-xl flex flex-col pt-2 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3 flex-shrink-0"></div>
        
        <div className="overflow-y-auto px-4 no-scrollbar flex-grow">
            <header className="pb-2">
                <div className="flex justify-between items-start">
                    {/* Allow title to wrap naturally */}
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white pr-4 leading-tight">{fullRecipe.title}</h2>
                    <button onClick={onClose} className="p-2 -mt-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0">
                        <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                 <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 mt-2">
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-5 h-5"/>
                        <span className="font-medium text-sm">{fullRecipe.cookTime}</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <UsersIcon className="w-5 h-5"/>
                        <span className="font-medium text-sm">{fullRecipe.servings} servings</span>
                    </div>
                </div>
            </header>
            
            <div className="flex items-center gap-2 my-4">
                <AiActionChip label="Scale" icon={<UsersIcon className="w-5 h-5" />} onClick={onScale} />
                <AiActionChip label="Substitute" icon={<SparklesIcon className="w-5 h-5" />} onClick={onSubstitute} />
                <AiActionChip label="Make Healthier" icon={<SparklesIcon className="w-5 h-5" />} onClick={onMakeHealthier} />
            </div>

            {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Loading recipe details...</p>
                </div>
            ) : (
                <>
                    <section className="mb-4">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">Ingredients</h3>
                        <ul className="space-y-2">
                            {fullRecipe.ingredients?.length > 0 ? fullRecipe.ingredients.map((ing, index) => (
                                <li key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <input 
                                        id={`ing-sheet-${index}`}
                                        type="checkbox" 
                                        className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 mr-3 bg-transparent"
                                    />
                                    <label htmlFor={`ing-sheet-${index}`} className="flex-grow text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold">{ing.amount}</span> {ing.name}
                                    </label>
                                    {ing.inPantry && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">In pantry</span>}
                                </li>
                            )) : (
                                <p className="text-gray-500 italic">No ingredients listed.</p>
                            )}
                        </ul>
                    </section>
                    
                    <section className="mb-4">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">Instructions</h3>
                        {fullRecipe.instructions?.length > 0 ? (
                            <ol className="space-y-4">
                                {fullRecipe.instructions.map((step, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white font-bold rounded-full flex items-center justify-center">{index + 1}</div>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-1">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-gray-500 italic">No instructions provided.</p>
                        )}
                    </section>
                </>
            )}
        </div>

        <footer className="px-4 pb-4 pt-3 mt-auto flex-shrink-0 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-3">
            <button 
                onClick={handleShare}
                className="w-full py-3 font-bold rounded-xl bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <ShareIcon className="w-5 h-5" />
              Share Recipe
            </button>
            <div className="flex gap-3">
                 <button 
                    onClick={onToggleSave}
                    className={`w-full py-3 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                        isSaved 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  <BookmarkIcon className={`w-5 h-5`} fill={isSaved ? 'currentColor' : 'none'} stroke={isSaved ? 'none' : 'currentColor'}/>
                  {isSaved ? 'Saved' : 'Save Recipe'}
                </button>
                <button 
                  onClick={toggleRecipeInShoppingList}
                  className={`w-full py-3 font-bold rounded-xl transition-colors ${
                    isRecipeInShoppingList
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                    {isRecipeInShoppingList ? 'Remove from List' : 'Add to Shopping List'}
                </button>
            </div>
        </footer>
        <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .animate-slide-up {
                animation: slide-up 0.3s ease-out;
            }
        `}</style>
      </div>
    </div>
  );
};

export default RecipeBottomSheet;
