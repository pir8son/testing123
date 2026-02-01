
import { IRecipeRepository } from './IRecipeRepository';
import { Recipe } from '../../types';
import { recipeDatabase } from '../../data/recipeDatabase';

// Helper for simulated latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockRecipeRepo implements IRecipeRepository {
  async getFeed(limitCount: number = 5, lastVisible?: any): Promise<{ recipes: Recipe[], lastVisible: any }> {
    await delay(800); // Simulate network latency
    
    // Return items that have a videoUrl (simulating a video feed)
    const validRecipes = recipeDatabase.filter(r => r.videoUrl && r.videoUrl !== 'placeholder.mp4');
    
    const startIndex = lastVisible ? (lastVisible as number) : 0;
    const slicedRecipes = validRecipes.slice(startIndex, startIndex + limitCount);
    const nextIndex = startIndex + limitCount < validRecipes.length ? startIndex + limitCount : null;

    return {
        recipes: slicedRecipes,
        lastVisible: nextIndex
    };
  }

  async getTrending(limitCount: number): Promise<Recipe[]> {
    await delay(500);
    // Sort by likes desc
    return [...recipeDatabase]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, limitCount);
  }

  async getAll(): Promise<Recipe[]> {
    await delay(500);
    return [...recipeDatabase];
  }

  async getById(id: string): Promise<Recipe | undefined> {
    await delay(300);
    return recipeDatabase.find(r => r.id === id);
  }

  async search(query: string): Promise<Recipe[]> {
    await delay(400);
    const lowerQ = query.toLowerCase();
    return recipeDatabase.filter(r => 
        r.title.toLowerCase().includes(lowerQ) || 
        r.ingredients.some(ing => ing.name.toLowerCase().includes(lowerQ)) ||
        r.category?.toLowerCase().includes(lowerQ)
    );
  }

  async getUserRecipes(userId: string): Promise<Recipe[]> {
    await delay(600);
    // Mock implementation: filter by creatorId if present
    return recipeDatabase.filter(r => r.creatorId === userId);
  }

  async incrementViewCount(id: string): Promise<void> {
      // No-op for mock
      console.log(`[Mock] Incremented view for ${id}`);
      return Promise.resolve();
  }
}
