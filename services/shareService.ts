
import { Recipe, UserProfile } from '../types';
import { isWeb, warnIfNotWeb } from '../utils/platform';

const APP_URL = 'https://swipetorecipe.app';

export const shareService = {
  /**
   * Share a specific recipe.
   */
  shareRecipe: async (recipe: Recipe) => {
    const url = `${APP_URL}/recipe/${recipe.id}`;
    const text = `Check out ${recipe.title} by @${recipe.creator.username} on Swipe to Recipe!`;
    const title = recipe.title;

    await shareData(title, text, url);
  },

  /**
   * Share a user profile.
   */
  shareProfile: async (profile: UserProfile) => {
    const url = `${APP_URL}/user/${profile.id}`;
    const text = `Check out @${profile.username}'s profile on Swipe to Recipe!`;
    const title = `@${profile.username} on Swipe to Recipe`;

    await shareData(title, text, url);
  },

  /**
   * Share a feed post (Video).
   */
  sharePost: async (recipe: Recipe) => {
    // In this app architecture, posts are recipes.
    const url = `${APP_URL}/video/${recipe.id}`;
    const text = `Watch this delicious video for ${recipe.title} by @${recipe.creator.username}!`;
    const title = recipe.title;

    await shareData(title, text, url);
  }
};

/**
 * Internal helper to handle Native Share vs Clipboard Fallback
 */
async function shareData(title: string, text: string, url: string) {
  if (!isWeb) {
    warnIfNotWeb('Sharing content');
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
    // Desktop Fallback
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
    }
  } else {
    console.warn('Sharing is not supported in this environment.');
  }
}
