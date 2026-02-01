
import React, { useState, useEffect, useRef } from 'react';
import { Recipe, UserProfile, SavedList } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import RecipeCard from './RecipeCard';
import { ShareIcon } from './icons/ShareIcon';
import { recipeService } from '../services/recipeService';
import { useFollow } from '../hooks/useSocial'; 
import { db } from '../config/firebase';
import { shareService } from '../services/shareService';
import { shoppingListService } from '../services/shoppingListService';
// @ts-ignore
import { doc, getDoc } from 'firebase/firestore';
import { CalendarIcon } from './icons/CalendarIcon';

interface PublicProfileScreenProps {
  targetUserId: string; // This MUST be the Phone Number ID
  currentUser: UserProfile | null;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onShowUserList: (type: 'followers' | 'following', userId: string) => void;
  onRestorePlan?: (plan: SavedList) => void; 
}

const Stat: React.FC<{ value: string | number; label: string; onClick?: () => void }> = ({ value, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center min-w-[60px] active:opacity-70 transition-opacity">
        <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{value}</p>
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
    </button>
);

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3 font-bold text-sm relative transition-colors ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
    >
        {label}
        {active && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-600 rounded-full"></div>}
    </button>
);

const PublicProfileScreen: React.FC<PublicProfileScreenProps> = ({ 
    targetUserId, 
    currentUser, 
    onClose, 
    onSelectRecipe, 
    onShowUserList,
    onRestorePlan
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plans, setPlans] = useState<SavedList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Recipes' | 'Collections'>('Recipes');
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isFollowing, toggleFollow } = useFollow(
      targetUserId,
      currentUser ? currentUser.followingIds?.includes(targetUserId) || false : false,
      currentUser
  );

  useEffect(() => {
      const loadData = async () => {
          setIsLoading(true);
          try {
              const docRef = doc(db, 'users', targetUserId);
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                  const data = docSnap.data();
                  setProfile({
                      id: docSnap.id,
                      username: data.username,
                      bio: data.bio,
                      avatarUrl: data.avatarUrl,
                      bannerUrl: data.bannerUrl,
                      followersCount: data.followersCount || 0,
                      followingCount: data.followingCount || 0,
                      createdAt: data.createdAt,
                      likedRecipeIds: [], 
                      followingIds: [] 
                  });
              }

              // Parallel Fetch for Content
              const [userRecipes, userPlans] = await Promise.all([
                  recipeService.getUserRecipes(targetUserId),
                  shoppingListService.getPublicLists(targetUserId)
              ]);

              setRecipes(userRecipes);
              setPlans(userPlans);

          } catch (error) {
              console.error("Failed to load public profile:", error);
          } finally {
              setIsLoading(false);
          }
      };

      if (targetUserId) loadData();
  }, [targetUserId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
  };

  const interpolate = (start: number, end: number) => start + (end - start) * progress;

  const MAX_BANNER_HEIGHT = 200;
  const MIN_BANNER_HEIGHT = 80;
  const SCROLL_RANGE = MAX_BANNER_HEIGHT - MIN_BANNER_HEIGHT;
  const progress = Math.min(Math.max(scrollTop, 0), SCROLL_RANGE) / SCROLL_RANGE;

  const bannerHeight = MAX_BANNER_HEIGHT - (progress * SCROLL_RANGE);
  const avatarTop = interpolate(152, 22); 
  const avatarLeft = interpolate(16, 60); 
  const avatarSize = interpolate(96, 36);
  const avatarBorder = interpolate(4, 2);
  const stickyOpacity = Math.max(0, (progress - 0.7) * 3.33); 

  if (isLoading) {
      return (
          <div className="absolute inset-0 bg-white dark:bg-gray-950 z-30 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  if (!profile) return null;

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-950 z-30 flex flex-col animate-slide-in overflow-hidden">
       <div 
        className="absolute top-0 left-0 right-0 z-10 bg-gray-200 dark:bg-gray-800 bg-cover bg-center"
        style={{
            height: `${bannerHeight}px`,
            backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : 'linear-gradient(to right, #60a5fa, #4f46e5)',
        }}
       >
           <div className="absolute inset-0 bg-black/0 transition-colors" style={{ backgroundColor: `rgba(0,0,0,${progress * 0.5})` }} />
       </div>

       <div className="absolute top-4 left-4 z-50">
          <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
          </button>
       </div>

       <div className="absolute top-4 right-4 z-50">
          <button onClick={() => shareService.shareProfile(profile)} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors">
              <ShareIcon className="w-5 h-5" />
          </button>
       </div>

       <div className="absolute top-0 left-0 right-0 h-[80px] z-40 flex items-center justify-between pl-[104px] pr-4 pt-4 pointer-events-none" style={{ opacity: stickyOpacity }}>
           <span className="font-bold text-lg text-white drop-shadow-md truncate max-w-[140px]">{profile.username}</span>
           {!currentUser || currentUser.id !== targetUserId ? (
               <button onClick={toggleFollow} className={`pointer-events-auto px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md whitespace-nowrap pr-10 ${isFollowing ? 'bg-white/20 text-white border border-white/50 backdrop-blur-md' : 'bg-white text-black'}`}>
                   {isFollowing ? 'Following' : 'Follow'}
               </button>
           ) : null}
       </div>

       <div className="absolute z-50 rounded-full overflow-hidden shadow-xl transition-all bg-gray-200" style={{ top: `${avatarTop}px`, left: `${avatarLeft}px`, width: `${avatarSize}px`, height: `${avatarSize}px`, borderWidth: `${avatarBorder}px`, borderColor: 'white' }}>
           <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
       </div>

       <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto no-scrollbar relative z-0">
           <div style={{ height: '200px' }} className="w-full flex-shrink-0"></div>
           <div className="bg-white dark:bg-gray-950 min-h-[calc(100vh-80px)] relative pb-24 rounded-t-3xl -mt-5 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                <div className="px-6 pt-[84px] pb-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">{profile.username}</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-snug max-w-lg">{profile.bio || "No bio yet."}</p>
                </div>

                <div className="mx-4 mt-4 mb-2 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl flex justify-around border border-gray-100 dark:border-gray-800">
                    <Stat value={recipes.length} label="Recipes" />
                    <div className="w-px bg-gray-200 dark:bg-gray-800 h-8 self-center"></div>
                    <Stat value={profile.followersCount} label="Followers" onClick={() => onShowUserList('followers', targetUserId)} />
                    <div className="w-px bg-gray-200 dark:bg-gray-800 h-8 self-center"></div>
                    <Stat value={profile.followingCount} label="Following" onClick={() => onShowUserList('following', targetUserId)} />
                </div>

                <div className="sticky top-[80px] bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm z-30 flex border-b border-gray-100 dark:border-gray-800">
                    <TabButton label="Recipes" active={activeTab === 'Recipes'} onClick={() => setActiveTab('Recipes')} />
                    <TabButton label="Collections" active={activeTab === 'Collections'} onClick={() => setActiveTab('Collections')} />
                </div>

                <div className="p-4 min-h-[400px]">
                    {activeTab === 'Recipes' ? (
                        recipes.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 pb-4">
                                {recipes.map(recipe => (
                                    <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onSelectRecipe(recipe)} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500 font-medium">No recipes published yet.</div>
                        )
                    ) : (
                        plans.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 pb-4">
                                {plans.map(plan => (
                                    <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${plan.type === 'meal_plan' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {plan.type === 'meal_plan' ? 'Meal Plan' : 'List'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{plan.title}</h3>
                                            </div>
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-400">
                                                <CalendarIcon className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                            {plan.description || `${plan.itemCount} items listed.`}
                                        </p>
                                        <button 
                                            onClick={() => onRestorePlan?.(plan)}
                                            className="w-full py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            View Collection
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500 font-medium">
                                <p className="mb-2">No public collections found.</p>
                                <p className="text-xs text-gray-400">Public Shopping Lists or Meal Plans will appear here.</p>
                            </div>
                        )
                    )}
                </div>
           </div>
       </div>
    </div>
  );
};

export default PublicProfileScreen;
