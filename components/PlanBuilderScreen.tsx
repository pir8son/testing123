
import React, { useState, useEffect } from 'react';
import { Recipe, Ingredient, CalendarDay, MealSlot } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { shoppingListService } from '../services/shoppingListService';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { auth } from '../config/firebase';

interface PlanBuilderScreenProps {
  onClose: () => void;
  savedRecipes: Recipe[];
  userId: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const;

const PlanBuilderScreen: React.FC<PlanBuilderScreenProps> = ({ onClose, savedRecipes, userId }) => {
  // Plan Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // The Data Model
  const [weeklyPlan, setWeeklyPlan] = useState<CalendarDay[]>(
      DAYS.map(d => ({ day: d }))
  );
  
  // Extra non-recipe items
  const [extraItemName, setExtraItemName] = useState('');
  const [extraItems, setExtraItems] = useState<Ingredient[]>([]);
  
  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null); // Which day is open?
  const [activeSlot, setActiveSlot] = useState<{ dayIndex: number, meal: 'breakfast' | 'lunch' | 'dinner' } | null>(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  
  // SAFETY TIMEOUT STATE
  const [forceReady, setForceReady] = useState(false);

  // LOGIC: If userId is missing, wait 3 seconds then unlock button anyway so user can try (and see error if it fails)
  useEffect(() => {
      const timer = setTimeout(() => {
          setForceReady(true);
      }, 3000);
      return () => clearTimeout(timer);
  }, []);

  // Use props userId, or fallback to Auth UID (if matching), or check force enable
  // This resolves the "Infinite Loading" if the prop is delayed
  const effectiveUserId = (userId && userId !== 'current') ? userId : (auth.currentUser?.uid || 'current');
  const isProfileLoading = (effectiveUserId === 'current' || !effectiveUserId) && !forceReady;

  // --- ACTIONS ---

  const handleSelectSlot = (dayIndex: number, meal: 'breakfast' | 'lunch' | 'dinner') => {
      setActiveSlot({ dayIndex, meal });
      setShowRecipePicker(true);
  };

  const handleAssignRecipe = (recipe: Recipe) => {
      if (!activeSlot) return;
      const { dayIndex, meal } = activeSlot;

      setWeeklyPlan(prev => {
          const newPlan = [...prev];
          newPlan[dayIndex] = {
              ...newPlan[dayIndex],
              [meal]: {
                  recipeId: recipe.id,
                  recipeTitle: recipe.title,
                  imageUrl: recipe.imageUrl,
                  ingredients: recipe.ingredients
              } as MealSlot
          };
          return newPlan;
      });
      setShowRecipePicker(false);
      setActiveSlot(null);
  };

  const handleAssignCustom = () => {
      const name = prompt("Enter meal name (e.g. 'Leftovers')");
      if (!name || !activeSlot) return;
      const { dayIndex, meal } = activeSlot;

      setWeeklyPlan(prev => {
          const newPlan = [...prev];
          newPlan[dayIndex] = {
              ...newPlan[dayIndex],
              [meal]: {
                  customName: name,
                  ingredients: []
              } as MealSlot
          };
          return newPlan;
      });
      setShowRecipePicker(false);
      setActiveSlot(null);
  }

  const handleClearSlot = (dayIndex: number, meal: 'breakfast' | 'lunch' | 'dinner') => {
      setWeeklyPlan(prev => {
          const newPlan = [...prev];
          delete newPlan[dayIndex][meal];
          return newPlan;
      });
  };

  const addExtraItem = () => {
    if (!extraItemName.trim()) return;
    setExtraItems([...extraItems, { name: extraItemName, amount: '1' }]);
    setExtraItemName('');
  };

  const removeExtraItem = (index: number) => {
    setExtraItems(extraItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // 1. VALIDATION: Prevent "Ghost Data" Error
    if (isProfileLoading) {
        return; 
    }

    // Double check ID before firing
    const finalId = (userId && userId !== 'current') ? userId : (auth.currentUser?.uid);

    if (!finalId) {
        alert("System Error: Unable to identify user. Please restart the app to sync your profile.");
        return;
    }

    if (!title.trim()) {
      alert("Please enter a plan name");
      return;
    }

    setIsSaving(true);
    
    // Aggregate Ingredients from the Calendar
    const allIngredients: Ingredient[] = [];
    
    weeklyPlan.forEach(day => {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            // @ts-ignore
            const slot = day[mealType] as MealSlot | undefined;
            if (slot && slot.ingredients) {
                slot.ingredients.forEach(ing => {
                    allIngredients.push({
                        ...ing,
                        recipeTitle: slot.recipeTitle || slot.customName || 'Meal Plan',
                        isChecked: false
                    });
                });
            }
        });
    });

    // Add extras
    allIngredients.push(...extraItems);

    try {
      await shoppingListService.saveListTemplate(
        finalId, 
        title, 
        allIngredients, 
        false, 
        'meal_plan', 
        description || `Weekly plan with ${allIngredients.length} items`,
        weeklyPlan // Save the visual calendar structure!
      );
      alert("Plan saved successfully!");
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(`Failed to save plan: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-50 flex flex-col animate-slide-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 sticky top-0">
        <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">New Meal Plan</h1>
        </div>
        <button 
            onClick={handleSave} 
            disabled={isSaving || isProfileLoading || !title.trim()}
            className="text-green-600 font-bold disabled:opacity-50 text-lg flex items-center gap-2"
        >
            {isSaving || isProfileLoading ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            ) : null}
            {isProfileLoading ? 'Loading...' : isSaving ? 'Saving...' : 'Save'}
        </button>
      </header>

      {/* Main Content - Padded at bottom for visibility */}
      <div className="flex-grow overflow-y-auto">
        <div className="p-4 space-y-6 pb-32">
            
            {/* Metadata Input */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Plan Title</label>
                <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Keto Week 1"
                    className="w-full text-xl font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 focus:outline-none focus:border-green-500 text-gray-900 dark:text-white placeholder-gray-300"
                />
                <input 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full text-sm bg-transparent focus:outline-none text-gray-600 dark:text-gray-300"
                />
            </div>

            {/* Calendar Grid */}
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Weekly Calendar</h2>
            <div className="space-y-3">
                {weeklyPlan.map((day, dIdx) => {
                    return (
                        <div key={day.day} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                            <div 
                                onClick={() => setActiveDayIndex(activeDayIndex === dIdx ? null : dIdx)}
                                className="p-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center cursor-pointer"
                            >
                                <span className="font-bold text-gray-700 dark:text-gray-200">{day.day}</span>
                                <span className="text-xs text-gray-400">{activeDayIndex === dIdx ? '▼' : '▶'}</span>
                            </div>
                            
                            {/* Slots */}
                            {(activeDayIndex === dIdx) && (
                                <div className="p-3 space-y-3">
                                    {MEALS.map(meal => {
                                        const mealKey = meal.toLowerCase() as 'breakfast' | 'lunch' | 'dinner';
                                        const slot = day[mealKey];

                                        return (
                                            <div key={meal} className="flex items-center gap-3">
                                                <div className="w-20 text-xs font-bold text-gray-400 uppercase text-right">{meal}</div>
                                                
                                                {slot ? (
                                                    <div className="flex-1 flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50">
                                                        <div className="flex items-center gap-3">
                                                            {slot.imageUrl ? (
                                                                <img src={slot.imageUrl} className="w-10 h-10 rounded-lg object-cover" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-700 font-bold text-xs">
                                                                    {slot.customName?.[0] || '?'}
                                                                </div>
                                                            )}
                                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1">
                                                                {slot.recipeTitle || slot.customName}
                                                            </span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleClearSlot(dIdx, mealKey)}
                                                            className="p-2 text-gray-400 hover:text-red-500"
                                                        >
                                                            <XIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleSelectSlot(dIdx, mealKey)}
                                                        className="flex-1 p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        <PlusIcon className="w-4 h-4" />
                                                        <span className="text-xs font-bold">Add Meal</span>
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Extras */}
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mt-6">Extra Groceries</h2>
            <div className="flex gap-2 mb-2">
                <input 
                    value={extraItemName}
                    onChange={e => setExtraItemName(e.target.value)}
                    placeholder="e.g. Milk, Paper Towels"
                    className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyPress={e => e.key === 'Enter' && addExtraItem()}
                />
                <button onClick={addExtraItem} className="bg-gray-200 dark:bg-gray-700 p-3 rounded-xl">
                    <PlusIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
            </div>
            {extraItems.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-2">
                    {extraItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border-b last:border-0 border-gray-100 dark:border-gray-700">
                            <span className="text-gray-800 dark:text-gray-200">{item.name}</span>
                            <button onClick={() => removeExtraItem(i)}>
                                <XIcon className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Recipe Picker Modal */}
      {showRecipePicker && (
          <div className="absolute inset-0 bg-white dark:bg-gray-950 z-[60] flex flex-col animate-slide-in">
              <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
                  <button onClick={() => setShowRecipePicker(false)} className="p-2 -ml-2 mr-2">
                      <ArrowLeftIcon className="w-6 h-6" />
                  </button>
                  <h2 className="font-bold text-lg">Select Recipe</h2>
              </header>
              <div className="flex-grow p-4 overflow-y-auto">
                  <button 
                    onClick={handleAssignCustom}
                    className="w-full p-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 font-bold text-gray-600 dark:text-gray-300"
                  >
                      + Add Custom Item
                  </button>
                  
                  <div className="space-y-3">
                      {savedRecipes.map(recipe => (
                          <div 
                            key={recipe.id}
                            onClick={() => handleAssignRecipe(recipe)}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:border-green-500 transition-colors"
                          >
                              <img src={recipe.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-gray-200" />
                              <div>
                                  <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{recipe.title}</p>
                                  <p className="text-xs text-gray-500">{recipe.ingredients.length} ingredients</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default PlanBuilderScreen;
