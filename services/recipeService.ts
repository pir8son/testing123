
import { IRecipeRepository } from './repositories/IRecipeRepository';
import { MockRecipeRepo } from './repositories/MockRecipeRepo';
import { FirestoreRecipeRepo } from './repositories/FirestoreRecipeRepo';
import { db, storage } from './firebaseConfig';
import { mediaService } from './mediaService';
import { Recipe, UserProfile } from '../types';
// @ts-ignore
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp, getDoc, writeBatch, collection, getDocs, query } from 'firebase/firestore';
// @ts-ignore
import { ref, deleteObject } from 'firebase/storage';
import { generateKeywords } from '../utils/searchUtils';

/**
 * RECIPE SERVICE CONTROLLER
 * 
 * Handles data access (via Repositories) AND complex business logic
 * like media processing, validation, and write operations.
 */
class RecipeService {
  private repo: IRecipeRepository;

  constructor() {
    const isFirebaseReady = !!db;
    if (isFirebaseReady) {
      console.info('🔥 [RecipeService] Initialized with FIRESTORE Repository');
      this.repo = new FirestoreRecipeRepo();
    } else {
      console.info('🌱 [RecipeService] Initialized with MOCK Repository (Firebase not ready)');
      this.repo = new MockRecipeRepo();
    }
  }

  // --- READ OPERATIONS (Delegated to Repo) ---

  async getFeed(limitCount?: number, lastVisible?: any) {
    return this.repo.getFeed(limitCount, lastVisible);
  }

  /**
   * THE "FOR YOU" FEED ALGORITHM (V1)
   */
  async getForYouFeed(userId?: string): Promise<Recipe[]> {
      console.log("[Feed Algo] Generating Hybrid Feed...");
      
      try {
          const [freshResult, trendingResult] = await Promise.all([
              this.repo.getFeed(10), 
              this.repo.getTrending(10) 
          ]);

          const freshRecipes = freshResult.recipes;
          const trendingRecipes = trendingResult;

          const combinedFeed: Recipe[] = [];
          const seenIds = new Set<string>();

          const addUnique = (recipe: Recipe) => {
              if (!seenIds.has(recipe.id)) {
                  combinedFeed.push(recipe);
                  seenIds.add(recipe.id);
              }
          };

          const maxLength = Math.max(freshRecipes.length, trendingRecipes.length);
          for (let i = 0; i < maxLength; i++) {
              if (i < freshRecipes.length) addUnique(freshRecipes[i]);
              if (i < trendingRecipes.length) addUnique(trendingRecipes[i]);
          }

          // Shuffle
          for (let i = combinedFeed.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [combinedFeed[i], combinedFeed[j]] = [combinedFeed[j], combinedFeed[i]];
          }

          return combinedFeed;

      } catch (error) {
          console.error("Hybrid Feed Generation Failed, falling back to basic feed.", error);
          const fallback = await this.repo.getFeed(10);
          return fallback.recipes;
      }
  }

  async getTrendingRecipes(limit: number = 4) {
    return this.repo.getTrending(limit);
  }

  async getAll() {
    return this.repo.getAll();
  }

  async getById(id: string) {
    return this.repo.getById(id);
  }

  async search(query: string) {
    return this.repo.search(query);
  }

  /**
   * Fetches a specific user's recipes.
   * Guaranteed to be sorted by CreatedAt Descending to match Profile Grid order.
   */
  async getUserRecipes(userId: string) {
    return this.repo.getUserRecipes(userId);
  }

  async trackView(recipeId: string) {
      this.repo.incrementViewCount(recipeId).catch(err => 
          console.warn(`Failed to track view for ${recipeId}`, err)
      );
  }

  // --- WRITE OPERATIONS (Handled Here) ---

