
// --- DOMAIN MODELS ---

export type MessageSender = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
}

// Strict UserProfile matching Firestore 'users' collection document
export interface UserProfile {
  id: string;          // Phone Number (Document ID)
  username: string;
  bio: string;
  avatarUrl: string;
  bannerUrl?: string;  
  createdAt: string;
  followersCount: number;
  followingCount: number;
  likedRecipeIds: string[]; 
  followingIds: string[];   
}

export interface Creator {
  username: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  text: string;
  createdAt: string; 
}

export interface Ingredient {
  name: string;
  amount: string;
  inPantry?: boolean;
  isChecked?: boolean;
  recipeTitle?: string;
  barcode?: string;
  category?: string; 
  isAiGenerated?: boolean; 
}

export interface Nutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: string;
  creatorId?: string; 
  title: string;
  imageUrl: string;
  thumbnailUrl?: string; 
  videoUrl?: string;
  creator: Creator;
  likes: number;
  comments: number;
  shares: number;
  views?: number; 
  prepTime: string;
  cookTime: string;
  servings: number;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: Nutrition;
  difficulty: Difficulty;
  category?: string;
  collections?: string[];
  tags?: string[];
  createdAt?: string;
}

// --- NEW CALENDAR STRUCTURES ---

export interface MealSlot {
  recipeId?: string;      // If linked to a recipe
  recipeTitle?: string;   // For display
  customName?: string;    // If manually entered (e.g. "Leftovers")
  imageUrl?: string;      // Visual cue
  ingredients?: Ingredient[]; // Extracted ingredients
}

export interface CalendarDay {
  day: string; // "Monday", "Tuesday", etc.
  breakfast?: MealSlot;
  lunch?: MealSlot;
  dinner?: MealSlot;
  snacks?: MealSlot;
}

/**
 * SavedList: Reusable shopping list templates or public meal plans
 */
export interface SavedList {
  id: string;
  userId: string;    // Path Identity (Phone Number)
  ownerUid: string;  // Security Identity (Firebase Auth UID)
  title: string;
  type: 'shopping_list' | 'meal_plan';
  items: Ingredient[];
  isPublic: boolean;
  createdAt: string;
  description?: string;
  itemCount: number;
  // Supports both AI plans (MealPlan) and Manual plans (CalendarDay[])
  planDetails?: MealPlan | CalendarDay[]; 
}

// --- NOTIFICATIONS ---

export type NotificationType = 'like' | 'comment' | 'follow' | 'system';

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderUsername: string;
  senderAvatarUrl: string;
  type: NotificationType;
  resourceId?: string; 
  resourceImage?: string; 
  resourceTitle?: string; 
  message: string;
  isRead: boolean;
  createdAt: string;
}

// --- USER & SETTINGS MODELS ---

export type Theme = 'light' | 'dark';
export type DietaryPreference = 'Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Dairy-Free';

export interface UserSettings {
  theme: Theme;
  dietaryPreferences: Set<DietaryPreference>;
  notificationsEnabled: boolean;
  useMetricSystem: boolean;
  autoplayVideo: boolean;
}

export interface UserSettingsDTO {
  theme: Theme;
  dietaryPreferences: string[];
  notificationsEnabled: boolean;
  useMetricSystem: boolean;
  autoplayVideo: boolean;
}

export interface SuggestedRecipe {
    recipeName: string;
    description: string;
    ingredients: string[];
    instructions: string[];
}

// --- MEAL PLANNER MODELS ---

export interface DayPlan {
    day: string;
    meals: {
        breakfast: Recipe;
        lunch: Recipe;
        dinner: Recipe;
        snacks: Recipe;
    };
    dailyNutrition: Nutrition;
}

export type MealPlan = DayPlan[];

export interface SavedMealPlan {
  id: string;
  title: string;
  createdAt: string;
  plan: MealPlan;
}

export interface SmartSuggestion {
    recipeName: string;
    description: string;
    reason: string;
}

// --- NUTRITION TRACKER MODELS ---

export interface NutritionGoals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface LoggedFood {
    id: string;
    name: string;
    meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
    nutrition: Nutrition;
}

// --- AI & UTILITY MODELS ---

export interface HealthierVersion {
    newTitle: string;
    description: string;
    ingredients: Ingredient[];
    instructions: string[];
}

export interface RefinedShoppingListItem {
  name: string;
  amount: string;
  category: string;
  recipes: string[];
}

export interface AIShoppingListResult {
  mealPlan: { day: string; meals: string[] }[];
  shoppingList: Ingredient[];
}

export type QuickActionType = 'scan' | 'log' | 'create' | 'plan' | 'suggest';

export type SubScreen = 'generateList' | 'shoppingList' | 'pantry' | 'nutrition';

export interface UserData {
    userId: string;
    savedRecipeIds: string[];
    shoppingListRecipeIds: string[];
    pantryItems: Ingredient[];
    settings: UserSettingsDTO;
    nutritionGoals: NutritionGoals;
    nutritionLog: LoggedFood[];
    savedMealPlans: SavedMealPlan[];
    quickActions: QuickActionType[];
    collections: Record<string, { name: string; recipeIds: string[] }>;
    favoritedRecipeIds: string[];
    checkedShoppingListItems: string[];
}
