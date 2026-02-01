
import { db, auth } from './firebaseConfig';
// @ts-ignore
import { collection, doc, writeBatch, getDocs, query, where, orderBy, setDoc, updateDoc, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { Ingredient, SavedList, MealPlan, CalendarDay } from '../types';

/**
 * SECURITY HELPER: Validates Path IDs
 * Prevents "Ghost Data" bug where app writes to 'users/current' or 'users/undefined'.
 */
const validatePathId = (id: string | undefined | null, context: string): string => {
  if (!id || id === 'current' || id === 'undefined' || id === 'null') {
    const errorMsg = `[ShoppingListService] CRITICAL SECURITY BLOCK: Attempted to access invalid user path '${id}' in ${context}. Operation aborted.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  return id;
};

export const shoppingListService = {
  /**
   * Saves current active shopping list as a template.
   */
  saveListTemplate: async (
    userId: string, // Phone Number (Path ID)
    title: string, 
    items: Ingredient[], 
    isPublic: boolean,
    type: 'shopping_list' | 'meal_plan' = 'shopping_list',
    description: string = '',
    planDetails: MealPlan | CalendarDay[] | null = null 
  ): Promise<void> => {
    const validPathId = validatePathId(userId, 'saveListTemplate');
    
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Authentication required.");
    
    const realOwnerUid = currentUser.uid;

    if (!title.trim()) throw new Error("Missing plan title.");

    const sanitizedItems = items.map(item => ({
      ...item,
      isChecked: false
    }));

    const savedListsRef = collection(db, 'users', validPathId, 'savedLists');
    const newListRef = doc(savedListsRef);

    const payload = {
      id: newListRef.id,
      userId: validPathId,
      ownerUid: realOwnerUid, 
      title: title.trim(),
      type,
      items: sanitizedItems,
      isPublic: !!isPublic,
      description: description.trim(),
      itemCount: sanitizedItems.length,
      planDetails: planDetails,
      createdAt: serverTimestamp() 
    };

    try {
      await setDoc(newListRef, payload);
      console.log(`[ShoppingListService] ✅ Save Success! Path: users/${validPathId}/savedLists`);
    } catch (e: any) {
      console.error("[ShoppingListService] ❌ Save Failed:", e);
      throw new Error("Failed to save plan. Permission Denied or Network Error.");
    }
  },

  /**
   * Updates an existing plan's metadata.
   */
  updatePlan: async (userPathId: string, planId: string, updates: Partial<SavedList>): Promise<void> => {
    const validPathId = validatePathId(userPathId, 'updatePlan');
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Authentication required.");

    const planRef = doc(db, 'users', validPathId, 'savedLists', planId);
    
    try {
      // Security Check: Ensure the requester owns this plan
      const snap = await getDoc(planRef);
      if (!snap.exists()) throw new Error("Plan not found.");
      if (snap.data().ownerUid !== currentUser.uid) {
        throw new Error("Unauthorized: You do not own this plan.");
      }

      await updateDoc(planRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log(`[ShoppingListService] Plan ${planId} updated successfully.`);
    } catch (e) {
      console.error("[ShoppingListService] Update failed:", e);
      throw e;
    }
  },

  /**
   * Deletes a plan from the user's directory.
   */
  deletePlan: async (userPathId: string, planId: string): Promise<void> => {
    const validPathId = validatePathId(userPathId, 'deletePlan');
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Authentication required.");

    const planRef = doc(db, 'users', validPathId, 'savedLists', planId);
    
    try {
      // Security Check
      const snap = await getDoc(planRef);
      if (!snap.exists()) return;
      if (snap.data().ownerUid !== currentUser.uid) {
        throw new Error("Unauthorized: You do not own this plan.");
      }

      await deleteDoc(planRef);
      console.log(`[ShoppingListService] Plan ${planId} deleted.`);
    } catch (e) {
      console.error("[ShoppingListService] Delete failed:", e);
      throw e;
    }
  },

  /**
   * Fetches user's saved lists with the "Unbreakable Query" strategy.
   * STRICT SECURITY COMPLIANCE: Matches 'allow read: if resource.data.ownerUid == request.auth.uid'
   */
  getUserSavedLists: async (userPathId: string): Promise<SavedList[]> => {
    try {
        const validPathId = validatePathId(userPathId, 'getUserSavedLists');
        
        const currentUser = auth.currentUser;
        if (!currentUser) return [];

        console.log(`[ShoppingListService] Fetching plans for ${validPathId} (Owner: ${currentUser.uid})`);

        const listsRef = collection(db, 'users', validPathId, 'savedLists');

        // 1. SIMPLE SECURE QUERY
        // We filter by ownerUid to satisfy security rules.
        const q = query(
            listsRef, 
            where('ownerUid', '==', currentUser.uid)
        );
        
        const snap = await getDocs(q);
        
        // 2. MAP & NORMALIZE
        const plans = snap.docs.map(d => {
            const data = d.data();
            return { 
                id: d.id, 
                ...data,
                // Ensure createdAt is always a string for the UI
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
            } as unknown as SavedList;
        });

        // 3. CLIENT-SIDE SORT
        // Newest first. Handles string dates and Firestore Timestamps safely via the map above.
        plans.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

        console.log(`[ShoppingListService] Found ${plans.length} plans.`);
        return plans;

    } catch (error) {
        console.warn("[ShoppingListService] Aborted fetch:", error);
        return [];
    }
  },

  /**
   * Fetches public lists for a specific creator.
   */
  getPublicLists: async (targetUserPathId: string): Promise<SavedList[]> => {
    try {
        const validPathId = validatePathId(targetUserPathId, 'getPublicLists');
        console.log(`[ShoppingListService] Fetching Public Lists for ID: ${validPathId}`);

        const listsRef = collection(db, 'users', validPathId, 'savedLists');
        
        try {
            const q = query(
                listsRef, 
                where('isPublic', '==', true),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            return snap.docs.map(d => {
                const data = d.data();
                return { 
                    id: d.id, 
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
                } as unknown as SavedList;
            });
        } catch (indexError) {
            console.warn("[ShoppingListService] Index missing for Public Lists. Falling back.");
            const q = query(listsRef, where('isPublic', '==', true));
            const snap = await getDocs(q);
            const lists = snap.docs.map(d => ({ 
                id: d.id, 
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as unknown as SavedList));
            return lists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    } catch (e) {
        console.error("Failed to fetch public lists:", e);
        return [];
    }
  },

  /**
   * Restores a saved list into active list using Atomic WriteBatch.
   */
  restoreListToActive: async (
    userId: string, 
    templateItems: Ingredient[], 
    mode: 'merge' | 'overwrite'
  ): Promise<void> => {
    const validPathId = validatePathId(userId, 'restoreListToActive');

    try {
      const batch = writeBatch(db);
      const activeListRef = collection(db, 'users', validPathId, 'shopping_list');

      if (mode === 'overwrite') {
        const currentItemsSnap = await getDocs(activeListRef);
        currentItemsSnap.docs.forEach(d => batch.delete(d.ref));
      }

      templateItems.forEach(item => {
        if (!item.name) return;
        const itemId = item.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        const itemRef = doc(activeListRef, itemId);
        
        batch.set(itemRef, {
          ...item,
          isChecked: false,
          updatedAt: new Date().toISOString(),
          createdAt: serverTimestamp()
        }, { merge: true });
      });

      await batch.commit();
    } catch (e) {
      console.error("Failed to restore list batch:", e);
      throw e;
    }
  },

  addIngredientsToActiveList: async (userId: string, ingredients: (string | Ingredient)[]): Promise<void> => {
      const validPathId = validatePathId(userId, 'addIngredientsToActiveList');
      if (ingredients.length === 0) return;

      try {
          const batch = writeBatch(db);
          const activeListRef = collection(db, 'users', validPathId, 'shopping_list');

          ingredients.forEach(raw => {
              let item: Ingredient;
              if (typeof raw === 'string') {
                  item = { name: raw, amount: '1', category: 'Uncategorized', isChecked: false };
              } else {
                  item = { ...raw, isChecked: false };
              }
              if (!item.name) return;
              const itemId = item.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
              const itemRef = doc(activeListRef, itemId);
              batch.set(itemRef, {
                  ...item,
                  updatedAt: new Date().toISOString(),
                  createdAt: serverTimestamp()
              }, { merge: true });
          });
          await batch.commit();
      } catch (e) {
          console.error("Failed to add ingredients:", e);
          throw e;
      }
  },

  /**
   * INTELLIGENT PARSER: Extracts all ingredients from a complex Meal Plan
   * and adds them to the user's active shopping list.
   */
  addMealPlanToActiveList: async (userId: string, planDetails: MealPlan | CalendarDay[]): Promise<void> => {
      const validPathId = validatePathId(userId, 'addMealPlanToActiveList');
      if (!planDetails || !Array.isArray(planDetails)) return;

      console.log(`[ShoppingListService] Flattening ${planDetails.length} day meal plan for shopping list...`);
      const allIngredients: Ingredient[] = [];

      // Iterate through days
      planDetails.forEach(day => {
          // Identify meal slots (support both 'meals' wrapper (AI) and direct properties (Manual))
          const slots = ['breakfast', 'lunch', 'dinner', 'snacks'];

          slots.forEach(slotName => {
              let mealData: any;
              
              // Handle different data shapes (AI vs Manual)
              if ('meals' in day && (day as any).meals) {
                  // AI Structure: day.meals.breakfast
                  mealData = (day as any).meals[slotName];
              } else {
                  // Manual Structure: day.breakfast
                  mealData = (day as any)[slotName];
              }

              if (mealData && mealData.ingredients && Array.isArray(mealData.ingredients)) {
                  mealData.ingredients.forEach((ing: any) => {
                      // Normalize and tag
                      allIngredients.push({
                          name: ing.name,
                          amount: ing.amount || '1',
                          // Add metadata so user knows where it came from in the list
                          recipeTitle: mealData.title || mealData.customName || `Meal Plan - ${day.day}`,
                          isChecked: false
                      });
                  });
              }
          });
      });

      if (allIngredients.length === 0) {
          console.warn("[ShoppingListService] No ingredients found in plan details.");
          return;
      }

      console.log(`[ShoppingListService] Extracted ${allIngredients.length} ingredients. Adding to batch...`);
      // Reuse existing batch adder which handles batching and validation
      await shoppingListService.addIngredientsToActiveList(validPathId, allIngredients);
  },

  deleteSavedList: async (userId: string, listId: string): Promise<void> => {
      return shoppingListService.deletePlan(userId, listId);
  }
};
