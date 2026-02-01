
import { Recipe } from '../types';

export interface IRecipeRepository {
  /**
   * Fetches the video feed.
   */
  getFeed(page?: number, limit?: number): Promise<Recipe[]>;

  /**
   * Fetches all recipes.
   */
  getAllRecipes(): Promise<Recipe[]>;

  /**
   * Fetches a specific recipe by ID.
   */
  getRecipeById(id: string): Promise<Recipe | undefined>;

  /**
   * Searches recipes based on a query string.
   */
  searchRecipes(query: string): Promise<Recipe[]>;
}
