
import React, { useState, useEffect } from 'react';
import { Recipe, SavedList } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { shoppingListService } from '../services/shoppingListService';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { PackageIcon } from './icons/PackageIcon';

interface SavedMealPlansScreenProps {
  onClose: () => void;
  userId: string; 
  savedPlans?: SavedList[]; 
  onAddToShoppingList: (plan: SavedList) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onEditPlan?: (plan: SavedList) => void; 
  isEmbedded?: boolean; 
}

// --- SHARED MENU COMPONENT ---
const PlanMenu: React.FC<{ 
    isPublic: boolean, 
    onTogglePublic: () => void, 
    onEdit: () => void, 
    onDelete: () => void 
}> = ({ isPublic, onTogglePublic, onEdit, onDelete }) => (
    <div className="absolute top-12 right-2 z-20 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-xl w-44 overflow-hidden animate-popup">
        <button onClick={(e) => { e.stopPropagation(); onTogglePublic(); }} className="w-full p-3 text-left text-sm font-bold flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
            <SparklesIcon className="w-4 h-4 text-violet-500" />
            {isPublic ? 'Make Private' : 'Make Public'}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full p-3 text-left text-sm font-bold flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
            <EditIcon className="w-4 h-4 text-blue-500" />
            Edit Details
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full p-3 text-left text-sm font-bold flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <TrashIcon className="w-4 h-4" />
            Delete
        </button>
    </div>
);

// --- COMPONENT: SHOPPING LIST CARD ---
const ShoppingListCard: React.FC<{ 
    plan: SavedList, 
    onAdd: () => void, 
    onDelete: () => void,
    onEdit: () => void,
    onTogglePublic: () => void
}> = ({ plan, onAdd, onDelete, onEdit, onTogglePublic }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Safety check for items array
    const items = Array.isArray(plan.items) ? plan.items : [];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-visible">
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-4 text-left pr-12 cursor-pointer"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            Shopping List
                        </span>
                        {plan.isPublic && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Public</span>}
                    </div>
                    <p className="font-bold text-gray-800 dark:text-white text-lg line-clamp-1">{plan.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {plan.description || `${items.length} items`}
                    </p>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="absolute top-4 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 z-10"
            >
                <MoreVerticalIcon className="w-5 h-5" />
            </button>

            {showMenu && (
                <PlanMenu 
                    isPublic={plan.isPublic} 
                    onTogglePublic={() => { setShowMenu(false); onTogglePublic(); }}
                    onEdit={() => { setShowMenu(false); onEdit(); }}
                    onDelete={() => { setShowMenu(false); onDelete(); }}
                />
            )}

            {isExpanded && (
                <div className="px-4 pb-4 border-t dark:border-gray-700 pt-3">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mb-4 max-h-40 overflow-y-auto">
                        {items.length > 0 ? (
                            <ul className="space-y-2">
                                {items.slice(0, 8).map((item, i) => (
                                    <li key={i} className="text-sm flex justify-between text-gray-600 dark:text-gray-300">
                                        <span>{item.name}</span>
                                        <span className="text-gray-400 text-xs">{item.amount}</span>
                                    </li>
                                ))}
                                {items.length > 8 && <li className="text-xs text-gray-400 italic pt-1">...and {items.length - 8} more</li>}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-400 italic">List is empty.</p>
                        )}
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                        className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-md text-sm flex items-center justify-center gap-2"
                    >
                        <ShoppingCartIcon className="w-4 h-4" />
                        Use This List
                    </button>
                </div>
            )}
        </div>
    );
};

// --- COMPONENT: MEAL PLAN CARD ---
const MealPlanCard: React.FC<{ 
    plan: SavedList, 
    onAdd: () => void, 
    onDelete: () => void,
    onEdit: () => void,
    onTogglePublic: () => void
}> = ({ plan, onAdd, onDelete, onEdit, onTogglePublic }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Defensive check for plan details
    const planDetails = Array.isArray(plan.planDetails) ? plan.planDetails : [];
    const daysCount = planDetails.length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-visible">
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-4 text-left pr-12 cursor-pointer"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                            Meal Plan
                        </span>
                        {plan.isPublic && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Public</span>}
                    </div>
                    <p className="font-bold text-gray-800 dark:text-white text-lg line-clamp-1">{plan.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {plan.description || `${daysCount} Days • ${plan.itemCount || 0} Ingredients`}
                    </p>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="absolute top-4 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 z-10"
            >
                <MoreVerticalIcon className="w-5 h-5" />
            </button>

            {showMenu && (
                <PlanMenu 
                    isPublic={plan.isPublic} 
                    onTogglePublic={() => { setShowMenu(false); onTogglePublic(); }}
                    onEdit={() => { setShowMenu(false); onEdit(); }}
                    onDelete={() => { setShowMenu(false); onDelete(); }}
                />
            )}

            {isExpanded && (
                <div className="px-4 pb-4 border-t dark:border-gray-700 pt-3">
                    <div className="space-y-3 mb-4">
                        {planDetails.slice(0, 3).map((day: any, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 text-xs font-bold text-gray-400 uppercase">{day.day.slice(0, 3)}</div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 truncate">
                                    {day.dinner?.recipeTitle || day.dinner?.customName || 'Dinner'}
                                </div>
                            </div>
                        ))}
                        {daysCount > 3 && (
                            <p className="text-center text-xs text-gray-400 font-medium">+{daysCount - 3} more days</p>
                        )}
                        {daysCount === 0 && <p className="text-xs text-gray-400 italic">No days configured.</p>}
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                        className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-md text-sm flex items-center justify-center gap-2"
                    >
                        <CalendarIcon className="w-4 h-4" />
                        View Full Plan
                    </button>
                </div>
            )}
        </div>
    );
};

