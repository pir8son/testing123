
import React, { useState } from 'react';
import { MealPlan, SavedList, Recipe, Ingredient } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { XIcon } from './icons/XIcon';
import { shoppingListService } from '../services/shoppingListService';
import SaveListModal from './SaveListModal';

interface PlanViewerScreenProps {
  planData?: MealPlan; // From AI
  savedPlan?: SavedList; // From DB
  onClose: () => void;
  userId: string;
  onSelectRecipe: (recipe: Recipe) => void;
}

const MealDetailModal: React.FC<{ meal: Recipe; onClose: () => void }> = ({ meal, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
            <div 
                className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85%] animate-slide-up overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-5 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{meal.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meal.nutrition?.calories || 0} kcal • {meal.nutrition?.protein || 0}g Protein</p>
                    </div>
                    <button onClick={onClose} className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-5 space-y-6">
                    {/* Description */}
                    <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl">
                        <p className="text-violet-900 dark:text-violet-100 text-sm leading-relaxed font-medium">
                            {meal.description || "No description available."}
                        </p>
                    </div>

                    {/* Ingredients */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            Ingredients
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{meal.ingredients?.length || 0} items</span>
                        </h3>
                        <ul className="space-y-2">
                            {meal.ingredients?.map((ing, i) => (
                                <li key={i} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <span className="text-gray-700 dark:text-gray-300">{ing.name}</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{ing.amount}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Instructions</h3>
                        <ol className="space-y-4">
                            {meal.instructions?.map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{step}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out; }
                .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

const PlanViewerScreen: React.FC<PlanViewerScreenProps> = ({ 
    planData, savedPlan, onClose, userId, onSelectRecipe 
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Recipe | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // DETERMINE PLAN TYPE
  const isShoppingList = savedPlan?.type === 'shopping_list';
  const isPreview = !savedPlan;
  
  // Data extraction based on type
  const plan = planData || (savedPlan?.planDetails as MealPlan);
  const items = savedPlan?.items || [];
  const title = savedPlan?.title || "AI Meal Plan Preview";

  const handleSave = async (customTitle: string, isPublic: boolean, desc: string) => {
      // If saving from preview, it's always a Meal Plan (since Shopping List mode doesn't support preview saving here yet)
      if (!plan) return;
      
      const allIngredients: Ingredient[] = [];
      plan.forEach(day => {
          ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
              // Handle both AI structure (day.meals[type]) and Manual structure (day[type])
              const meal = (day as any).meals ? (day as any).meals[mealType] : (day as any)[mealType];
              
              if (meal && meal.ingredients) {
                  meal.ingredients.forEach((ing: any) => {
                      allIngredients.push({ ...ing, recipeTitle: meal.title || meal.customName });
                  });
              }
          });
      });

      try {
          await shoppingListService.saveListTemplate(
              userId, 
              customTitle, 
              allIngredients, 
              isPublic, 
              'meal_plan', 
              desc,
              plan
          );
          alert("Plan saved to profile!");
          setShowSaveModal(false);
      } catch (e) {
          alert("Failed to save plan.");
      }
  };

  const handleAddToShoppingList = async () => {
      if (!userId || userId === 'current') {
          alert("User profile not loaded. Please try again.");
          return;
      }

      setIsAdding(true);
      try {
          if (isShoppingList && items.length > 0) {
              // FLAT LIST MODE (Simple Array)
              await shoppingListService.addIngredientsToActiveList(userId, items);
              alert(`Added ${items.length} items to your Shopping List!`);
          } else if (plan) {
              // COMPLEX MEAL PLAN MODE (Nested Object)
              await shoppingListService.addMealPlanToActiveList(userId, plan);
              alert("Ingredients from your Meal Plan have been added to your list!");
          } else {
              alert("No ingredients found in this plan.");
          }
      } catch(e: any) {
          console.error(e);
          alert(`Error: ${e.message || "Could not add to list."}`);
      } finally {
          setIsAdding(false);
      }
  };

  const handleMealClick = (meal: any) => {
      if (meal.id || (meal.ingredients && meal.ingredients.length > 0)) {
          setSelectedMeal(meal);
      }
  };

  if (!plan && items.length === 0) return <div className="p-10 text-center">No plan data found.</div>;

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-50 flex flex-col animate-slide-in">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight line-clamp-1">{title}</h1>
                <div className="flex items-center gap-2">
                    {isPreview && <span className="text-xs text-violet-600 font-bold bg-violet-100 px-2 rounded-full w-fit">Preview Mode</span>}
                    {isShoppingList && <span className="text-xs text-amber-600 font-bold bg-amber-100 px-2 rounded-full w-fit">Shopping List</span>}
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            {isPreview && (
                <button onClick={() => setShowSaveModal(true)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <BookmarkIcon className="w-5 h-5" />
                </button>
            )}
        </div>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-6 pb-32 no-scrollbar">
          
          {isShoppingList ? (
              // --- VIEW MODE: SHOPPING LIST (Simple Checklist) ---
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                      <ShoppingCartIcon className="w-5 h-5 text-amber-500" />
                      Ingredients ({items.length})
                  </h3>
                  <ul className="space-y-0 divider-y dark:divide-gray-700">
                      {items.map((item, i) => (
                          <li key={i} className="flex justify-between py-3 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-4 px-4">
                              <span className="text-gray-800 dark:text-gray-200 font-medium">{item.name}</span>
                              <span className="text-gray-500 dark:text-gray-400 text-sm">{item.amount}</span>
                          </li>
                      ))}
                  </ul>
              </div>
          ) : plan ? (
              // --- VIEW MODE: MEAL PLAN (Calendar Structure) ---
              <div className="space-y-6">
                  {plan.map((day, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between items-center mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                              <h3 className="text-lg font-black text-violet-700 dark:text-violet-400">{day.day}</h3>
                              {day.dailyNutrition && (
                                  <div className="text-[10px] font-mono text-gray-400 flex gap-2">
                                      <span>{Math.round(day.dailyNutrition.calories)} kcal</span>
                                      <span>P: {Math.round(day.dailyNutrition.protein)}g</span>
                                  </div>
                              )}
                          </div>
                          
                          <div className="space-y-2">
                              {/* Handle both AI (day.meals) and Manual (day) structures safely */}
                              {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => {
                                  const meal = (day as any).meals ? (day as any).meals[mealType] : (day as any)[mealType];
                                  if (!meal) return null;

                                  return (
                                      <button 
                                        key={mealType} 
                                        className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                                        onClick={() => handleMealClick(meal)}
                                      >
                                          <div className="flex-1 min-w-0">
                                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">{mealType}</span>
                                              <p className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-green-600 transition-colors line-clamp-1">
                                                  {meal.title || meal.customName || "Rest"}
                                              </p>
                                          </div>
                                          {meal.nutrition && (
                                              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md whitespace-nowrap ml-2">
                                                  {Math.round(meal.nutrition.calories || 0)} cal
                                              </span>
                                          )}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          ) : null}
      </div>

      <footer className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 absolute bottom-0 left-0 right-0">
          <button 
            onClick={handleAddToShoppingList}
            disabled={isAdding}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
              {isAdding ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                  <ShoppingCartIcon className="w-5 h-5" />
              )}
              {isAdding ? 'Adding...' : 'Add All to Shopping List'}
          </button>
      </footer>

      {showSaveModal && (
          <SaveListModal 
            onClose={() => setShowSaveModal(false)}
            onSave={handleSave}
            itemCount={0}
          />
      )}

      {selectedMeal && (
          <MealDetailModal 
            meal={selectedMeal} 
            onClose={() => setSelectedMeal(null)} 
          />
      )}

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default PlanViewerScreen;
