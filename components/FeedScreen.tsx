
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Recipe, UserProfile } from '../types';
import { recipeService } from '../services/recipeService';
import { HeartIcon } from './icons/HeartIcon';
import { MessageCircleIcon } from './icons/MessageCircleIcon';
import { ShareIcon } from './icons/ShareIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BellIcon } from './icons/BellIcon';
import { PlayIcon } from './icons/PlayIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { EditIcon } from './icons/EditIcon';
import { useSmartGesture } from '../hooks/useSmartGesture';
import { useLike, useFollow } from '../hooks/useSocial';
import { shareService } from '../services/shareService';

interface FeedScreenProps {
  onSelectRecipe: (recipe: Recipe) => void;
  savedRecipeIds: Set<string>;
  toggleSaveRecipe: (recipeId: string) => void;
  onComment: (recipe: Recipe) => void;
  onAskAi: () => void;
  userProfile: UserProfile | null;
  onProfileClick: (userId: string) => void;
  onOpenNotifications: () => void;
  filterUserId?: string; 
  initialRecipeId?: string; 
  onClose?: () => void; 
  feedType?: 'global' | 'trending' | 'creator'; 
  onEditRecipe?: (recipe: Recipe) => void;
  fromProfile?: boolean; 
  fromDashboard?: boolean; 
}