  async createRecipe(
    user: UserProfile, 
    recipeData: Omit<Recipe, 'id' | 'creator' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'imageUrl' | 'videoUrl' | 'thumbnailUrl'>,
    files: { video?: File, image?: File },
    thumbnailTimePosition: number = 1000,
    category?: string
  ): Promise<Recipe> {
    
    if (!user || !user.id) throw new Error("User required to create recipe");
    if (!files.video) throw new Error("Video file is required");

    console.log(`[RecipeService] Starting creation for user: ${user.username}`);

    let finalImageUrl = '';
    let finalVideoUrl = '';
    
    try {
        let thumbBlob: Blob;

        if (files.image) {
            console.log("📸 [1/3] Compressing User Cover Photo...");
            thumbBlob = await mediaService.compressImage(files.image);
        } else {
            console.log(`🎞️ [1/3] Generating Thumbnail from Video at ${thumbnailTimePosition}ms...`);
            const rawThumb = await mediaService.generateThumbnail(files.video, thumbnailTimePosition);
            thumbBlob = await mediaService.compressImage(rawThumb);
        }

        console.log("⬆️ [2/3] Uploading Thumbnail...");
        finalImageUrl = await mediaService.uploadFileToFirebase(
            user.id, 
            thumbBlob, 
            'thumbnails', 
            'cover', 
            'jpg'
        );

        console.log("⬆️ [3/3] Uploading Video...");
        finalVideoUrl = await mediaService.uploadFileToFirebase(
            user.id, 
            files.video, 
            'videos', 
            'clip', 
            'mp4'
        );

        const newRecipeId = `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newRecipe: Recipe = {
            ...recipeData,
            id: newRecipeId,
            creatorId: user.id,
            imageUrl: finalImageUrl,
            thumbnailUrl: finalImageUrl,
            videoUrl: finalVideoUrl,
            category: category || 'General',
            creator: {
                username: user.username,
                avatarUrl: user.avatarUrl
            },
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
            createdAt: new Date().toISOString(),
            nutrition: recipeData.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 }
        };

        if (db) {
            const keywords = generateKeywords(newRecipe.title);
            if (category) {
                keywords.push(...generateKeywords(category));
            }

            await setDoc(doc(db, 'recipes', newRecipeId), {
                ...newRecipe,
                keywords: [...new Set(keywords)],
                titleLower: newRecipe.title.toLowerCase(),
                createdAt: serverTimestamp() 
            });
            console.log("✅ Recipe Created Successfully with Server Timestamp!");
        }

        return newRecipe;

    } catch (error) {
        console.error("❌ Create Recipe Failed:", error);
        throw error;
    }
  }

  async updateRecipe(
      userId: string,
      recipeId: string,
      updates: Partial<Recipe>,
      newThumbnailFile?: File
  ): Promise<void> {
      if (!db) {
          console.warn("Mock Mode: Update skipped");
          return;
      }

      console.log(`[RecipeService] Updating recipe: ${recipeId}`);
      
      const recipeRef = doc(db, 'recipes', recipeId);
      const updatePayload: any = { ...updates };

      try {
          const currentDoc = await getDoc(recipeRef);
          if (!currentDoc.exists()) throw new Error("Recipe not found");
          
          const currentData = currentDoc.data();
          if (currentData.creatorId !== userId) {
              throw new Error("Unauthorized: You do not own this recipe.");
          }

          if (newThumbnailFile) {
              console.log("📸 [Update] Compressing & Uploading new thumbnail...");
              const thumbBlob = await mediaService.compressImage(newThumbnailFile);
              const newImageUrl = await mediaService.uploadFileToFirebase(
                  userId, 
                  thumbBlob, 
                  'thumbnails', 
                  'cover_updated', 
                  'jpg'
              );
              updatePayload.imageUrl = newImageUrl;
              updatePayload.thumbnailUrl = newImageUrl;
          }

          if (updatePayload.title || updatePayload.category) {
              const titleToUse = updatePayload.title || currentData.title;
              const categoryToUse = updatePayload.category || currentData.category;
              
              const keywords = generateKeywords(titleToUse);
              if (categoryToUse) {
                  keywords.push(...generateKeywords(categoryToUse));
              }

              updatePayload.keywords = [...new Set(keywords)];
              if (updatePayload.title) {
                  updatePayload.titleLower = updatePayload.title.toLowerCase();
              }
          }
          
          await updateDoc(recipeRef, updatePayload);
          console.log("✅ Recipe Updated Successfully!");

      } catch (error) {
          console.error("❌ Update Recipe Failed:", error);
          throw error;
      }
  }

  /**
   * DELETE RECIPE (Cascade Delete)
   * Removes Firestore document and cleans up Storage files.
   */
  async deleteRecipe(recipeId: string, userId: string): Promise<void> {
      if (!db) {
          console.warn("Mock Mode: Delete skipped");
          return;
      }

      console.log(`[RecipeService] Deleting recipe: ${recipeId}`);
      const recipeRef = doc(db, 'recipes', recipeId);

      try {
          // 1. Fetch doc to get file URLs and verify ownership
          const docSnap = await getDoc(recipeRef);
          if (!docSnap.exists()) {
              console.warn("Recipe already deleted or not found");
              return;
          }

          const data = docSnap.data();
          if (data.creatorId !== userId) {
              throw new Error("Unauthorized: You do not own this recipe.");
          }

          // 2. Delete Firestore Document (Prioritize this to hide it from UI)
          await deleteDoc(recipeRef);
          console.log("✅ Firestore document deleted.");

          // 3. Clean up Storage (Best effort - don't block if fails)
          const cleanupStorage = async () => {
              if (!storage) return;
              
              const urlsToDelete = [data.videoUrl, data.imageUrl, data.thumbnailUrl].filter(u => u && u.startsWith('http'));
              const uniqueUrls = [...new Set(urlsToDelete)];

              for (const url of uniqueUrls) {
                  try {
                      // Create a reference from the full URL
                      const fileRef = ref(storage, url);
                      await deleteObject(fileRef);
                      console.log(`Deleted file: ${url}`);
                  } catch (err: any) {
                      if (err.code === 'storage/object-not-found') {
                          console.warn(`File not found (already deleted): ${url}`);
                      } else {
                          console.error(`Failed to delete file ${url}:`, err);
                      }
                  }
              }
          };
          
          // Run storage cleanup in background
          cleanupStorage();

      } catch (error) {
          console.error("❌ Delete Recipe Failed:", error);
          throw error;
      }
  }
}

export const recipeService = new RecipeService();
if (typeof window !== 'undefined') {
    (window as any).recipeService = recipeService;
}
