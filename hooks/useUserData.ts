
import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
// @ts-ignore
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Recipe, Ingredient } from '../types';

/**
 * Hook to listen to the user's Saved Recipes subcollection.
 * Returns both the list (for SavedScreen) and a Set of IDs (for heart icons).
 */
export const useSavedRecipes = (userId: string | null) => {
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setSavedRecipes([]);
            setSavedRecipeIds(new Set());
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'users', userId, 'saved_recipes'), orderBy('savedAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            const recipes: Recipe[] = [];
            const ids = new Set<string>();
            
            snapshot.forEach((doc: any) => {
                const data = doc.data();
                ids.add(doc.id);
                // Map partial data to Recipe type (fill missing with defaults if needed)
                recipes.push({
                    id: doc.id,
                    title: data.title || 'Untitled',
                    imageUrl: data.imageUrl,
                    creator: data.creator || { username: 'Unknown', avatarUrl: '' },
                    cookTime: data.cookTime || '0 min',
                    difficulty: data.difficulty || 'Medium',
                    // Fill required fields that might not be in mini-object
                    ingredients: [], 
                    instructions: [],
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    prepTime: '0 min',
                    servings: 1,
                    description: '',
                    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
                } as Recipe);
            });
            
            setSavedRecipes(recipes);
            setSavedRecipeIds(ids);
            setLoading(false);
        }, (error: any) => {
            console.error("Error listening to saved recipes:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { savedRecipes, savedRecipeIds, loading };
};

/**
 * Hook to listen to the user's Pantry subcollection.
 */
export const usePantry = (userId: string | null) => {
    const [pantryItems, setPantryItems] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const q = query(collection(db, 'users', userId, 'pantry'));
        
        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            const items: Ingredient[] = [];
            snapshot.forEach((doc: any) => {
                items.push(doc.data() as Ingredient);
            });
            setPantryItems(items);
            setLoading(false);
        }, (error: any) => {
            console.error("Error listening to pantry:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { pantryItems, loading };
};

/**
 * Hook to listen to the user's Shopping List subcollection.
 */
export const useShoppingList = (userId: string | null) => {
    const [shoppingList, setShoppingList] = useState<Ingredient[]>([]);
    // Derive checked state from the list items themselves if we store 'isChecked' on them
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const q = query(collection(db, 'users', userId, 'shopping_list'));
        
        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            const items: Ingredient[] = [];
            const checked = new Set<string>();
            
            snapshot.forEach((doc: any) => {
                const data = doc.data();
                items.push(data as Ingredient);
                if (data.isChecked) {
                    checked.add(data.name.toLowerCase());
                }
            });
            
            setShoppingList(items);
            setCheckedItems(checked);
            setLoading(false);
        }, (error: any) => {
            console.error("Error listening to shopping list:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { shoppingList, checkedItems, loading };
};
