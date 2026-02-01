
import { IRecipeRepository } from './IRecipeRepository';
import { Recipe, Nutrition, Creator } from '../../types';
import { db } from '../firebaseConfig';
// @ts-ignore -- Resolves TS error claiming exports are missing in firebase/firestore module
import { collection, getDocs, doc, getDoc, query, where, limit, orderBy, startAfter, updateDoc, increment, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export class FirestoreRecipeRepo implements IRecipeRepository {
  private readonly collectionName = 'recipes';

  /**
   * DATA MAPPER
   * Converts raw Firestore data into our strict Recipe interface.
   * CRITICAL FIX: Handles Firestore Timestamp objects by converting them to ISO strings.
   */
  private mapDocumentToRecipe(docSnap: QueryDocumentSnapshot | DocumentData, id: string): Recipe {
    const data = docSnap.data ? docSnap.data() : docSnap;

    // Safe Defaults
    const defaultCreator: Creator = { username: 'Unknown Chef', avatarUrl: '' };
    const defaultNutrition: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Timestamp Handling
    let createdAt = new Date().toISOString(); // Default fallback
    if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
            // It's a Firestore Timestamp
            createdAt = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
            // It's already a string (Legacy data)
            createdAt = data.createdAt;
        }
    }

    return {
      id: id,
      creatorId: data.creatorId,
      title: data.title || 'Untitled Recipe',
      imageUrl: data.imageUrl || '',
      videoUrl: data.videoUrl || undefined,
      thumbnailUrl: data.thumbnailUrl || undefined,
      creator: data.creator ? { ...defaultCreator, ...data.creator } : defaultCreator,
      likes: data.likes || 0,
      comments: data.comments || 0,
      shares: data.shares || 0,
      views: data.views || 0,
      prepTime: data.prepTime || '0 min',
      cookTime: data.cookTime || '0 min',
      servings: data.servings || 1,
      description: data.description || '',
      difficulty: data.difficulty || 'Medium',
      category: data.category || 'General',
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      instructions: Array.isArray(data.instructions) ? data.instructions : [],
      collections: Array.isArray(data.collections) ? data.collections : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      nutrition: data.nutrition ? { ...defaultNutrition, ...data.nutrition } : defaultNutrition,
      createdAt: createdAt
    };
  }

  async getFeed(limitCount: number = 20, lastVisible?: any): Promise<{ recipes: Recipe[], lastVisible: any }> {
    try {
      const recipesRef = collection(db, this.collectionName);
      
      // CRITICAL: Order by 'createdAt' desc is required to show the newest uploads first.
      let q = query(
        recipesRef, 
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
      
      const querySnapshot = await getDocs(q);
      
      const recipes = querySnapshot.docs.map(doc => 
        this.mapDocumentToRecipe(doc, doc.id)
      );

      const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        recipes,
        lastVisible: newLastVisible
      };

    } catch (error: any) {
      console.error("[Firestore] Error fetching feed:", error);
      
      if (error.message && error.message.includes("indexes")) {
          console.error("🔥 MISSING FIRESTORE INDEX: Please follow the link in the error message above to create the required index for 'createdAt'.");
      }

      return { recipes: [], lastVisible: null };
    }
  }

  async getTrending(limitCount: number = 4): Promise<Recipe[]> {
    try {
      const recipesRef = collection(db, this.collectionName);
      
      // Sort by likes desc, then by date desc for freshness
      const q = query(
        recipesRef,
        orderBy('likes', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.mapDocumentToRecipe(doc, doc.id));

    } catch (error: any) {
      console.error("[Firestore] Error fetching trending:", error);
      
      if (error.message && error.message.includes("indexes")) {
          console.error("🔥 MISSING INDEX for Trending: Create index on 'likes' (Desc) + 'createdAt' (Desc)");
      }
      return [];
    }
  }

  async getAll(): Promise<Recipe[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        this.mapDocumentToRecipe(doc, doc.id)
      );
    } catch (error) {
      console.error("[Firestore] Error fetching all recipes:", error);
      return [];
    }
  }

  async getById(id: string): Promise<Recipe | undefined> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.mapDocumentToRecipe(docSnap, docSnap.id);
      } else {
        return undefined;
      }
    } catch (error) {
      console.error(`[Firestore] Error fetching recipe ${id}:`, error);
      return undefined;
    }
  }

  async search(searchQuery: string): Promise<Recipe[]> {
    if (!searchQuery.trim()) return [];
    try {
        const allRecipes = await this.getAll();
        const lowerQ = searchQuery.toLowerCase();
        
        return allRecipes.filter(r => 
            r.title.toLowerCase().includes(lowerQ) || 
            r.ingredients.some(ing => ing.name.toLowerCase().includes(lowerQ)) ||
            (r.category && r.category.toLowerCase().includes(lowerQ))
        );
    } catch (error) {
        console.error("[Firestore] Error searching recipes:", error);
        return [];
    }
  }

  async getUserRecipes(userId: string): Promise<Recipe[]> {
    if (!userId) {
        console.warn("[Firestore] getUserRecipes called with undefined userId. Skipping query.");
        return [];
    }

    const recipesRef = collection(db, this.collectionName);

    try {
        // Enforce Newest-First order for Profile Grid
        const q = query(
            recipesRef,
            where('creatorId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => this.mapDocumentToRecipe(doc, doc.id));

    } catch (error: any) {
        if (error.message && (error.message.includes("indexes") || error.code === 'failed-precondition')) {
             console.warn("⚠️ Firestore Index missing for User Recipes. Falling back to client-side sorting.");
             try {
                 const simpleQ = query(recipesRef, where('creatorId', '==', userId));
                 const snapshot = await getDocs(simpleQ);
                 const recipes = snapshot.docs.map(doc => this.mapDocumentToRecipe(doc, doc.id));
                 return recipes.sort((a, b) => {
                     const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                     const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                     return dateB - dateA;
                 });
             } catch (fallbackError) {
                 console.error("[Firestore] Fallback query failed:", fallbackError);
                 return [];
             }
        }
        console.error("[Firestore] Error fetching user recipes:", error);
        return [];
    }
  }

  async incrementViewCount(id: string): Promise<void> {
      try {
          const docRef = doc(db, this.collectionName, id);
          await updateDoc(docRef, {
              views: increment(1)
          });
      } catch (error) {
          console.error("Failed to increment view count", error);
      }
  }
}
