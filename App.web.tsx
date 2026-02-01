import React, { useState, useEffect } from 'react';
import BottomNavBar from './components/BottomNavBar';
import AIScreen from './components/AIScreen';
import FeedScreen from './components/FeedScreen';
import SearchScreen from './components/SearchScreen';
import ProfileScreen from './components/ProfileScreen';
import RecipeBottomSheet from './components/RecipeBottomSheet';
import { Ingredient, Recipe, SuggestedRecipe, MealPlan, SmartSuggestion, NutritionGoals, LoggedFood, SavedMealPlan, QuickActionType, SubScreen, DietaryPreference, UserProfile, UserSettings, SavedList, Tab } from './types';
import CommentSheet from './components/CommentSheet';
import GenerateShoppingListScreen from './components/GenerateShoppingListScreen';
import ShoppingListScreen from './components/ShoppingListScreen';
import PantryScreen from './components/PantryScreen';
import { recipeDatabase } from './data/recipeDatabase';
import { recipeService } from './services/recipeService';
import { backend } from './services/backend'; 
import ChatScreen from './components/ChatScreen';
import SettingsScreen from './components/SettingsScreen';
import { 
  getRecipesFromIngredients, 
  getMealPlan, 
  getSmartSuggestions, 
  getSmartSwaps, 
  getNutritionInfo,
  scaleRecipeIngredients,
  getIngredientSubstitutes,
  makeRecipeHealthier,
  parseItemsFromReceipt,
  parseItemsFromFridge,
  generateSmartShoppingList
} from './services/geminiService';
import RecipeSuggestionsScreen from './components/RecipeSuggestionsScreen';
import MealPlannerScreen from './components/MealPlannerScreen';
import SmartSuggestionsScreen from './components/SmartSuggestionsScreen';
import SmartSwapsScreen from './components/SmartSwapsScreen';
import NutritionTrackerScreen from './components/NutritionTrackerScreen';
import AddFoodScreen from './components/AddFoodScreen';
import NutritionHistoryScreen from './components/NutritionHistoryScreen';
import SetGoalsScreen from './components/SetGoalsScreen';
import FoodDetailPopup from './components/FoodDetailPopup';
import CreatorDashboardScreen from './components/CreatorDashboardScreen';
import UploadScreen from './components/UploadScreen';
import ScaleRecipePopup from './components/ScaleRecipePopup';
import SubstituteIngredientPopup from './components/SubstituteIngredientPopup';
import MakeHealthierPopup from './components/MakeHealthierPopup';
import SuggestionPopup from './components/SuggestionPopup';
import SavedMealPlansScreen from './components/SavedMealPlansScreen';
import GenerationNoticePopup from './components/GenerationNoticePopup';
import AddPantryItemScreen from './components/AddPantryItemScreen';
import MarkAsCookedScreen from './components/MarkAsCookedScreen';
import PantryScanReviewScreen from './components/PantryScanReviewScreen';
import PantryScanningPopup from './components/PantryScanningPopup';
import SavedRecipesScreen from './components/SavedRecipesScreen';
import AddCollectionPopup from './components/AddCollectionPopup';
import AddToCollectionSheet from './components/AddToCollectionSheet';
import BarcodeScanner from './components/BarcodeScanner';
import { LoginScreen } from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import PublicProfileScreen from './components/PublicProfileScreen';
import NotificationCenter from './components/NotificationCenter'; 
import CreatorSettingsSheet from './components/CreatorSettingsSheet';
import UserListScreen from './components/UserListScreen';
import EditRecipeScreen from './components/EditRecipeScreen'; 
// @ts-ignore
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './services/firebaseConfig';
import { useSavedRecipes, usePantry, useShoppingList } from './hooks/useUserData';
import { shoppingListService } from './services/shoppingListService';

type ProfileStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

