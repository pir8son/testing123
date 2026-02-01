
import { Recipe } from '../../types';

export interface IRecipeRepository {
  /**
   * Fetches the main feed of recipes with pagination.
   * @param limitCount Number of items to fetch
   * @param lastVisible The cursor for pagination (Snapshot for Firestore, index for Mock)
   */
  getFeed(limitCount: number, lastVisible?: any): Promise<{ recipes: Recipe[], lastVisible: any }>;

  /**
   * Fetches the top trending recipes based on likes and recency.
   * @param limitCount Number of items to return
   */
  getTrending(limitCount: number): Promise<Recipe[]>;

  /**
   * Fetches all available recipes.
   */
  getAll(): Promise<Recipe[]>;

  /**
   * Fetches a single recipe by its ID.
   * @param id The recipe ID
   */
  getById(id: string): Promise<Recipe | undefined>;

  /**
   * Searches for recipes based on a query string.
   * @param query The search term
   */
  search(query: string): Promise<Recipe[]>;

  /**
   * Fetches recipes created by a specific user, sorted by creation date (desc).
   * @param userId The user's ID
   */
  getUserRecipes(userId: string): Promise<Recipe[]>;

  /**
   * Atomically increments the view count for a recipe.
   * @param id The recipe ID
   */
  incrementViewCount(id: string): Promise<void>;
}