const FeedItem: React.FC<{ 
  recipe: Recipe; 
  onSelectRecipe: (recipe: Recipe) => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onComment: () => void;
  onAskAi: () => void;
  isActive: boolean;
  userProfile: UserProfile | null;
  onProfileClick: (userId: string) => void;
  onEditRecipe?: (recipe: Recipe) => void;
  isFollowing: boolean; // Prop from parent
  onFollowSuccess: (userId: string) => void; // Parent callback
}> = ({ 
    recipe, onSelectRecipe, isSaved, onToggleSave, onComment, 
    onAskAi, isActive, userProfile, onProfileClick, onEditRecipe,
    isFollowing, onFollowSuccess
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { isLiked, likeCount, toggleLike, isAnimating: isHeartAnimating } = useLike(
      recipe.id,
      recipe.likes,
      userProfile?.likedRecipeIds?.includes(recipe.id) || false,
      userProfile,
      recipe.creatorId, 
      recipe.title
  );

  const { toggleFollow, isLoading: isFollowLoading } = useFollow(
      recipe.creatorId || '',
      isFollowing,
      userProfile,
      () => onFollowSuccess(recipe.creatorId!)
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef(false);
  const touchStartX = useRef(0);

  const isValidVideo = React.useMemo(() => {
      return recipe.videoUrl && 
             recipe.videoUrl !== 'placeholder.mp4' && 
             recipe.videoUrl.startsWith('http');
  }, [recipe.videoUrl]);

  const isOwner = userProfile && recipe.creatorId === userProfile.id;

  useEffect(() => {
    if (isActive && isValidVideo && !hasError) {
      const playPromise = videoRef.current?.play();
      if (playPromise !== undefined) {
          playPromise
            .then(() => {
                setIsPlaying(true);
                setHasError(false);
            })
            .catch(() => setIsPlaying(false));
      }
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive, isValidVideo, hasError]);

  const togglePlay = () => {
    if (videoRef.current && isValidVideo && !hasError) {
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
    }
  };

  const handleShare = async () => {
      await shareService.sharePost(recipe);
  }

  const handleSmartTap = useSmartGesture({
      onSingleTap: togglePlay,
      onDoubleTap: () => {
          if (!isLiked) toggleLike();
      },
      delay: 300
  });

  const handleContainerClick = (e: React.MouseEvent) => {
      if (dragRef.current) return;
      handleSmartTap(e);
  };

  const handlePointerDown = (clientX: number) => {
    touchStartX.current = clientX;
    dragRef.current = false;
  };

  const handlePointerMove = (clientX: number) => {
    if (Math.abs(clientX - touchStartX.current) > 10) dragRef.current = true;
  };

  return (
    <div 
      className="w-full h-full relative flex-shrink-0 snap-start bg-black overflow-hidden select-none"
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
      onMouseDown={(e) => handlePointerDown(e.clientX)}
      onMouseMove={(e) => { if (e.buttons === 1) handlePointerMove(e.clientX); }}
      onClick={handleContainerClick}
    >
      <div className="absolute inset-0">
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
      </div>

      {isValidVideo && !hasError ? (
          <video
            ref={videoRef}
            src={recipe.videoUrl}
            className={`w-full h-full object-cover pointer-events-none absolute inset-0 transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
            loop
            playsInline
            webkit-playsinline="true"
            preload="metadata"
            onError={() => setHasError(true)}
            onLoadedData={() => setHasError(false)}
          />
      ) : null}
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 z-10">
            <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm animate-pulse">
                <PlayIcon className="w-8 h-8 text-white ml-1" />
            </div>
        </div>
      )}

      {isHeartAnimating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping-short">
              <HeartIcon className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
          </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>
      
      <div className="absolute bottom-[83px] left-0 right-[60px] p-4 text-white z-20 pointer-events-auto">
        <div className="flex items-center gap-2 mb-3">
          <button 
            onClick={(e) => { 
                e.stopPropagation(); 
                if (recipe.creatorId) {
                    onProfileClick(recipe.creatorId);
                }
            }} 
            className="flex items-center gap-2 group"
          >
              <img src={recipe.creator?.avatarUrl || 'https://i.pravatar.cc/150'} alt={recipe.creator?.username} className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover group-hover:scale-105 transition-transform" />
              <p className="font-bold text-base drop-shadow-md">@{recipe.creator?.username || 'unknown'}</p>
          </button>
          
          {/* OPTIMIZED UI: Only show Follow button if NOT following and NOT owner */}
          {userProfile && recipe.creatorId && recipe.creatorId !== userProfile.id && !isFollowing && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFollow(); }}
                disabled={isFollowLoading}
                className="text-xs font-bold px-3 py-1 rounded-full shadow-lg transition-all border bg-white border-white text-black active:scale-95"
              >
                  {isFollowLoading ? '...' : 'Follow'}
              </button>
          )}
        </div>
        <h2 className="text-lg font-semibold mb-2 drop-shadow-md leading-tight line-clamp-2">{recipe.title}</h2>
        <div 
          onClick={(e) => { e.stopPropagation(); onSelectRecipe(recipe); }}
          className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-lg cursor-pointer transition-colors border border-white/10"
        >
            <span className="text-sm font-medium">View Recipe</span>
            <span className="text-sm">→</span>
        </div>
      </div>

      <div className="absolute bottom-[95px] right-2 flex flex-col items-center gap-5 text-white z-20 pointer-events-auto">
        {isOwner && (
            <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onEditRecipe) onEditRecipe(recipe);
                }} 
                className="flex flex-col items-center group transition-transform active:scale-90"
            >
                <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                    <EditIcon className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <span className="text-xs font-bold mt-1 drop-shadow-md">Edit</span>
            </button>
        )}

        <button onClick={(e) => { e.stopPropagation(); toggleLike(); }} className="flex flex-col items-center group transition-transform active:scale-90">
            <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                <HeartIcon className={`w-8 h-8 transition-colors drop-shadow-lg ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
            </div>
            <span className="text-xs font-bold mt-1 drop-shadow-md">{likeCount.toLocaleString()}</span>
        </button>
        
        <button onClick={(e) => { e.stopPropagation(); onComment(); }} className="flex flex-col items-center group transition-transform active:scale-90">
            <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                <MessageCircleIcon className="w-8 h-8 text-white fill-white drop-shadow-lg" />
            </div>
            <span className="text-xs font-bold mt-1 drop-shadow-md">{recipe.comments.toLocaleString()}</span>
        </button>
        
        <button onClick={(e) => { e.stopPropagation(); onToggleSave(); }} className="flex flex-col items-center group transition-transform active:scale-90">
            <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                <BookmarkIcon className="w-8 h-8 drop-shadow-lg transition-colors" fill={isSaved ? '#F59E0B' : 'white'} stroke={isSaved ? '#F59E0B' : 'none'} strokeWidth={isSaved ? 0 : 2}/>
            </div>
            <span className="text-xs font-bold mt-1 drop-shadow-md">Save</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="flex flex-col items-center group transition-transform active:scale-90">
            <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                <ShareIcon className="w-8 h-8 drop-shadow-lg" />
            </div>
            <span className="text-xs font-bold mt-1 drop-shadow-md">{recipe.shares}</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); onAskAi(); }} className="mt-2 w-14 h-14 flex flex-col items-center justify-center bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-3 rounded-full shadow-lg shadow-violet-500/50 animate-pulse border-2 border-white/20 transition-transform active:scale-95">
            <SparklesIcon className="w-7 h-7 text-white" />
        </button>
      </div>
      <style>{`
        @keyframes ping-short {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
        }
        .animate-ping-short { animation: ping-short 0.8s cubic-bezier(0, 0, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

const FeedScreen: React.FC<FeedScreenProps> = ({ 
    onSelectRecipe, savedRecipeIds, toggleSaveRecipe, onComment, 
    onAskAi, userProfile, onProfileClick, onOpenNotifications,
    filterUserId, initialRecipeId, onClose, feedType, onEditRecipe,
    fromProfile, fromDashboard
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(initialRecipeId || null);
  const [feedRecipes, setFeedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const viewedRecipesRef = useRef<Set<string>>(new Set());
  
  const [pullY, setPullY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // GLOBAL FOLLOW UPDATE HANDLER (The "Source of Truth")
  const handleFollowUpdate = useCallback((targetUserId: string) => {
      setFeedRecipes(prev => prev.map(item => {
          if (item.creatorId === targetUserId) {
              return { ...item, _syncFollowing: true };
          }
          return item;
      }));
  }, []);

  const loadFeed = useCallback(async (isInitial = false) => {
      if (isInitial) {
          if (!refreshing) setLoading(true);
          setInitialScrollDone(false);
      } else {
          setIsFetchingMore(true);
      }

      try {
          let recipes: Recipe[] = [];
          if (feedType === 'trending') {
              recipes = await recipeService.getTrendingRecipes(20);
              setHasMore(false); 
          } else if (filterUserId || feedType === 'creator') {
              recipes = await recipeService.getUserRecipes(filterUserId || '');
              setHasMore(false); 
          } else {
              if (isInitial) {
                  recipes = await recipeService.getForYouFeed();
              } else {
                  if (!lastVisible) {
                      setIsFetchingMore(false);
                      return;
                  }
                  const result = await recipeService.getFeed(5, lastVisible);
                  recipes = result.recipes;
                  setLastVisible(result.lastVisible);
                  setHasMore(!!result.lastVisible && recipes.length > 0);
              }
          }
          
          if (isInitial) {
              setFeedRecipes(recipes);
              if (initialRecipeId) {
                  const targetExists = recipes.some(r => r.id === initialRecipeId);
                  if (targetExists) setActiveRecipeId(initialRecipeId);
                  else if (recipes.length > 0) setActiveRecipeId(recipes[0].id);
              } else if (recipes.length > 0) {
                  setActiveRecipeId(recipes[0].id);
              }
          } else {
              setFeedRecipes(prev => {
                  const existingIds = new Set(prev.map(r => r.id));
                  const uniqueNewRecipes = recipes.filter(r => !existingIds.has(r.id));
                  return [...prev, ...uniqueNewRecipes];
              });
          }

      } catch (err) {
          console.error("Failed to load feed", err);
      } finally {
          setLoading(false);
          setIsFetchingMore(false);
          setRefreshing(false);
          setPullY(0);
      }
  }, [lastVisible, filterUserId, initialRecipeId, feedType, refreshing]);

  useEffect(() => {
    loadFeed(true);
  }, [filterUserId, feedType, loadFeed]); 

  useEffect(() => {
      if (!loading && feedRecipes.length > 0 && containerRef.current && !initialScrollDone) {
          const performJump = () => {
              if (initialRecipeId) {
                  const index = feedRecipes.findIndex(r => r.id === initialRecipeId);
                  if (index !== -1 && containerRef.current) {
                      const child = containerRef.current.children[index] as HTMLElement;
                      if (child) {
                          child.scrollIntoView({ behavior: 'auto', block: 'start' });
                          setActiveRecipeId(initialRecipeId);
                          setInitialScrollDone(true);
                          return;
                      }
                  }
              }
              setInitialScrollDone(true);
          };
          setTimeout(performJump, 50);
      }
  }, [loading, initialRecipeId, feedRecipes, initialScrollDone]);

  const handleTouchStart = (e: React.TouchEvent) => {
      if (containerRef.current?.scrollTop === 0 && !filterUserId && feedType !== 'trending') {
          setIsDragging(true);
          startY.current = e.touches[0].clientY;
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      const currentY = e.touches[0].clientY;
      const delta = currentY - startY.current;
      if (delta > 0) setPullY(Math.min(delta * 0.4, 150));
      else setPullY(0);
  };

  const handleTouchEnd = () => {
      setIsDragging(false);
      if (pullY > 80) { 
          setRefreshing(true);
          setLastVisible(null);
          loadFeed(true);
      } else {
          setPullY(0);
      }
  };

  useEffect(() => {
    if (loading || feedRecipes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            if (id) {
                setActiveRecipeId(id);
                if (!viewedRecipesRef.current.has(id)) {
                    recipeService.trackView(id);
                    viewedRecipesRef.current.add(id);
                }
            }
          }
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );
    const items = containerRef.current?.querySelectorAll('.feed-item');
    items?.forEach((item) => observer.observe(item));
    return () => { items?.forEach((item) => observer.unobserve(item)); };
  }, [loading, feedRecipes]);

  useEffect(() => {
      if (filterUserId || feedType === 'trending') return; 
      if (!activeRecipeId || !hasMore || isFetchingMore || loading || refreshing) return;
      const currentIndex = feedRecipes.findIndex(r => r.id === activeRecipeId);
      if (currentIndex >= feedRecipes.length - 2) {
          loadFeed(false);
      }
  }, [activeRecipeId, feedRecipes, hasMore, isFetchingMore, loading, refreshing, loadFeed, filterUserId, feedType]);

  if (loading && !refreshing) {
      return (
          <div className="h-full w-full bg-black flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
      )
  }

  const showBackButton = (!!filterUserId || feedType === 'trending' || fromProfile || fromDashboard) && !!onClose;

  return (
    <div className="relative w-full h-full animate-slide-in bg-black">
        {showBackButton && (
            <button 
                onClick={onClose}
                className="absolute top-4 left-4 z-[999] p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors border border-white/20 shadow-xl"
            >
                <ArrowLeftIcon className="w-8 h-8" />
            </button>
        )}

        {!filterUserId && feedType !== 'trending' && !fromProfile && !fromDashboard && (
            <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                <button onClick={(e) => { e.stopPropagation(); onOpenNotifications(); }} className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                    <BellIcon className="w-7 h-7 text-white drop-shadow-md" />
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
                </button>
            </div>
        )}

        <div 
            className="absolute top-0 left-0 right-0 z-40 flex justify-center pointer-events-none transition-transform duration-200"
            style={{ 
                transform: `translateY(${pullY - 50}px)`,
                opacity: Math.min(pullY / 60, 1)
            }}
        >
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
                <div className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full ${refreshing ? 'animate-spin' : ''}`}></div>
            </div>
        </div>

        <div 
            ref={containerRef}
            className="h-full w-full overflow-y-auto snap-y snap-mandatory relative bg-black no-scrollbar"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
        {feedRecipes.length > 0 ? (
            <>
                {feedRecipes.map((recipe) => {
                    const isFollowing = (recipe as any)._syncFollowing 
                        ? true 
                        : (userProfile && recipe.creatorId ? userProfile.followingIds?.includes(recipe.creatorId) : false);

                    return (
                        <div key={recipe.id} data-id={recipe.id} className="feed-item h-full w-full snap-start relative">
                            <FeedItem 
                                recipe={recipe} 
                                // FIX: Use 'onSelectRecipe' instead of 'setSelectedRecipe'
                                onSelectRecipe={onSelectRecipe}
                                isSaved={savedRecipeIds.has(recipe.id)}
                                onToggleSave={() => toggleSaveRecipe(recipe.id)}
                                onComment={() => onComment(recipe)}
                                onAskAi={onAskAi}
                                isActive={activeRecipeId === recipe.id}
                                userProfile={userProfile}
                                onProfileClick={onProfileClick}
                                onEditRecipe={onEditRecipe}
                                isFollowing={isFollowing}
                                onFollowSuccess={handleFollowUpdate}
                            />
                        </div>
                    );
                })}
                {isFetchingMore && (
                    <div className="h-20 w-full flex items-center justify-center snap-start bg-black">
                        <div className="w-6 h-6 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </>
        ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-white gap-4">
                <p className="text-xl font-bold">No Recipes Found</p>
                <button onClick={() => loadFeed(true)} className="px-4 py-2 bg-green-600 rounded-full font-bold">Try Again</button>
            </div>
        )}
        </div>
        
        <style>{`
          @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default FeedScreen;