// --- MAIN SCREEN ---
const SavedMealPlansScreen: React.FC<SavedMealPlansScreenProps> = ({ 
    onClose, onAddToShoppingList, onSelectRecipe, onEditPlan, isEmbedded = false, userId
}) => {
  const [plans, setPlans] = useState<SavedList[]>([]);
  // Fix 1: Ensure default filter is 'all'
  const [filter, setFilter] = useState<'all' | 'meal_plan' | 'shopping_list'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
      fetchPlans();
  }, [userId]); 

  const fetchPlans = async () => {
      // GUARD CLAUSE: Prevent "Ghost Data" reads/writes to invalid ID
      if (!userId || userId === 'current' || userId === 'undefined') {
          console.error("[SavedMealPlans] CRITICAL: Invalid userId detected:", userId);
          setLoading(true); // Keep loading state to prevent UI flicker or error rendering
          return;
      }

      try {
          // Attempt 1: Safe query using service
          let fetchedPlans = await shoppingListService.getUserSavedLists(userId);
          setPlans(fetchedPlans);
      } catch (e) {
          console.error("Failed to load plans", e);
      } finally {
          setLoading(false);
          setRefreshing(false);
      }
  };

  const handleTogglePublic = async (plan: SavedList) => {
      const newStatus = !plan.isPublic;
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isPublic: newStatus } : p));
      try {
          await shoppingListService.updatePlan(userId, plan.id, { isPublic: newStatus });
      } catch (e) {
          alert("Failed to update plan visibility.");
          fetchPlans();
      }
  };

  const handleDeletePlan = async (id: string) => {
      if (confirm("Delete this plan forever?")) {
          setPlans(prev => prev.filter(p => p.id !== id));
          try {
              await shoppingListService.deletePlan(userId, id);
          } catch (e) {
              alert("Failed to delete plan.");
              fetchPlans(); 
          }
      }
  };

  const handleRefresh = () => {
      setRefreshing(true);
      fetchPlans();
  };

  const filteredPlans = plans.filter(p => {
      if (filter === 'all') return true;
      // Handle legacy plans where type might be undefined (assume shopping_list for safety if no planDetails)
      const effectiveType = p.type || (p.planDetails ? 'meal_plan' : 'shopping_list');
      return effectiveType === filter;
  });

  const containerClass = isEmbedded 
    ? "h-full flex flex-col" 
    : "absolute inset-0 bg-gray-50 dark:bg-gray-950 z-40 flex flex-col animate-slide-in"; 

  // UI GUARD: Show loading state if userId is invalid (prevent "Empty" state flash)
  if (userId === 'current' || userId === 'undefined') {
      return (
          <div className={containerClass}>
              <div className="flex-grow flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
          </div>
      );
  }

  return (
    <div className={containerClass}>
      {!isEmbedded && (
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg z-20">
            <div className="flex items-center gap-3">
                <button onClick={onClose} className="p-2 -ml-2 mr-2">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Saved Plans</h1>
            </div>
            <button onClick={handleRefresh} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${refreshing ? 'animate-spin' : ''}`}>
                <RefreshCwIcon className="w-5 h-5 text-gray-500" />
            </button>
          </header>
      )}

      {/* Filter Tabs - Spacious Design */}
      <div className={`px-4 ${isEmbedded ? 'pt-0' : 'pt-4'} pb-2`}>
          <div className="flex justify-between items-center gap-3 mb-4">
              <button 
                onClick={() => setFilter('all')} 
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all text-center ${
                    filter === 'all' 
                    ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                  All
              </button>
              <button 
                onClick={() => setFilter('meal_plan')} 
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all text-center ${
                    filter === 'meal_plan' 
                    ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                  Meal Plans
              </button>
              <button 
                onClick={() => setFilter('shopping_list')} 
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all text-center ${
                    filter === 'shopping_list' 
                    ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                  Lists
              </button>
          </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto pb-24 no-scrollbar">
        {loading && !refreshing ? (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : filteredPlans.length > 0 ? (
            <div className="space-y-4">
                {filteredPlans.map(plan => {
                    // Fix 2: Explicitly handle 'meal_plan' type
                    if (plan.type === 'meal_plan' || plan.planDetails) {
                        return (
                            <MealPlanCard 
                                key={plan.id} 
                                plan={plan}
                                onAdd={() => onAddToShoppingList(plan)}
                                onDelete={() => handleDeletePlan(plan.id)}
                                onEdit={() => onEditPlan?.(plan)}
                                onTogglePublic={() => handleTogglePublic(plan)}
                            />
                        );
                    } else {
                        // Default to ShoppingListCard
                        return (
                            <ShoppingListCard 
                                key={plan.id} 
                                plan={plan}
                                onAdd={() => onAddToShoppingList(plan)}
                                onDelete={() => handleDeletePlan(plan.id)}
                                onEdit={() => onEditPlan?.(plan)}
                                onTogglePublic={() => handleTogglePublic(plan)}
                            />
                        );
                    }
                })}
            </div>
        ) : (
            <div className="text-center py-20 px-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PackageIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">No plans found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    {filter === 'all' 
                        ? 'Create a plan or save a shopping list to see it here.'
                        : `No ${filter === 'meal_plan' ? 'Meal Plans' : 'Shopping Lists'} saved.`}
                </p>
                <p className="text-[10px] text-gray-400 mt-4 font-mono">ID: {userId}</p>
            </div>
        )}
      </div>

      <style>{`
          @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
          @keyframes popup { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-popup { animation: popup 0.2s cubic-bezier(0, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default SavedMealPlansScreen;