const App: React.FC = () => {
  // --- AUTH & DATA GATE STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Data FSM
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('IDLE');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileDebugLog, setProfileDebugLog] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>('Feed');
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreen | null>(null);
  
  // Data Versioning for Refetching
  const [contentVersion, setContentVersion] = useState(0);
  
  // Global Data
  const [globalRecipes, setGlobalRecipes] = useState<Recipe[]>([]);

  // UI State
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [commentingOnRecipe, setCommentingOnRecipe] = useState<Recipe | null>(null);
  const [isAiChatActive, setIsAiChatActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false); 
  const [showCreatorSettings, setShowCreatorSettings] = useState(false);
  
  // New State for User List (Followers/Following)
  const [activeUserList, setActiveUserList] = useState<{ type: 'followers' | 'following', userId: string } | null>(null);

  // New State for Edit Recipe
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  // Restore Plan workflow
  const [planToRestore, setPlanToRestore] = useState<SavedList | null>(null);

  // --- SCOPED FEED STATE (PROFILE FEED MODE) ---
  const [scopedFeedState, setScopedFeedState] = useState<{ 
    userId: string, 
    initialRecipeId: string,
    fromDashboard?: boolean,
    fromProfile?: boolean
  } | null>(null);
  const [feedJumpId, setFeedJumpId] = useState<string | null>(null);
  
  // --- REAL-TIME DATA HOOKS ---
  const { savedRecipes: realtimeSavedRecipes, savedRecipeIds: realtimeSavedIds } = useSavedRecipes(userId);
  const { pantryItems: realtimePantryItems } = usePantry(userId);
  const { shoppingList: realtimeShoppingList, checkedItems: realtimeCheckedItems } = useShoppingList(userId);

  // --- USER SPECIFIC DATA ---
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    dietaryPreferences: new Set(),
    notificationsEnabled: true,
    useMetricSystem: false,
    autoplayVideo: true,
  });
  const [quickActions, setQuickActions] = useState<Set<QuickActionType>>(new Set(['scan', 'log', 'create']));
  const [savedMealPlans, setSavedMealPlans] = useState<SavedMealPlan[]>([]);
  const [nutritionLog, setNutritionLog] = useState<LoggedFood[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({ calories: 2200, protein: 160, carbs: 250, fat: 70 });
  const [favoritedRecipeIds, setFavoritedRecipeIds] = useState<Set<string>>(new Set());
  const [userCollections, setUserCollections] = useState<Record<string, { name: string; recipeIds: Set<string> }>>({});
  
  // AI Feature States
  const [showCookWhatYouHave, setShowCookWhatYouHave] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isFetchingMealPlan, setIsFetchingMealPlan] = useState(false);
  const [showSavedMealPlans, setShowSavedMealPlans] = useState(false);
  const [showGenerationNotice, setShowGenerationNotice] = useState(false);

  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [isFetchingSmartSuggestions, setIsFetchingSmartSuggestions] = useState(false);

  const [showSmartSwaps, setShowSmartSwaps] = useState(false);

  // Nutrition Tracker UI
  const [showNutritionTracker, setShowNutritionTracker] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [showNutritionHistory, setShowNutritionHistory] = useState(false);
  const [showSetGoals, setShowSetGoals] = useState(false);
  const [isLoggingFood, setIsLoggingFood] = useState(false);
  const [detailedFoodItem, setDetailedFoodItem] = useState<LoggedFood | null>(null);
  const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  // Creator Hub State
  const [showCreatorDashboard, setShowCreatorDashboard] = useState(false);
  const [showUploadScreen, setShowUploadScreen] = useState(false);
  const [userCreations, setUserCreations] = useState<Recipe[]>([]); 

  // Popups State
  const [showScalePopup, setShowScalePopup] = useState(false);
  const [showSubstitutePopup, setShowSubstitutePopup] = useState(false);
  const [showHealthierPopup, setShowHealthierPopup] = useState(false);

  const [suggestionPopup, setSuggestionPopup] = useState<{ type: 'Category' | 'Collection' } | null>(null);

  // Pantry State
  const [showAddPantryItem, setShowAddPantryItem] = useState(false);
  const [showMarkAsCooked, setShowMarkAsCooked] = useState(false);
  const [showPantryScanReview, setShowPantryScanReview] = useState(false);
  const [scannedPantryItems, setScannedPantryItems] = useState<{items: Ingredient[], source: 'Receipt' | 'Fridge'} | null>(null);
  const [showPantryScanningPopup, setShowPantryScanningPopup] = useState(false);
  
  // Saved Recipes State
  const [showSavedRecipesScreen, setShowSavedRecipesScreen] = useState(false);
  const [showAddCollectionPopup, setShowAddCollectionPopup] = useState(false);
  const [recipeToAddToCollection, setRecipeToAddToCollection] = useState<Recipe | null>(null);

  // Barcode Scanner State
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scanTarget, setScanTarget] = useState<'pantry' | 'nutrition'>('pantry');

  // Load global recipe data
  useEffect(() => {
      const loadData = async () => {
          const recipes = await recipeService.getAll();
          setGlobalRecipes(recipes);
      }
      loadData();
  }, [contentVersion]); 

  const handleLoginSuccess = (id: string) => {
      setUserId(id);
      setIsLoggedIn(true);
  };

  const handleTabSwitch = (newTab: Tab) => {
      setActiveTab(newTab);
      setViewingProfileId(null);
      setShowCreatorDashboard(false);
      setShowSavedRecipesScreen(false);
      setActiveSubScreen(null);
      setShowNutritionTracker(false);
      setShowCreatorSettings(false);
      setActiveUserList(null);
      setScopedFeedState(null); 
      setFeedJumpId(null);
      setShowMealPlanner(false);
      setShowSmartSuggestions(false);
      setShowSmartSwaps(false);
      setShowCookWhatYouHave(false);
  };

  const handleOpenProfileFeed = (recipe: Recipe, ownerId: string) => {
      setScopedFeedState({
          userId: ownerId,
          initialRecipeId: recipe.id,
          fromProfile: true
      });
  };

  const handleViewInFeed = (recipe: Recipe) => {
      const comingFromDashboard = showCreatorDashboard;
      setShowSavedRecipesScreen(false);
      setShowCreatorDashboard(false); 
      
      if (recipe.creatorId) {
          setScopedFeedState({
              userId: recipe.creatorId,
              initialRecipeId: recipe.id,
              fromDashboard: comingFromDashboard,
              fromProfile: !comingFromDashboard
          });
      } else {
          setScopedFeedState(null);
          setFeedJumpId(recipe.id); 
          setActiveTab('Feed');
      }
  };

  const handleEditRecipe = (recipe: Recipe) => {
      setShowCreatorDashboard(false);
      setScopedFeedState(null);
      setEditingRecipe(recipe);
  };

  const handleRecipeUpdateComplete = (updatedRecipe: Recipe) => {
      setContentVersion(prev => prev + 1); 
      setEditingRecipe(null);
  };

  // --- DATA GATE: REAL-TIME PROFILE LISTENER ---
  useEffect(() => {
    if (!isLoggedIn || !userId) {
        if (profileStatus !== 'IDLE') setProfileStatus('IDLE');
        return;
    }

    setProfileStatus('LOADING');
    const userDocRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap: any) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const profile: UserProfile = {
                id: docSnap.id,
                username: data.username,
                bio: data.bio,
                avatarUrl: data.avatarUrl,
                bannerUrl: data.bannerUrl, 
                createdAt: data.createdAt,
                followersCount: data.followersCount || 0,
                followingCount: data.followingCount || 0,
                likedRecipeIds: data.likedRecipeIds || [],
                followingIds: data.followingIds || []
            };
            setUserProfile(profile);
            setProfileStatus('SUCCESS');
        } else {
            setUserProfile(null);
            setProfileStatus('ERROR');
        }
    }, (error: any) => {
        setProfileStatus('ERROR');
    });

    return () => unsubscribe();
  }, [isLoggedIn, userId]);


  const handleOnboardingComplete = (profile: UserProfile) => {
      setUserProfile(profile); 
      setProfileStatus('SUCCESS');
  }

  useEffect(() => {
      if (profileStatus === 'SUCCESS' && userId && userProfile) { 
          const fetchUserData = async () => {
              try {
                  const data = await backend.getUserData(userId);
                  setSettings({
                      theme: data.settings.theme,
                      notificationsEnabled: data.settings.notificationsEnabled,
                      useMetricSystem: data.settings.useMetricSystem,
                      autoplayVideo: data.settings.autoplayVideo,
                      dietaryPreferences: new Set(data.settings.dietaryPreferences as DietaryPreference[])
                  });
                  setNutritionGoals(data.nutritionGoals);
                  setNutritionLog(data.nutritionLog);
                  setDailyTotals(data.nutritionLog.reduce((acc: any, item: any) => {
                      acc.calories += item.nutrition.calories;
                      acc.protein += item.nutrition.protein;
                      acc.carbs += item.nutrition.carbs;
                      acc.fat += item.nutrition.fat;
                      return acc;
                  }, { calories: 0, protein: 0, carbs: 0, fat: 0 }));
                  setSavedMealPlans(data.savedMealPlans);
                  setQuickActions(new Set(data.quickActions));
                  setFavoritedRecipeIds(new Set(data.favoritedRecipeIds));
                  
                  const hydratedCollections: Record<string, { name: string; recipeIds: Set<string> }> = {};
                  Object.entries(data.collections).forEach(([key, val]) => {
                      const collection = val as { name: string; recipeIds: string[] };
                      hydratedCollections[key] = {
                          name: collection.name,
                          recipeIds: new Set(collection.recipeIds)
                      };
                  });
                  setUserCollections(hydratedCollections);
              } catch (e) {
                  console.error("Failed to load secondary user data", e);
              }
          };
          fetchUserData();
      }
  }, [profileStatus, userId]); 

  // --- RENDERING GATES ---

  if (!isLoggedIn) {
      return (
        <div className={`${settings.theme} w-full h-full`}>
            <div className="flex justify-center items-center h-full w-full font-sans bg-gray-100 dark:bg-gray-900 sm:p-4 md:p-8">
                <div className="w-full h-full sm:max-w-[400px] sm:h-[850px] sm:max-h-[100%] bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:shadow-2xl sm:rounded-[40px] overflow-hidden flex flex-col relative transition-all duration-300 ease-in-out">
                    <LoginScreen onLoginSuccess={handleLoginSuccess} />
                </div>
            </div>
        </div>
      );
  }

  if (profileStatus === 'LOADING') {
      return (
        <div className={`${settings.theme} w-full h-full`}>
            <div className="flex justify-center items-center h-full w-full font-sans bg-gray-100 dark:bg-gray-900 sm:p-4 md:p-8">
                <div className="w-full h-full sm:max-w-[400px] sm:h-[850px] sm:max-h-[100%] bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:shadow-2xl sm:rounded-[40px] overflow-hidden flex flex-col relative transition-all duration-300 ease-in-out items-center justify-center">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold">Syncing Profile...</p>
                </div>
            </div>
        </div>
      );
  }

  if (profileStatus === 'ERROR' && !userProfile && userId) {
      return (
          <div className={`${settings.theme} w-full h-full`}>
            <div className="flex justify-center items-center h-full w-full font-sans bg-gray-100 dark:bg-gray-900 sm:p-4 md:p-8">
                <div className="w-full h-full sm:max-w-[400px] sm:h-[850px] sm:max-h-[100%] bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:shadow-2xl sm:rounded-[40px] overflow-hidden flex flex-col relative transition-all duration-300 ease-in-out">
                     <OnboardingScreen userId={userId} onComplete={handleOnboardingComplete} />
                </div>
            </div>
        </div>
      );
  }

  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // --- HANDLERS ---
  const handleUpdateSettings = (newSettings: UserSettings) => { setSettings(newSettings); if (userId) { backend.updateUserData(userId, { settings: { ...newSettings, dietaryPreferences: Array.from(newSettings.dietaryPreferences) } }); } };
  const handleUpdateNutritionLog = (newLog: LoggedFood[]) => { 
      setNutritionLog(newLog); 
      setDailyTotals(newLog.reduce((acc, item) => {
        acc.calories += item.nutrition.calories;
        acc.protein += item.nutrition.protein;
        acc.carbs += item.nutrition.carbs;
        acc.fat += item.nutrition.fat;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 }));
      if (userId) { backend.updateUserData(userId, { nutritionLog: newLog }); } 
  }
  
  const toggleSaveRecipe = (recipeId: string) => { 
      const recipe = globalRecipes.find(r => r.id === recipeId) || userCreations.find(r => r.id === recipeId) || recipeDatabase.find(r => r.id === recipeId);
      if (recipe && userId) {
          backend.toggleSavedRecipe(userId, recipe);
      }
  };

  const toggleRecipeInShoppingList = (recipeId: string) => { 
      const recipe = globalRecipes.find(r => r.id === recipeId) || recipeDatabase.find(r => r.id === recipeId);
      if (recipe && userId) {
          backend.addIngredientsToShoppingList(userId, recipe.ingredients, recipe.title);
          alert("Ingredients added to shopping list!");
      }
  }
  
  const handleSetShoppingListRecipes = (recipeIds: Set<string>) => { 
      const ingredients: Ingredient[] = [];
      recipeIds.forEach(id => {
          const r = recipeDatabase.find(x => x.id === id) || globalRecipes.find(x => x.id === id);
          if(r) {
              const taggedIngs = r.ingredients.map(i => ({ ...i, recipeTitle: r.title }));
              ingredients.push(...taggedIngs);
          }
      });
      if(userId) backend.updateShoppingList(userId, ingredients);
      setActiveSubScreen('shoppingList'); 
  }

  const handleGenerateAIList = async (diet: string, days: number, notes?: string) => {
      if (!userId) return;
      try {
          const result = await generateSmartShoppingList(diet, days, notes);
          await backend.addIngredientsToShoppingList(userId, result.shoppingList);
          setContentVersion(v => v + 1); 
      } catch (e) {
          console.error("AI Generation handler failed", e);
          throw e;
      }
  };

  const handleToggleCheckedItem = (itemName: string) => { 
      const isChecked = realtimeCheckedItems.has(itemName.toLowerCase().trim());
      if(userId) backend.toggleShoppingItemChecked(userId, itemName, !isChecked);
  };
  
  const handleFinishShopping = (list: Ingredient[]) => { 
      const checkedItems = list.filter(item => realtimeCheckedItems.has(item.name.toLowerCase().trim()));
      if (userId) {
          checkedItems.forEach(item => backend.updatePantryItem(userId, item));
          backend.clearShoppingList(userId); 
          alert("Checked items moved to Pantry!");
      }
      setActiveSubScreen(null); 
  };

  const handleManualAddIngredient = (item: Ingredient) => {
      if (userId) backend.addIngredientsToShoppingList(userId, [item]);
  };

  const handleNavigate = (screen: SubScreen) => { if (screen === 'nutrition') setShowNutritionTracker(true); else { setActiveSubScreen(screen); setActiveTab('You'); } }
  
  const handleCookWhatYouHave = async () => { 
      setIsFetchingSuggestions(true); setShowCookWhatYouHave(true); 
      try { const suggestions = await getRecipesFromIngredients(realtimePantryItems); setSuggestedRecipes(suggestions); } 
      catch (error) { console.error("Failed to get AI suggestions:", error); setSuggestedRecipes([]); } 
      finally { setIsFetchingSuggestions(false); } 
  }
  
  const handleGenerateMealPlan = async (days: number, customPrompt: string, includeRecipes: Recipe[], goals: NutritionGoals) => { setShowGenerationNotice(true); setIsFetchingMealPlan(true); setMealPlan(null); try { const plan = await getMealPlan(days, settings.dietaryPreferences, customPrompt, includeRecipes, goals); setMealPlan(plan); } catch (error) { console.error("Failed to generate meal plan:", error); setMealPlan(null); } finally { setIsFetchingMealPlan(false); } };
  const handleSaveMealPlan = (plan: MealPlan) => { const newSavedPlan: SavedMealPlan = { id: Date.now().toString(), title: `Meal Plan for ${plan.length} Days`, createdAt: new Date().toISOString(), plan: plan }; const newPlans = [newSavedPlan, ...savedMealPlans]; setSavedMealPlans(newPlans); if(userId) backend.updateUserData(userId, { savedMealPlans: newPlans }); alert('Meal plan saved!'); };
  
  const handleAddMealPlanToShoppingList = (plan: SavedMealPlan) => { 
      const allIngredients: Ingredient[] = [];
      plan.plan.forEach(day => {
          Object.values(day.meals).forEach((meal: any) => {
              if(meal.ingredients) allIngredients.push(...meal.ingredients);
          });
      });
      if(userId) backend.updateShoppingList(userId, allIngredients);
      setShowSavedMealPlans(false); setActiveSubScreen('shoppingList'); setActiveTab('You'); 
  };
  
  const handleGetSmartSuggestions = async () => { setIsFetchingSmartSuggestions(true); setShowSmartSuggestions(true); try { const savedRecipesList = globalRecipes.filter(recipe => realtimeSavedIds.has(recipe.id)); const suggestions = await getSmartSuggestions(savedRecipesList, settings.dietaryPreferences); setSmartSuggestions(suggestions); } catch (error) { console.error("Failed to get smart suggestions:", error); setSmartSuggestions([]); } finally { setIsFetchingSmartSuggestions(false); } };
  const handleLogFood = async (query: string, meal: LoggedFood['meal']) => { setIsLoggingFood(true); try { const nutritionInfo = await getNutritionInfo(query); const newLogEntry: LoggedFood = { id: Date.now().toString(), name: nutritionInfo.foodName, meal, nutrition: { ...nutritionInfo } }; handleUpdateNutritionLog([...nutritionLog, newLogEntry]); setShowAddFood(false); } catch (error) { console.error("Failed to log food:", error); } finally { setIsLoggingFood(false); } }
  const handleRemoveLoggedFood = (foodId: string) => handleUpdateNutritionLog(nutritionLog.filter(item => item.id !== foodId));
  const handleResetNutritionLog = () => handleUpdateNutritionLog([]);
  const handleSetNutritionGoals = (newGoals: NutritionGoals) => { setNutritionGoals(newGoals); if(userId) backend.updateUserData(userId, { nutritionGoals: newGoals }); setShowSetGoals(false); }
  const handleAddNewRecipe = (newRecipe: Omit<Recipe, 'id' | 'creator' | 'likes' | 'comments' | 'shares'>) => { setContentVersion(prev => prev + 1); const newFullRecipe: Recipe = { ...newRecipe, id: `temp_${Date.now()}`, creator: { username: userProfile!.username || 'Me', avatarUrl: userProfile!.avatarUrl || '' }, likes: 0, comments: 0, shares: 0 }; setUserCreations(prev => [newFullRecipe, ...prev]); setShowUploadScreen(false); }
  const handleSubmitSuggestion = (suggestion: string) => { alert(`Thank you for your suggestion: "${suggestion}"! We'll review it.`); setSuggestionPopup(null); };
  const handleAddPantryItems = (itemsToAdd: Ingredient[]) => { if(userId) { itemsToAdd.forEach(item => backend.updatePantryItem(userId, item)); } };
  const handleRemovePantryItem = (itemName: string) => { if(userId) backend.removePantryItem(userId, itemName); }
  const handleCookRecipe = (recipeId: string) => { const recipe = recipeDatabase.find(r => r.id === recipeId); if (!recipe) return; if(userId) { recipe.ingredients.forEach(ing => { backend.removePantryItem(userId, ing.name); }); } setShowMarkAsCooked(false); alert(`"${recipe.title}" cooked! Ingredients removed from pantry.`); };
  const handleScanPantryImage = async (file: File, source: 'Receipt' | 'Fridge') => { setShowAddPantryItem(false); if (source === 'Fridge') setShowPantryScanningPopup(true); try { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = async () => { const base64Image = (reader.result as string).split(',')[1]; const parseFunction = source === 'Receipt' ? parseItemsFromReceipt : parseItemsFromFridge; const items = await parseFunction(base64Image); setScannedPantryItems({ items, source }); setShowPantryScanReview(true); }; } catch (error) { console.error(`Error scanning from ${source}`, error); alert(`Failed to scan image.`); } finally { if (source === 'Fridge') setShowPantryScanningPopup(false); } };
  const handleConfirmPantryScan = (itemsToAdd: Ingredient[]) => { handleAddPantryItems(itemsToAdd); setShowPantryScanReview(false); setScannedPantryItems(null); };
  const handleToggleFavorite = (recipeId: string) => { const newSet = new Set<string>(favoritedRecipeIds); if (newSet.has(recipeId)) newSet.delete(recipeId); else newSet.add(recipeId); setFavoritedRecipeIds(newSet); if (userId) backend.updateUserData(userId, { favoritedRecipeIds: Array.from(newSet) }); };
  const handleCreateCollection = (name: string) => { const newId = name.toLowerCase().replace(/\s+/g, '-'); if (userCollections[newId]) { alert("A collection with this name already exists."); return; } const newCollections: Record<string, { name: string; recipeIds: Set<string> }> = { ...userCollections, [newId]: { name, recipeIds: new Set<string>() } }; setUserCollections(newCollections); if (userId) { const serialized = {} as any; Object.entries(newCollections).forEach(([k, v]) => { serialized[k] = { name: v.name, recipeIds: Array.from(v.recipeIds) }; }); backend.updateUserData(userId, { collections: serialized }); } setShowAddCollectionPopup(false); };
  const handleAddRecipeToCollection = (collectionId: string, recipeId: string) => { const newCollections: Record<string, { name: string; recipeIds: Set<string> }> = { ...userCollections }; newCollections[collectionId] = { ...newCollections[collectionId], recipeIds: new Set(newCollections[collectionId].recipeIds) }; newCollections[collectionId].recipeIds.add(recipeId); setUserCollections(newCollections); if (userId) { const serialized = {} as any; Object.entries(newCollections).forEach(([k, v]) => { serialized[k] = { name: v.name, recipeIds: Array.from(v.recipeIds) }; }); backend.updateUserData(userId, { collections: serialized }); } setRecipeToAddToCollection(null); };
  const handleUpdateQuickActions = (newActions: Set<QuickActionType>) => { setQuickActions(newActions); if (userId) backend.updateUserData(userId, { quickActions: Array.from(newActions) }); }
  const handleOpenAddToCollectionSheet = (recipe: Recipe) => { setRecipeToAddToCollection(recipe); }
  const handleOpenBarcodeScanner = (target: 'pantry' | 'nutrition') => { setScanTarget(target); setShowBarcodeScanner(true); }
  const handleBarcodeScan = (data: { name: string; amount: string; nutrition?: any }) => { setShowBarcodeScanner(false); if (scanTarget === 'pantry') { handleAddPantryItems([{ name: data.name, amount: data.amount, barcode: 'scanned' }]); alert(`Added ${data.amount} of ${data.name} to pantry.`); setShowAddPantryItem(false); } else { const newLog: LoggedFood = { id: Date.now().toString(), name: data.name, meal: 'Snacks', nutrition: data.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 } }; handleUpdateNutritionLog([...nutritionLog, newLog]); alert(`Logged ${data.name} to Nutrition Tracker.`); setShowAddFood(false); } };
  const handleViewRecipeFromNotification = async (recipeId: string) => { let recipe = globalRecipes.find(r => r.id === recipeId) || userCreations.find(r => r.id === recipeId) || recipeDatabase.find(r => r.id === recipeId); if (!recipe) { try { recipe = await recipeService.getById(recipeId); } catch (e) { console.error("Failed to load recipe from notification", e); } } if (recipe) { setSelectedRecipe(recipe); setShowNotifications(false); } };
  const handleShowUserList = (type: 'followers' | 'following', userId: string) => { setActiveUserList({ type, userId }); };

  const renderContent = () => {
    if (!userProfile || !userId) return null;

    if (scopedFeedState) {
        return (
            <FeedScreen 
                onSelectRecipe={setSelectedRecipe} 
                savedRecipeIds={realtimeSavedIds} 
                toggleSaveRecipe={toggleSaveRecipe} 
                onComment={setCommentingOnRecipe} 
                onAskAi={() => setIsAiChatActive(true)} 
                userProfile={userProfile} 
                onProfileClick={setViewingProfileId}
                onOpenNotifications={() => setShowNotifications(true)}
                filterUserId={scopedFeedState.userId}
                initialRecipeId={scopedFeedState.initialRecipeId}
                onClose={() => {
                    if (scopedFeedState.fromDashboard) {
                        setScopedFeedState(null);
                        setShowCreatorDashboard(true);
                    } else {
                        setScopedFeedState(null);
                    }
                }}
                onEditRecipe={handleEditRecipe}
                fromProfile={scopedFeedState.fromProfile}
                fromDashboard={scopedFeedState.fromDashboard}
                feedType="creator"
            />
        );
    }

    if (viewingProfileId && userProfile) {
        return (
            <PublicProfileScreen 
                targetUserId={viewingProfileId}
                currentUser={userProfile}
                onClose={() => setViewingProfileId(null)}
                onSelectRecipe={(recipe) => handleOpenProfileFeed(recipe, viewingProfileId)}
                onShowUserList={handleShowUserList}
                onRestorePlan={(plan) => setPlanToRestore(plan)}
            />
        );
    }

    if (showSavedRecipesScreen) {
        return <SavedRecipesScreen
            onClose={() => setShowSavedRecipesScreen(false)}
            savedRecipes={realtimeSavedRecipes}
            favoritedRecipeIds={favoritedRecipeIds}
            onToggleFavorite={handleToggleFavorite}
            userCollections={userCollections}
            onOpenAddCollection={() => setShowAddCollectionPopup(true)}
            onAddToCollection={handleOpenAddToCollectionSheet}
            onSelectRecipe={setSelectedRecipe}
            onViewInFeed={handleViewInFeed} 
        />
    }

    if (showCreatorDashboard) {
        return <CreatorDashboardScreen
            onClose={() => setShowCreatorDashboard(false)}
            userId={userId}
            userProfile={userProfile}
            onUpload={() => setShowUploadScreen(true)}
            onSelectRecipe={setSelectedRecipe} 
            onEditRecipe={handleEditRecipe} 
            onViewVideo={handleViewInFeed} 
            onOpenSettings={() => setShowCreatorSettings(true)}
            onShowUserList={handleShowUserList}
            dataVersion={contentVersion}
        />
    }

    switch (activeTab) {
      case 'Feed': return (
        <FeedScreen 
            onSelectRecipe={setSelectedRecipe} 
            savedRecipeIds={realtimeSavedIds} 
            toggleSaveRecipe={toggleSaveRecipe} 
            onComment={setCommentingOnRecipe} 
            onAskAi={() => setIsAiChatActive(true)} 
            userProfile={userProfile} 
            onProfileClick={setViewingProfileId}
            onOpenNotifications={() => setShowNotifications(true)} 
            initialRecipeId={feedJumpId || undefined}
            onEditRecipe={handleEditRecipe}
        />
      );
      case 'Search': return <SearchScreen onSelectRecipe={setSelectedRecipe} pantryItems={realtimePantryItems} onAskAi={() => setIsAiChatActive(true)} onSuggest={(type) => setSuggestionPopup({ type })} onViewTrendingFeed={handleViewInFeed} onViewProfile={setViewingProfileId} />;
      case 'AI': return <AIScreen onAskAi={() => setIsAiChatActive(true)} pantryItems={realtimePantryItems} allRecipes={recipeDatabase} onCookWhatYouHave={handleCookWhatYouHave} onPlanMeal={() => setShowMealPlanner(true)} onSmartSuggestions={handleGetSmartSuggestions} onSmartSwaps={() => setShowSmartSwaps(true)} />;
      case 'You': return <ProfileScreen 
                    userProfile={userProfile} 
                    savedRecipeIds={realtimeSavedIds} 
                    onSelectRecipe={(recipe) => handleOpenProfileFeed(recipe, userProfile.id)}
                    shoppingListRecipeIds={new Set(realtimeShoppingList.map(i => i.name))} 
                    pantryItemCount={realtimePantryItems.length} 
                    onNavigate={handleNavigate} 
                    onOpenSettings={() => setShowSettings(true)} 
                    dailyCalories={dailyTotals.calories} 
                    calorieGoal={nutritionGoals.calories} 
                    onOpenCreatorDashboard={() => setShowCreatorDashboard(true)} 
                    onOpenSavedRecipes={() => setShowSavedRecipesScreen(true)} 
                    onAskAi={() => setIsAiChatActive(true)} 
                    onScanPantry={() => setShowAddPantryItem(true)} 
                    onLogFood={() => setShowAddFood(true)} 
                    onCreateRecipe={() => setShowUploadScreen(true)} 
                    quickActions={quickActions} 
                    setQuickActions={handleUpdateQuickActions} 
                    onOpenMealPlanner={() => setShowMealPlanner(true)} 
                    onGetSmartSuggestions={handleGetSmartSuggestions} 
                />;
      default: return null;
    }
  };
  
  const renderSubScreen = () => {
    switch(activeSubScreen) {
        case 'generateList':
            return <GenerateShoppingListScreen savedRecipes={realtimeSavedRecipes} onBack={() => setActiveSubScreen(null)} onConfirm={handleSetShoppingListRecipes} initialSelectedIds={new Set()} />
        case 'shoppingList':
            return <ShoppingListScreen 
                userId={userId!}
                list={realtimeShoppingList} 
                recipes={globalRecipes} 
                checkedItems={realtimeCheckedItems} 
                onToggleChecked={handleToggleCheckedItem} 
                onFinishShopping={() => handleFinishShopping(realtimeShoppingList)} 
                onBack={() => setActiveSubScreen(null)} 
                onRemoveRecipe={toggleRecipeInShoppingList} 
                onAddRecipes={() => setActiveSubScreen('generateList')}
                onGenerateAIList={handleGenerateAIList}
                onManualAdd={handleManualAddIngredient}
            />
        case 'pantry':
            return <PantryScreen items={realtimePantryItems} onBack={() => setActiveSubScreen(null)} onAddItem={() => setShowAddPantryItem(true)} onRemoveItem={handleRemovePantryItem} onCookRecipe={() => setShowMarkAsCooked(true)} />
        default: return null;
    }
  }

  return (
    <>
    <style>{`
      html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
    <div className={`${settings.theme} w-full h-full`}>
      <div className="flex justify-center items-center h-full w-full font-sans bg-gray-100 dark:bg-gray-900 sm:p-4 md:p-8">
        <div className="w-full h-full sm:max-w-[400px] sm:h-[850px] sm:max-h-[100%] bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:shadow-2xl sm:rounded-[40px] overflow-hidden flex flex-col relative transition-all duration-300 ease-in-out">
          <main className="flex-grow overflow-hidden h-full relative w-full">{renderContent()}</main>
          
          {activeSubScreen === null && !showNutritionTracker && !showSavedRecipesScreen && !activeUserList && !editingRecipe && !viewingProfileId && (<BottomNavBar activeTab={activeTab} setActiveTab={handleTabSwitch} />)}
          
          {renderSubScreen()}
          {selectedRecipe && (<RecipeBottomSheet recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} isSaved={selectedRecipe.id ? realtimeSavedIds.has(selectedRecipe.id) : false} onToggleSave={() => toggleSaveRecipe(selectedRecipe.id)} isRecipeInShoppingList={false} toggleRecipeInShoppingList={() => toggleRecipeInShoppingList(selectedRecipe.id)} onSendToSmartHome={() => {}} onScale={() => setShowScalePopup(true)} onSubstitute={() => setShowSubstitutePopup(true)} onMakeHealthier={() => setShowHealthierPopup(true)} />)}
          {commentingOnRecipe && (<CommentSheet recipe={commentingOnRecipe} onClose={() => setCommentingOnRecipe(null)} currentUser={userProfile} onViewProfile={setViewingProfileId} />)}
          {isAiChatActive && userProfile && (<div className="absolute inset-0 z-40 bg-white dark:bg-gray-950"><ChatScreen onBack={() => setIsAiChatActive(false)} pantryItems={realtimePantryItems} nutritionLog={nutritionLog} mealPlan={mealPlan} savedRecipes={realtimeSavedRecipes} userSettings={settings} /></div>)}
          {showSettings && (<SettingsScreen onClose={() => setShowSettings(false)} settings={settings} onUpdateSettings={handleUpdateSettings} onOpenCreatorSettings={() => setShowCreatorSettings(true)} />)}
          {showCookWhatYouHave && (<RecipeSuggestionsScreen onClose={() => setShowCookWhatYouHave(false)} isLoading={isFetchingSuggestions} suggestions={suggestedRecipes} />)}
          {showMealPlanner && (<MealPlannerScreen onClose={() => setShowMealPlanner(false)} onGenerate={handleGenerateMealPlan} isLoading={isFetchingMealPlan} mealPlan={mealPlan} onSave={handleSaveMealPlan} savedRecipes={realtimeSavedRecipes} onShowSaved={() => setShowSavedMealPlans(true)} onSelectRecipe={setSelectedRecipe} />)}
          
          {/* FIXED: Passed userId={userId!} to the overlay instance */}
          {showSavedMealPlans && (
            <SavedMealPlansScreen 
                userId={userId!}
                onClose={() => setShowSavedMealPlans(false)} 
                savedPlans={savedMealPlans} 
                onAddToShoppingList={handleAddMealPlanToShoppingList} 
                onSelectRecipe={setSelectedRecipe} 
            />
          )}

          {showSmartSuggestions && (<SmartSuggestionsScreen onClose={() => setShowSmartSuggestions(false)} isLoading={isFetchingSmartSuggestions} suggestions={smartSuggestions} />)}
          {showSmartSwaps && (<SmartSwapsScreen onClose={() => setShowSmartSwaps(false)} getSwaps={getSmartSwaps} />)}
          {showNutritionTracker && (<NutritionTrackerScreen onClose={() => setShowNutritionTracker(false)} log={nutritionLog} goals={nutritionGoals} onAddFood={() => setShowAddFood(true)} onShowHistory={() => setShowNutritionHistory(true)} onRemoveFood={handleRemoveLoggedFood} onResetLog={handleResetNutritionLog} onEditGoals={() => setShowSetGoals(true)} onShowDetails={setDetailedFoodItem} onScanBarcode={() => handleOpenBarcodeScanner('nutrition')} />)}
          {showAddFood && (<AddFoodScreen onClose={() => setShowAddFood(false)} onLogFood={handleLogFood} isLoading={isLoggingFood} onScanBarcode={() => handleOpenBarcodeScanner('nutrition')} />)}
          {showNutritionHistory && (<NutritionHistoryScreen onClose={() => setShowNutritionHistory(false)} log={nutritionLog} goals={nutritionGoals} />)}
          {showSetGoals && (<SetGoalsScreen onClose={() => setShowSetGoals(false)} currentGoals={nutritionGoals} onSave={handleSetNutritionGoals} />)}
          {detailedFoodItem && (<FoodDetailPopup foodItem={detailedFoodItem} onClose={() => setDetailedFoodItem(null)} />)}
          {showUploadScreen && userProfile && (<UploadScreen onClose={() => setShowUploadScreen(false)} onPublish={handleAddNewRecipe} currentUser={userProfile} />)}
          {showScalePopup && selectedRecipe && (<ScaleRecipePopup recipe={selectedRecipe} onClose={() => setShowScalePopup(false)} getScaledIngredients={scaleRecipeIngredients} />)}
          {showSubstitutePopup && selectedRecipe && (<SubstituteIngredientPopup recipe={selectedRecipe} onClose={() => setShowSubstitutePopup(false)} getSuggestions={getIngredientSubstitutes} />)}
          {showHealthierPopup && selectedRecipe && (<MakeHealthierPopup recipe={selectedRecipe} onClose={() => setShowHealthierPopup(false)} getHealthierVersion={makeRecipeHealthier} />)}
          {suggestionPopup && (<SuggestionPopup type={suggestionPopup.type} onClose={() => setSuggestionPopup(null)} onSubmit={handleSubmitSuggestion} />)}
          {showGenerationNotice && (<GenerationNoticePopup onClose={() => setShowGenerationNotice(false)} />)}
          {showAddPantryItem && (<AddPantryItemScreen onClose={() => setShowAddPantryItem(false)} onManualAdd={handleAddPantryItems} onScanImage={handleScanPantryImage} onScanBarcode={() => handleOpenBarcodeScanner('pantry')} />)}
          {showMarkAsCooked && (<MarkAsCookedScreen onClose={() => setShowMarkAsCooked(false)} pantryItems={realtimePantryItems} recipes={recipeDatabase} onCook={handleCookRecipe} />)}
          {showPantryScanReview && scannedPantryItems && (<PantryScanReviewScreen onClose={() => setShowPantryScanReview(false)} scanResult={scannedPantryItems} onConfirm={handleConfirmPantryScan} />)}
          {showPantryScanningPopup && (<PantryScanningPopup onClose={() => setShowPantryScanningPopup(false)} />)}
          {showAddCollectionPopup && (<AddCollectionPopup onClose={() => setShowAddCollectionPopup(false)} onCreate={handleCreateCollection} />)}
          {recipeToAddToCollection && (<AddToCollectionSheet onClose={() => setRecipeToAddToCollection(null)} recipe={recipeToAddToCollection} collections={userCollections} onAddToCollection={handleAddRecipeToCollection} />)}
          {showBarcodeScanner && (<BarcodeScanner onClose={() => setShowBarcodeScanner(false)} onScan={handleBarcodeScan} />)}
          {editingRecipe && userProfile && (<EditRecipeScreen recipe={editingRecipe} onClose={() => setEditingRecipe(null)} onUpdate={handleRecipeUpdateComplete} userId={userProfile.id} />)}
          {showCreatorSettings && userProfile && (<CreatorSettingsSheet onClose={() => setShowCreatorSettings(false)} userProfile={userProfile} onUpdateProfile={setUserProfile} />)}
          {activeUserList && userProfile && (<UserListScreen type={activeUserList.type} targetUserId={activeUserList.userId} currentUserId={userProfile.id} onClose={() => setActiveUserList(null)} onViewProfile={(id) => { setActiveUserList(null); setViewingProfileId(id); }} />)}
          {showNotifications && userProfile && (<NotificationCenter userId={userProfile.id} onClose={() => setShowNotifications(false)} onViewRecipe={handleViewRecipeFromNotification} onViewProfile={setViewingProfileId} />)}
          
          {/* Global Restore Dialog */}
          {planToRestore && userProfile && (
              <div className="absolute inset-0 bg-black/40 z-[100] flex items-end sm:items-center justify-center" onClick={() => setPlanToRestore(null)}>
                  <div className="w-full sm:max-w-sm bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6 sm:hidden"></div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Use "{planToRestore.title}"?</h3>
                    <p className="text-sm text-gray-500 mb-6">Choose how to add these {planToRestore.itemCount} items to your shopping list.</p>
                    <div className="space-y-3">
                        <button 
                            onClick={async () => {
                                await shoppingListService.restoreListToActive(userProfile.id, planToRestore.items, 'merge');
                                setPlanToRestore(null);
                                setActiveSubScreen('shoppingList');
                            }}
                            className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition-all"
                        >
                            Add to current list
                        </button>
                        <button 
                            onClick={async () => {
                                await shoppingListService.restoreListToActive(userProfile.id, planToRestore.items, 'overwrite');
                                setPlanToRestore(null);
                                setActiveSubScreen('shoppingList');
                            }}
                            className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold rounded-2xl hover:bg-gray-200 transition-all"
                        >
                            Replace current list
                        </button>
                        <button onClick={() => setPlanToRestore(null)} className="w-full py-4 text-gray-400 font-bold text-sm">Cancel</button>
                    </div>
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default App;
