
import { db } from './firebaseConfig';
// @ts-ignore
import { collection, query, where, getDocs, limit, orderBy, writeBatch, doc } from 'firebase/firestore';
import { Recipe, UserProfile } from '../types';
import { generateKeywords } from '../utils/searchUtils';

export const searchService = {
  /**
   * Search recipes using the 'keywords' array.
   * Supports case-insensitive broad matching.
   */
  searchRecipes: async (text: string): Promise<Recipe[]> => {
    if (!text || text.length < 2) return [];
    
    // 1. Sanitize & Tokenize
    const tokens = generateKeywords(text);
    if (tokens.length === 0) return [];

    // 2. Database Query: "Give me everything that contains the FIRST keyword"
    // Firestore `array-contains` can only match one value per query clause.
    // This fetches a superset of data.
    const searchToken = tokens[0]; 
    console.log(`[SearchService] Querying DB for token: "${searchToken}"`);

    try {
        const recipesRef = collection(db, 'recipes');
        const q = query(
            recipesRef,
            where('keywords', 'array-contains', searchToken),
            limit(50) // Higher limit since we might filter client-side
        );
        
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        
        // 3. Client-Side Polish: Filter for MULTI-WORD matches
        // If query is "Banana Bread", DB returns everything with "Banana".
        // We filter JS side to ensure it also contains "Bread".
        // This is highly efficient for datasets < 1M items when combined with DB indexing.
        if (tokens.length > 1) {
            const filteredResults = results.filter(recipe => {
                const titleLower = recipe.title.toLowerCase();
                // Check if ALL search tokens are present in the title (simple check)
                // or if the keywords array contains them (more robust)
                // We'll check the title string for flexibility
                return tokens.every(token => titleLower.includes(token));
            });
            console.log(`[SearchService] Filtered ${results.length} -> ${filteredResults.length} recipes.`);
            return filteredResults;
        }

        console.log(`[SearchService] Found ${results.length} recipes.`);
        return results;

    } catch (e) {
        console.error("[SearchService] Recipe search failed:", e);
        return [];
    }
  },

  /**
   * Search users using the 'keywords' array.
   */
  searchUsers: async (text: string): Promise<UserProfile[]> => {
    if (!text || text.length < 2) return [];
    
    const tokens = generateKeywords(text);
    if (tokens.length === 0) return [];
    
    const searchToken = tokens[0];
    console.log(`[SearchService] Querying Users for token: "${searchToken}"`);

    try {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('keywords', 'array-contains', searchToken),
            limit(20)
        );
        
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        
        // Client-side filtering for multi-word usernames? Rare, but good consistency.
        if (tokens.length > 1) {
             const filteredResults = results.filter(user => {
                const usernameLower = user.username.toLowerCase();
                return tokens.every(token => usernameLower.includes(token));
            });
            return filteredResults;
        }
        
        console.log(`[SearchService] Found ${results.length} users.`);
        return results;
    } catch (e) {
        console.error("[SearchService] User search failed:", e);
        return [];
    }
  },

  /**
   * MIGRATION UTILITY: Call this once to backfill the 'keywords' field on existing data.
   */
  debug_migrateSearchIndex: async () => {
      console.log("⚠️ Starting Search Index Migration (Tokenization)...");
      
      try {
          const batch = writeBatch(db);
          let count = 0;

          // 1. Migrate Recipes
          const recipesSnap = await getDocs(collection(db, 'recipes'));
          recipesSnap.docs.forEach(docSnap => {
              const data = docSnap.data();
              if (data.title) {
                  const keywords = generateKeywords(data.title);
                  if (data.category) {
                      keywords.push(...generateKeywords(data.category));
                  }
                  
                  // Only update if keywords are missing or look different (simple check)
                  if (!data.keywords || data.keywords.length === 0) {
                      const ref = doc(db, 'recipes', docSnap.id);
                      batch.update(ref, { 
                          keywords: [...new Set(keywords)],
                          titleLower: data.title.toLowerCase() 
                      });
                      count++;
                  }
              }
          });

          // 2. Migrate Users
          const usersSnap = await getDocs(collection(db, 'users'));
          usersSnap.docs.forEach(docSnap => {
              const data = docSnap.data();
              if (data.username) {
                  const keywords = generateKeywords(data.username);
                  
                  if (!data.keywords || data.keywords.length === 0) {
                      const ref = doc(db, 'users', docSnap.id);
                      batch.update(ref, { 
                          keywords: [...new Set(keywords)],
                          usernameLower: data.username.toLowerCase()
                      });
                      count++;
                  }
              }
          });

          if (count > 0) {
              await batch.commit();
              console.log(`✅ Successfully migrated ${count} documents with keywords.`);
          } else {
              console.log("✅ No documents needed migration.");
          }

      } catch (e) {
          console.error("❌ Migration Failed:", e);
      }
  }
};
