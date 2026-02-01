
import { db } from './firebaseConfig';
import { UserProfile } from '../types';
// @ts-ignore
import { doc, getDoc, runTransaction, increment, updateDoc } from 'firebase/firestore';
import { generateKeywords } from '../utils/searchUtils';

export const userService = {
  /**
   * Updates user profile data and maintains normalized fields for search.
   * Use this instead of direct updateDoc calls for profile changes.
   */
  updateUserProfile: async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
    if (!userId) throw new Error("User ID required");

    const payload: any = { ...updates };
    
    // SEARCH INDEX UPDATE: Generate tokens if username/identity changes
    // We combine username and potentially display name (if added later)
    if (payload.username) {
        const textToTokenize = `${payload.username}`; // Add ${payload.displayName} here in future
        payload.keywords = generateKeywords(textToTokenize);
        payload.usernameLower = payload.username.toLowerCase(); // Keep for exact match legacy
    }

    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, payload);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
  },

  /**
   * Follow a user.
   * Creates documents in sub-collections and increments counters atomically.
   */
  followUser: async (currentUserId: string, targetUserId: string): Promise<void> => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      console.warn("Invalid follow request");
      return;
    }

    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    // Sub-collection references
    // users/{current}/following/{target}
    const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    // users/{target}/followers/{current}
    const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);

    try {
      await runTransaction(db, async (transaction: any) => {
        // 1. Check if already following to prevent double counting
        const followingDoc = await transaction.get(followingRef);
        if (followingDoc.exists()) {
          throw new Error("Already following");
        }

        // 2. Create the relationship docs
        transaction.set(followingRef, { since: new Date().toISOString() });
        transaction.set(followerRef, { since: new Date().toISOString() });

        // 3. Increment counters
        transaction.update(currentUserRef, { followingCount: increment(1) });
        transaction.update(targetUserRef, { followersCount: increment(1) });
      });
      console.log(`User ${currentUserId} is now following ${targetUserId}`);
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  },

  /**
   * Unfollow a user.
   * Deletes documents from sub-collections and decrements counters atomically.
   */
  unfollowUser: async (currentUserId: string, targetUserId: string): Promise<void> => {
    if (!currentUserId || !targetUserId) return;

    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);

    try {
      await runTransaction(db, async (transaction: any) => {
        const followingDoc = await transaction.get(followingRef);
        if (!followingDoc.exists()) {
          throw new Error("Not following");
        }

        // 1. Delete relationship docs
        transaction.delete(followingRef);
        transaction.delete(followerRef);

        // 2. Decrement counters
        transaction.update(currentUserRef, { followingCount: increment(-1) });
        transaction.update(targetUserRef, { followersCount: increment(-1) });
      });
      console.log(`User ${currentUserId} unfollowed ${targetUserId}`);
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  },

  /**
   * Check if the current user follows the target user.
   */
  checkIsFollowing: async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    if (!currentUserId || !targetUserId) return false;
    try {
      const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
      const docSnap = await getDoc(followingRef);
      return docSnap.exists();
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  }
};
