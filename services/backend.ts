
import { UserData, UserSettingsDTO, NutritionGoals, Recipe, Ingredient } from '../types';
import { db } from './firebaseConfig';
// @ts-ignore
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc, writeBatch, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

const DEFAULT_SETTINGS: UserSettingsDTO = {
    theme: 'light',
    dietaryPreferences: [],
    notificationsEnabled: true,
    useMetricSystem: false,
    autoplayVideo: true,
};

const DEFAULT_GOALS: NutritionGoals = { 
    calories: 2200, 
    protein: 160, 
    carbs: 250, 
    fat: 70 
};

// Default state for a brand new user
const getInitialUserData = (userId: string): UserData => ({
    userId,
    savedRecipeIds: [],
    shoppingListRecipeIds: [],
    pantryItems: [],
    settings: DEFAULT_SETTINGS,
    nutritionGoals: DEFAULT_GOALS,
    nutritionLog: [],
    savedMealPlans: [],
    quickActions: ['scan', 'log', 'create'],
    collections: {
        'quick-dinners': { name: 'Quick Dinners', recipeIds: [] },
        'healthy-choices': { name: 'Healthy Choices', recipeIds: [] },
    },
    favoritedRecipeIds: [],
    checkedShoppingListItems: []
});

/**
 * Real Backend API using Firestore
 */
export const backend = {
    /**
     * Get user profile and data. 
     */
    getUserData: async (userId: string): Promise<UserData> => {
        if (!userId) throw new Error("User ID is required");

        try {
            const userDocRef = doc(db, 'users', userId);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                return { ...getInitialUserData(userId), ...docSnap.data() } as UserData;
            } else {
                console.log(`[Firestore] Creating new user profile for ${userId}`);
                const initialData = getInitialUserData(userId);
                await setDoc(userDocRef, initialData);
                return initialData;
            }
        } catch (error: any) {
            console.error("Error fetching user data from Firestore:", error);
            return getInitialUserData(userId);
        }
    },

    /**
     * Update specific fields of user data (Legacy / Settings).
     */
    updateUserData: async (userId: string, updates: Partial<UserData>): Promise<void> => {
        if (!userId) return;
        try {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, updates);
        } catch (error: any) {
            console.error("Failed to sync user data:", error);
        }
    },

    // --- CORE ECOSYSTEM (SUBCOLLECTIONS) ---

    /**
     * Toggle Save Recipe (Denormalized)
     */
    toggleSavedRecipe: async (userId: string, recipe: Recipe): Promise<void> => {
        if (!userId || !recipe.id) return;
        
        const savedRef = doc(db, 'users', userId, 'saved_recipes', recipe.id);
        
        try {
            const docSnap = await getDoc(savedRef);
            if (docSnap.exists()) {
                await deleteDoc(savedRef);
            } else {
                const miniRecipe = {
                    id: recipe.id,
                    title: recipe.title,
                    imageUrl: recipe.imageUrl,
                    cookTime: recipe.cookTime,
                    difficulty: recipe.difficulty,
                    creator: recipe.creator,
                    savedAt: new Date().toISOString()
                };
                await setDoc(savedRef, miniRecipe);
            }
        } catch (e) {
            console.error("Error toggling saved recipe:", e);
        }
    },

    // --- DRAFTS ---

    /**
     * Save Recipe Draft (Initial Creation)
     */
    saveDraft: async (userId: string, recipe: Partial<Recipe>): Promise<void> => {
        if (!userId) return;
        // Ensure ID
        const draftId = recipe.id || `draft_${Date.now()}`;
        const draftRef = doc(db, 'users', userId, 'drafts', draftId);
        
        try {
            await setDoc(draftRef, {
                ...recipe,
                id: draftId, // Ensure ID is in the doc
                updatedAt: new Date().toISOString(),
                status: 'draft'
            }, { merge: true });
            console.log("Draft metadata saved successfully");
        } catch (e) {
            console.error("Error saving draft:", e);
            throw e;
        }
    },

    /**
     * Update existing draft (e.g. after background upload completes)
     */
    updateDraft: async (userId: string, draftId: string, updates: Partial<Recipe>): Promise<void> => {
        if (!userId || !draftId) return;
        const draftRef = doc(db, 'users', userId, 'drafts', draftId);
        try {
            await updateDoc(draftRef, {
                ...updates,
                updatedAt: new Date().toISOString()
            });
            console.log("Draft updated via background task");
        } catch (e) {
            console.error("Error updating draft:", e);
        }
    },

    /**
     * Get User Drafts
     */
    getDrafts: async (userId: string): Promise<Recipe[]> => {
        if (!userId) return [];
        try {
            const draftsRef = collection(db, 'users', userId, 'drafts');
            const q = query(draftsRef, orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Recipe[];
        } catch (e) {
            console.error("Error fetching drafts:", e);
            return [];
        }
    },

    // --- PANTRY ---

    updatePantryItem: async (userId: string, item: Ingredient): Promise<void> => {
        if (!userId || !item.name) return;
        const itemId = item.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        const itemRef = doc(db, 'users', userId, 'pantry', itemId);
        try {
            await setDoc(itemRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
        } catch (e) {
            console.error("Error updating pantry item:", e);
        }
    },

    removePantryItem: async (userId: string, itemName: string): Promise<void> => {
        if (!userId || !itemName) return;
        const itemId = itemName.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        try {
            await deleteDoc(doc(db, 'users', userId, 'pantry', itemId));
        } catch (e) {
            console.error("Error removing pantry item:", e);
        }
    },

    // --- SHOPPING LIST ---

    updateShoppingList: async (userId: string, list: Ingredient[], recipeTitle?: string): Promise<void> => {
        if(!userId) return;
        if (!list || !Array.isArray(list) || list.length === 0) {
            console.warn("Attempted to update shopping list with empty or invalid data.");
            return;
        }
        
        const batch = writeBatch(db);
        list.forEach(item => {
            if (!item.name) return;
            const itemId = item.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
            const itemRef = doc(db, 'users', userId, 'shopping_list', itemId);
            
            // Fix: ensure property access is safe via type casting or interface update
            const payload: any = { 
                ...item, 
                isChecked: item.isChecked || false, 
                updatedAt: new Date().toISOString(),
                createdAt: serverTimestamp()
            };

            if (recipeTitle) {
                payload.addedFromRecipe = recipeTitle;
            }

            batch.set(itemRef, payload, { merge: true });
        });
        
        try {
            await batch.commit();
            console.log(`Batch added ${list.length} items to shopping list.`);
        } catch(e) {
            console.error("Error updating shopping list batch:", e);
        }
    },
    
    addIngredientsToShoppingList: async (userId: string, ingredients: Ingredient[], recipeTitle?: string): Promise<void> => {
        return backend.updateShoppingList(userId, ingredients, recipeTitle);
    },
    
    toggleShoppingItemChecked: async (userId: string, itemName: string, isChecked: boolean): Promise<void> => {
         if (!userId || !itemName) return;
         // USE TRIM and setDoc with merge to prevent "No document to update" errors
         const itemId = itemName.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
         const itemRef = doc(db, 'users', userId, 'shopping_list', itemId);
         try {
             await setDoc(itemRef, { isChecked }, { merge: true });
         } catch (e) {
             console.error("Error toggling item:", e);
         }
    },
    
    clearShoppingList: async (userId: string): Promise<void> => {
        if(!userId) return;
        try {
            const listRef = collection(db, 'users', userId, 'shopping_list');
            const snapshot = await getDocs(listRef);
            const batch = writeBatch(db);
            snapshot.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
        } catch(e) {
            console.error("Error clearing list:", e);
        }
    }
};