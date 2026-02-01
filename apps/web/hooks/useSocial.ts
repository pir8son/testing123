
import { useState } from 'react';
import { interactionService } from '../services/interactionService';
import { UserProfile } from '../types';

/**
 * Hook for handling Likes with Optimistic UI updates.
 */
export const useLike = (
    recipeId: string, 
    initialLikes: number, 
    initialIsLiked: boolean,
    currentUser: UserProfile | null,
    creatorId?: string, 
    recipeTitle?: string 
) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikes);
    const [isAnimating, setIsAnimating] = useState(false);

    const toggleLike = async () => {
        if (!currentUser) {
            alert("Please log in to like recipes.");
            return;
        }

        const prevLiked = isLiked;
        const prevCount = likeCount;

        const newLikedState = !prevLiked;
        setIsLiked(newLikedState);
        setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

        if (newLikedState) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 800);
        }

        try {
            // @ts-ignore
            const serverResult = await interactionService.toggleLike(
                currentUser.id, 
                recipeId, 
                creatorId, 
                recipeTitle
            );
            
            if (serverResult !== newLikedState) {
                setIsLiked(serverResult);
                setLikeCount(prev => serverResult ? prevCount + 1 : prevCount - 1);
            }
        } catch (error) {
            setIsLiked(prevLiked);
            setLikeCount(prevCount);
        }
    };

    return { isLiked, likeCount, toggleLike, isAnimating };
};

/**
 * Hook for handling Follows.
 * Refactored to support parent-driven state synchronization.
 */
export const useFollow = (
    targetUserId: string,
    initialIsFollowing: boolean,
    currentUser: UserProfile | null,
    onSuccess?: () => void 
) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const toggleFollow = async () => {
        if (!currentUser || !targetUserId) {
            if (!currentUser) alert("Please log in to follow creators.");
            return;
        }
        
        setIsLoading(true);
        const prevFollowing = isFollowing;
        const newFollowingState = !prevFollowing;
        
        setIsFollowing(newFollowingState);

        try {
            const serverResult = await interactionService.followUser(currentUser.id, targetUserId);
            setIsFollowing(serverResult);
            
            if (serverResult && onSuccess) {
                onSuccess();
            }
        } catch (error) {
            setIsFollowing(prevFollowing);
            console.error("Failed to toggle follow:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { isFollowing, toggleFollow, isLoading };
};
