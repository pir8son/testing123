import React, { useState } from 'react';
import { Ingredient, Recipe, RefinedShoppingListItem, AIShoppingListResult } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { categorizeIngredients, getCategoryIcon, getIngredientIcon } from '../utils/ingredientUtils';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { refineShoppingList } from '../services/geminiService';
import { XCircleIcon } from './icons/XCircleIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import SaveListModal from './SaveListModal';
import { shoppingListService } from '../services/shoppingListService';

interface ShoppingListScreenProps {
  userId: string;
  list: Ingredient[];
  recipes: Recipe[];
  checkedItems: Set<string>;
  onToggleChecked: (itemName: string) => void;
  onFinishShopping: () => void;
  onBack: () => void;
  onRemoveRecipe: (recipeId: string) => void;
  onAddRecipes: () => void;
  onGenerateAIList: (diet: string, days: number, notes?: string) => Promise<void>;
  onManualAdd?: (item: Ingredient) => void;
}

const ManualAddPopup: React.FC<{ onClose: () => void; onAdd: (name: string, amount: string) => void }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = () => {
        if (name && amount) {
            onAdd(name, amount);
            onClose();
        }
    };

    return (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 animate-popup" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Add Item</h3>
                    <button onClick={onClose}><XCircleIcon className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
                        <input 
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Milk"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                        <input 
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="e.g. 1 gallon"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <button 
                        onClick={handleSubmit}
                        disabled={!name || !amount}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:bg-gray-400"
                    >
                        Add to List
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes popup { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-popup { animation: popup 0.2s ease-out; }
            `}</style>
        </div>
    );
}

const GenerateAIListPopup: React.FC<{ onClose: () => void; onGenerate: (diet: string, days: number, notes: string) => void }> = ({ onClose, onGenerate }) => {
    const [diet, setDiet] = useState('Standard');
    const [days, setDays] = useState(7);
    const [notes, setNotes] = useState('');

    const diets = ['Standard', 'Keto', 'Vegan', 'Paleo', 'Vegetarian', 'Gluten-Free'];

    return (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-popup" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI List Generator</h3>
                        <p className="text-xs text-gray-500">Personalized shopping magic</p>
                    </div>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7 text-gray-400" /></button>
                </header>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Dietary Focus</label>
                        <div className="grid grid-cols-3 gap-2">
                            {diets.map(d => (
                                <button 
                                    key={d}
                                    onClick={() => setDiet(d)}
                                    className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${diet === d ? 'bg-violet-600 border-violet-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Duration: {days} Days</label>
                        <input 
                            type="range" min="1" max="14" value={days} 
                            onChange={e => setDays(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Additional Notes</label>
                        <textarea 
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Ex: I love spicy food, avoid mushrooms..."
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[80px]"
                        />
                    </div>

                    <button 
                        onClick={() => onGenerate(diet, days, notes)}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Generate AI Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ 
    userId, list: displayList, recipes, checkedItems, onToggleChecked, onFinishShopping, 
    onBack, onRemoveRecipe, onAddRecipes, onGenerateAIList, onManualAdd
}) => {
    const [isRefinedView, setIsRefinedView] = useState(false);
    const [refinedList, setRefinedList] = useState<RefinedShoppingListItem[] | null>(null);
    const [isRefining, setIsRefining] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [showManualAdd, setShowManualAdd] = useState(false);
    const [showAIGenPopup, setShowAIGenPopup] = useState(false);
    
    // Task 3: Modal State
    const [showSaveModal, setShowSaveModal] = useState(false);

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    }

    const handleRefineList = async () => {
        setIsRefining(true);
        try {
            const result = await refineShoppingList(displayList);
            setRefinedList(result);
            setIsRefinedView(true);
        } catch (error) {
            alert("Sorry, we couldn't refine your list right now. Please try again.");
        } finally {
            setIsRefining(false);
        }
    };

    const handleAIGenerate = async (diet: string, days: number, notes: string) => {
        setShowAIGenPopup(false);
        setIsRefining(true); 
        try {
            await onGenerateAIList(diet, days, notes);
        } catch (e) {
            alert("Failed to generate AI list. Check your connection.");
        } finally {
            setIsRefining(false);
        }
    }

    const handleManualAdd = (name: string, amount: string) => {
        if (onManualAdd) {
            onManualAdd({ name, amount, recipeTitle: 'Manually Added' });
        }
    };

    // Task 3: Save Handler
    const handleSaveTemplate = async (title: string, isPublic: boolean, description: string) => {
        try {
            await shoppingListService.saveListTemplate(userId, title, displayList, isPublic, 'shopping_list', description);
            setShowSaveModal(false);
            alert("Success! Your plan is saved to your profile.");
        } catch (e: any) {
            console.error("Save Error:", e);
            alert(`Oops! ${e.message || 'Permission Denied'}`);
        }
    }

    const categorizedList = categorizeIngredients(displayList);

    const categorizedRefinedList = refinedList?.reduce<Record<string, RefinedShoppingListItem[]>>((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    const getRecipeImage = (title: string): string | undefined => {
        return recipes.find(r => r.title.toLowerCase() === title.toLowerCase())?.imageUrl;
    };


    const renderList = () => {
        if (isRefining) {
            return (
                <div className="flex flex-col items-center justify-center text-center py-20 px-4">
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Thinking...</h3>
                    <p className="text-gray-500 dark:text-gray-400">The AI is creating your kitchen magic.</p>
                </div>
            )
        }
        
        if (isRefinedView && categorizedRefinedList) {
            return (
                 <div className="space-y-3">
                    {Object.entries(categorizedRefinedList).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]: [string, RefinedShoppingListItem[]]) => {
                        const isCollapsed = collapsedCategories.has(category);
                        const CategoryIcon = getCategoryIcon(category);

                        return (
                            <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <button 
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex justify-between items-center p-3 font-bold text-gray-700 dark:text-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <CategoryIcon className="w-6 h-6 text-green-600" />
                                        <span>{category} ({items.length})</span>
                                    </div>
                                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                                </button>
                                {!isCollapsed && (
                                    <ul className="px-3 pb-3 space-y-2">
                                        {items.map((item, index) => {
                                            const IngredientIcon = getIngredientIcon(item.name);
                                            const isChecked = checkedItems.has(item.name.toLowerCase().trim());
                                            return (
                                                <li key={index} className="flex items-center p-2 rounded-lg">
                                                    <button 
                                                        onClick={() => onToggleChecked(item.name)}
                                                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-3 flex-shrink-0 transition-colors ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white dark:bg-gray-700'}`}
                                                    >
                                                    {isChecked && <CheckIcon className="w-4 h-4 text-white" />}
                                                    </button>
                                                    <div className="flex items-center gap-3 flex-grow">
                                                        <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full">
                                                            <IngredientIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                                        </div>
                                                        <div>
                                                            <span className={`font-medium ${isChecked ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{item.name}</span>
                                                            <p className={`text-gray-500 dark:text-gray-400 text-sm ${isChecked ? 'line-through' : ''}`}>{item.amount}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex -space-x-3 items-center">
                                                        {item.recipes.map((recipeTitle, i) => {
                                                            const imgUrl = getRecipeImage(recipeTitle);
                                                            return imgUrl ? (
                                                                <img
                                                                    key={i}
                                                                    src={imgUrl}
                                                                    alt={recipeTitle}
                                                                    title={recipeTitle}
                                                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                                                                />
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )
                    })}
                </div>
            )
        }

        return (
             <div className="space-y-3">
                {Object.entries(categorizedList).map(([category, items]) => {
                    const isCollapsed = collapsedCategories.has(category);
                    const CategoryIcon = getCategoryIcon(category);

                    return (
                        <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <button 
                                onClick={() => toggleCategory(category)}
                                className="w-full flex justify-between items-center p-3 font-bold text-gray-700 dark:text-gray-200">
                                <div className="flex items-center gap-3">
                                    <CategoryIcon className="w-6 h-6 text-green-600" />
                                    <span>{category} ({items.length})</span>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                            </button>
                            {!isCollapsed && (
                                <ul className="px-3 pb-3 space-y-2">
                                    {items.map((item, index) => {
                                        const IngredientIcon = getIngredientIcon(item.name);
                                        const isChecked = checkedItems.has(item.name.toLowerCase().trim());
                                        const isAI = item.isAiGenerated;
                                        return (
                                            <li key={index} className="flex items-center p-2 rounded-lg">
                                                <button 
                                                    onClick={() => onToggleChecked(item.name)}
                                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-3 flex-shrink-0 transition-colors ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white dark:bg-gray-700'}`}
                                                >
                                                {isChecked && <CheckIcon className="w-4 h-4 text-white" />}
                                                </button>
                                                <div className="flex items-center gap-3 flex-grow">
                                                    <div className={`p-1.5 rounded-full ${isAI ? 'bg-violet-50 dark:bg-violet-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                        {isAI ? <SparklesIcon className="w-5 h-5 text-violet-600" /> : <IngredientIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                                                    </div>
                                                    <div>
                                                        <span className={`font-medium ${isChecked ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{item.name}</span>
                                                        <p className={`text-gray-500 dark:text-gray-400 text-xs ${isChecked ? 'line-through' : ''}`}>{isAI ? 'AI Suggested' : `from ${item.recipeTitle}`}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-gray-500 text-sm ${isChecked ? 'line-through' : ''}`}>{item.amount}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    )
                })}
            </div>
        );
    };

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-20 flex flex-col animate-slide-in">
       <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg z-10">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 mr-2">
              <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Shopping List</h1>
        </div>
        <div className="flex items-center gap-2">
             {/* Task 3 Integration: Save Icon */}
             <button 
                onClick={() => setShowSaveModal(true)}
                disabled={displayList.length === 0}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50"
                title="Save as Template"
            >
                <BookmarkIcon className="w-5 h-5" />
            </button>
             <button 
                onClick={() => setShowAIGenPopup(true)}
                className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-full hover:bg-violet-200 transition-colors"
                title="AI List Generator"
            >
                <SparklesIcon className="w-6 h-6 text-violet-600" />
            </button>
            <button 
                onClick={() => setShowManualAdd(true)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <PlusIcon className="w-6 h-6 text-green-600" />
            </button>
        </div>
      </header>

      <div className="flex-grow p-4 overflow-y-auto pb-24 no-scrollbar">
        {displayList.length > 0 ? (
            <>
                <div className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Active Items</h3>
                        <span className="text-xs text-gray-400">{displayList.length} items total</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {recipes.map(recipe => (
                            <div key={recipe.id} className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold pl-2 pr-1 py-1 rounded-full flex items-center gap-1">
                                <span>{recipe.title}</span>
                                <button onClick={() => onRemoveRecipe(recipe.id)} className="bg-green-200 dark:bg-green-800/50 hover:bg-green-300 dark:hover:bg-green-800 rounded-full p-0.5">
                                    <XIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onAddRecipes} className="flex-1 text-sm font-bold text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300 rounded-lg flex items-center justify-center gap-1.5 py-2">
                            <PlusIcon className="w-4 h-4" />
                            Add Recipes
                        </button>
                        {isRefinedView ? (
                            <button onClick={() => setIsRefinedView(false)} className="flex-1 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg py-2">
                                ↩️ Show Original
                            </button>
                        ) : (
                            <button onClick={handleRefineList} disabled={isRefining} className="flex-1 text-sm font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center gap-1.5 py-2 disabled:opacity-50">
                                <SparklesIcon className="w-4 h-4" />
                                Refine
                            </button>
                        )}
                    </div>
                </div>

                {renderList()}
            </>
        ) : (
            <div className="text-center py-20 px-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCartIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">Your list is empty!</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Add recipes to your list or use the AI to generate a full weekly plan instantly.</p>
                <div className="flex flex-col gap-3 mt-8 max-w-[240px] mx-auto">
                    <button 
                        onClick={() => setShowAIGenPopup(true)} 
                        className="py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        AI Magic Generator
                    </button>
                    <button onClick={onAddRecipes} className="py-3 bg-green-600 text-white font-bold rounded-xl">Browse Recipes</button>
                </div>
            </div>
        )}
      </div>

      {displayList.length > 0 && (
          <footer className="p-4 border-t bg-white dark:bg-gray-900/50">
              <button 
                onClick={onFinishShopping}
                disabled={checkedItems.size === 0}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                  Finish Shopping ({checkedItems.size} items)
              </button>
          </footer>
      )}
      
      {showManualAdd && (
          <ManualAddPopup onClose={() => setShowManualAdd(false)} onAdd={handleManualAdd} />
      )}

      {showAIGenPopup && (
          <GenerateAIListPopup onClose={() => setShowAIGenPopup(false)} onGenerate={handleAIGenerate} />
      )}

      {/* Task 3 Integration: Modal Instance */}
      {showSaveModal && (
          <SaveListModal 
            onClose={() => setShowSaveModal(false)} 
            onSave={handleSaveTemplate}
            itemCount={displayList.length}
          />
      )}

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

export default ShoppingListScreen;