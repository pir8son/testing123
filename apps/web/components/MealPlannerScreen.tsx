import React, { useState } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MealPlan, NutritionGoals, Recipe, UserProfile } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { ListIcon } from './icons/ListIcon';
import { PlusIcon } from './icons/PlusIcon';
import PlanViewerScreen from './PlanViewerScreen'; // The Fix
import PlanBuilderScreen from './PlanBuilderScreen'; // The New Feature

interface MealPlannerScreenProps {
  onClose: () => void;
  isLoading: boolean;
  mealPlan: MealPlan | null;
  onGenerate: (days: number, customPrompt: string, includeRecipes: Recipe[], goals: NutritionGoals) => Promise<void>; // Updated signature to Promise
  onSave: (plan: MealPlan) => void; // Legacy, kept for interface compat
  savedRecipes: Recipe[];
  onShowSaved: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  // We need userId to save plans from here now
  // Assuming parent passes userProfile or userId, if not we might need to rely on prop drilling or context.
  // For now, let's assume the parent 'App.tsx' renders this with the right props or we use auth() inside services.
}

const LoadingSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
);

const GoalInput: React.FC<{ label: string, value: number, onChange: (val: number) => void, unit: string }> = ({ label, value, onChange, unit }) => (
    <div>
        <label className="text-xs font-semibold text-gray-500">{label}</label>
        <div className="relative">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full p-1.5 text-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md"
            />
             <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>
        </div>
    </div>
);

const MealPlannerScreen: React.FC<MealPlannerScreenProps> = ({ 
    onClose, isLoading, mealPlan, onGenerate, onSave, savedRecipes, onShowSaved, onSelectRecipe
}) => {
  const [days, setDays] = useState(3);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [goals, setGoals] = useState<NutritionGoals>({ calories: 2200, protein: 150, carbs: 250, fat: 70 });
  
  // NEW STATES for Navigation
  const [showBuilder, setShowBuilder] = useState(false);
  // We use this local state to show the result if 'mealPlan' prop is populated
  // BUT the prop update might be slow or reference old data.
  // Ideally, 'onGenerate' should return a promise we can await here.
  // Since 'onGenerate' is a void prop, we rely on the parent updating 'mealPlan'.
  
  // Workaround: We will detect when 'mealPlan' changes from null to populated and switch view.
  // Better yet: Pass 'onGenerate' that returns data? For now, we rely on the prop.

  const handleGenerate = async () => {
    const includedRecipes = savedRecipes.filter(r => selectedRecipeIds.has(r.id));
    await onGenerate(days, customPrompt, includedRecipes, goals);
    // Note: The 'mealPlan' prop will update after this promise resolves if parent handles it correctly.
    // We can't check 'mealPlan' length here directly because it's a prop. 
    // The visual check happens in the render gate below.
  }
  
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

  // --- RENDER GATES ---

  // 1. Show Preview if Plan Exists (THE FIX)
  if (mealPlan && !isLoading) {
      if (mealPlan.length < days) {
          // Non-blocking alert for partial content
          // We render anyway so the user sees what they got
          // Ideally this would be a toast, but console warning is safe for now
          console.warn(`Partial Plan Generated: Requested ${days} days, got ${mealPlan.length}.`);
      }

      // We assume user ID is available via auth service in Viewer
      // Passing a dummy ID if prop not available, Viewer handles it via auth.currentUser
      return (
        <PlanViewerScreen 
            planData={mealPlan} 
            onClose={() => {
                // We need a way to clear the plan in parent? 
                // For now, we just close the planner entirely or user hits back.
                // Re-clicking AI Planner will likely reset state in parent if implemented correctly.
                onClose(); 
            }}
            userId={'current'} // Viewer resolves real ID
            onSelectRecipe={onSelectRecipe}
        />
      );
  }

  // 2. Show Builder
  if (showBuilder) {
      return (
          <PlanBuilderScreen 
            onClose={() => setShowBuilder(false)}
            savedRecipes={savedRecipes}
            userId={'current'} // Service resolves real ID
          />
      );
  }

  // 3. Default Generator Screen
  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-30 flex flex-col animate-slide-in">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <div className="flex items-center">
            <button onClick={onClose} className="p-2 -ml-2 mr-2">
              <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Meal Planner</h1>
        </div>
        <button onClick={onShowSaved} className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
            <ListIcon className="w-5 h-5" />
            Saved Plans
        </button>
      </header>

      {/* Added pb-40 to prevent bottom clipping AND no-scrollbar for clean UI */}
      <div className="flex-grow p-4 overflow-y-auto space-y-6 pb-40 no-scrollbar">
        
        {/* Create Manual Plan Entry */}
        <button 
            onClick={() => setShowBuilder(true)}
            className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group"
        >
            <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <PlusIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                    <h3 className="font-bold text-gray-800 dark:text-white">Create from Scratch</h3>
                    <p className="text-xs text-gray-500">Manually select recipes & items</p>
                </div>
            </div>
            <div className="text-gray-300 group-hover:text-green-500 transition-colors">➔</div>
        </button>

        <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
            <span className="text-xs font-bold text-gray-400 uppercase">OR ASK AI</span>
            <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4 shadow-sm border border-violet-100 dark:border-violet-900/30">
            <div>
                <label htmlFor="days" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Duration: {days} Days</label>
                <input
                    id="days" type="range" min="1" max="7" value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-violet-600"
                />
            </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Nutrition Targets</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <GoalInput label="Calories" unit="kcal" value={goals.calories} onChange={v => setGoals(g => ({...g, calories: v}))} />
                    <GoalInput label="Protein" unit="g" value={goals.protein} onChange={v => setGoals(g => ({...g, protein: v}))} />
                    <GoalInput label="Carbs" unit="g" value={goals.carbs} onChange={v => setGoals(g => ({...g, carbs: v}))} />
                    <GoalInput label="Fat" unit="g" value={goals.fat} onChange={v => setGoals(g => ({...g, fat: v}))} />
                </div>
            </div>
             <div>
                <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Preferences</label>
                <input
                    id="prompt" type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., high-protein, no mushrooms, spicy dinner"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                />
            </div>

            {savedRecipes.length > 0 && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Base on Saved Recipes</label>
                    <div className="max-h-32 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                        {savedRecipes.map(recipe => (
                            <div key={recipe.id} className="flex items-center">
                                <input
                                    type="checkbox" id={`recipe-${recipe.id}`}
                                    checked={selectedRecipeIds.has(recipe.id)}
                                    onChange={() => toggleRecipeSelection(recipe.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                />
                                <label htmlFor={`recipe-${recipe.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate">{recipe.title}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating Plan...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5" />
                        Generate with AI
                    </>
                )}
            </button>
        </div>
        
        {/* Loading State Overlay */}
        {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/50 rounded-full flex items-center justify-center mb-6 relative">
                    <SparklesIcon className="w-10 h-10 text-violet-600 dark:text-violet-400 animate-pulse" />
                    <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chef AI is thinking...</h3>
                <p className="text-gray-500 max-w-xs">Creating a personalized {days}-day meal plan based on your goals and pantry.</p>
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

export default MealPlannerScreen;