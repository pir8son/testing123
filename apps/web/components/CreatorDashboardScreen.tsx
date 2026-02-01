
import React, { useState, useEffect, useRef } from 'react';
import { Recipe, UserProfile, SavedList } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import RecipeCard from './RecipeCard';
import { UploadIcon } from './icons/UploadIcon';
import { ShareIcon } from './icons/ShareIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { PlusIcon } from './icons/PlusIcon';
import { recipeService } from '../services/recipeService';
import { backend } from '../services/backend';
import { shoppingListService } from '../services/shoppingListService';
import { CalendarIcon } from './icons/CalendarIcon';

interface CreatorDashboardScreenProps {
  userId: string;
  userProfile: UserProfile; 
  onClose: () => void;
  onUpload: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onEditRecipe: (recipe: Recipe) => void; // Explicit edit action
  onViewVideo: (recipe: Recipe) => void; // Explicit video action
  onOpenSettings: () => void;
  onShowUserList: (type: 'followers' | 'following', userId: string) => void;
  onViewPlan?: (plan: SavedList) => void; // ADDED: Handle clicking a collection
  dataVersion?: number; 
}

const Stat: React.FC<{ value: string | number; label: string; onClick?: () => void }> = ({ value, label, onClick }) => (
    <button onClick={onClick} className="text-center min-w-[80px] active:opacity-70 transition-opacity">
        <p className="font-bold text-xl text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
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

const CreatorDashboardScreen: React.FC<CreatorDashboardScreenProps> = ({ 
    userId, 
    userProfile, 
    onClose, 
    onUpload, 
    onSelectRecipe,
    onEditRecipe,
    onViewVideo,
    onOpenSettings,
    onShowUserList,
    onViewPlan,
    dataVersion = 0
}) => {
  const [activeTab, setActiveTab] = useState<'Recipes' | 'Drafts' | 'Collections'>('Recipes');
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [myDrafts, setMyDrafts] = useState<Recipe[]>([]);
  const [myCollections, setMyCollections] = useState<SavedList[]>([]);
  const [loading, setLoading] = useState(false); 
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const fetchUserContent = async () => {
          if (!userId) return;
          setLoading(true);
          try {
              if (activeTab === 'Recipes') {
                  const recipes = await recipeService.getUserRecipes(userId);
                  setMyRecipes(recipes);
              } else if (activeTab === 'Drafts') {
                  const drafts = await backend.getDrafts(userId);
                  setMyDrafts(drafts);
              } else if (activeTab === 'Collections') {
                  const collections = await shoppingListService.getPublicLists(userId);
                  setMyCollections(collections);
              }
          } catch (error) {
              console.error("Failed to load user content:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchUserContent();
  }, [userId, dataVersion, activeTab]); 

  const handleDeleteRecipe = async (recipeId: string) => {
      setMyRecipes(prev => prev.filter(r => r.id !== recipeId));
      try {
          await recipeService.deleteRecipe(recipeId, userId);
      } catch (error) {
          console.error("Delete failed, reverting UI:", error);
          alert("Failed to delete recipe.");
      }
  };

  if (!userProfile) {
      return (
          <div className="absolute inset-0 bg-white dark:bg-gray-950 z-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading Dashboard...</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded text-sm">Cancel</button>
          </div>
      );
  }

  const { username, bio, avatarUrl, bannerUrl, followersCount, followingCount } = userProfile;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
  };

  const MAX_BANNER_HEIGHT = 200;
  const MIN_BANNER_HEIGHT = 80;
  const AVATAR_SIZE_LARGE = 96; 
  const AVATAR_SIZE_SMALL = 40; 
  
  const scrollRange = MAX_BANNER_HEIGHT - MIN_BANNER_HEIGHT;
  const clampedScroll = Math.min(Math.max(scrollTop, 0), scrollRange);
  const progress = clampedScroll / scrollRange; 

  const bannerHeight = MAX_BANNER_HEIGHT - clampedScroll;
  const avatarTop = 152 - (progress * (152 - 20)); 
  const avatarLeft = 16 + (progress * 40); 
  const avatarSize = AVATAR_SIZE_LARGE - (progress * (AVATAR_SIZE_LARGE - AVATAR_SIZE_SMALL));
  const avatarBorder = 4 - (progress * 2); 
  const headerTextOpacity = Math.max(0, (progress - 0.8) * 5); 
  const profileInfoOpacity = Math.max(0, 1 - (progress * 1.5)); 

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-20 flex flex-col animate-slide-in overflow-hidden">
       
       <div 
        className="absolute top-0 left-0 right-0 z-10 transition-all duration-75 ease-linear bg-gray-200 dark:bg-gray-800 bg-cover bg-center"
        style={{
            height: `${bannerHeight}px`,
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'linear-gradient(to right, #4ade80, #3b82f6)',
        }}
       >
           <div 
            className="absolute inset-0 bg-black/0 transition-colors" 
            style={{ backgroundColor: `rgba(0,0,0,${progress * 0.3})` }} 
           />
       </div>

       <div className="absolute top-4 left-4 z-50">
          <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
          </button>
       </div>

       <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button onClick={onUpload} className="p-2 bg-green-600/90 backdrop-blur-md rounded-full text-white hover:bg-green-700 transition-colors shadow-lg">
              <PlusIcon className="w-5 h-5" />
          </button>
          
          <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors">
              <ShareIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={onOpenSettings}
            className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors"
          >
              <SettingsIcon className="w-5 h-5" />
          </button>
       </div>

       <div 
        className="absolute top-0 left-0 right-0 h-[80px] z-40 flex items-center justify-center pointer-events-none"
        style={{ opacity: headerTextOpacity }}
       >
           <span className="font-bold text-lg text-white drop-shadow-md pt-4">{username}</span>
       </div>

       <div 
        className="absolute z-40 rounded-full overflow-hidden shadow-lg transition-all duration-75 ease-linear"
        style={{
            top: `${avatarTop}px`,
            left: `${avatarLeft}px`,
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            borderWidth: `${avatarBorder}px`,
            borderColor: 'white' 
        }}
       >
           <img 
            src={avatarUrl} 
            alt={username} 
            className="w-full h-full object-cover bg-gray-200" 
           />
       </div>

       <div 
         ref={scrollRef}
         onScroll={handleScroll}
         className="h-full overflow-y-auto no-scrollbar relative z-0"
       >
           <div style={{ height: '200px' }} className="w-full flex-shrink-0"></div>

           <div className="bg-white dark:bg-gray-950 min-h-[calc(100vh-80px)] relative pb-24">
                
                <div 
                    className="px-4 pt-14 pb-2 relative"
                    style={{ opacity: profileInfoOpacity }}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {username}
                            </h1>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {bio || "Tap settings to add a bio."}
                    </p>
                </div>

                <div className="flex justify-around py-4 border-b border-gray-100 dark:border-gray-800 mx-4">
                    <Stat value={myRecipes.length} label="Recipes" />
                    <Stat value={followersCount || 0} label="Followers" onClick={() => onShowUserList('followers', userId)} />
                    <Stat value={followingCount || 0} label="Following" onClick={() => onShowUserList('following', userId)} />
                </div>

                <div className="sticky top-[80px] z-30 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex shadow-sm">
                    <TabButton label="Recipes" active={activeTab === 'Recipes'} onClick={() => setActiveTab('Recipes')} />
                    <TabButton label="Drafts" active={activeTab === 'Drafts'} onClick={() => setActiveTab('Drafts')} />
                    <TabButton label="Collections" active={activeTab === 'Collections'} onClick={() => setActiveTab('Collections')} />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-[400px]">
                    {activeTab === 'Recipes' && (
                        <>
                            {loading && myRecipes.length === 0 ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : myRecipes.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4 pb-4">
                                    {myRecipes.map(recipe => (
                                        <RecipeCard 
                                            key={recipe.id} 
                                            recipe={recipe} 
                                            onClick={() => onSelectRecipe(recipe)} // TAP -> View Details
                                            onEdit={onEditRecipe} // MENU -> Edit
                                            onViewVideo={onViewVideo} // MENU -> View Video
                                            onDelete={handleDeleteRecipe} // MENU -> Delete
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 px-4">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't posted any recipes yet.</p>
                                    <button onClick={onUpload} className="text-green-600 font-bold">Create your first recipe</button>
                                </div>
                            )}
                        </>
                    )}
                    
                    {activeTab === 'Drafts' && (
                        <div className="space-y-3 pb-4">
                            {myDrafts.length > 0 ? myDrafts.map(draft => (
                                <div key={draft.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                                        {draft.imageUrl ? <img src={draft.imageUrl} className="w-full h-full object-cover" alt="" /> : null}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{draft.title || 'Untitled Draft'}</h3>
                                        <p className="text-xs text-gray-500">Last edited: {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => alert("Draft editing coming soon!")} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold">Edit</button>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-gray-500">No drafts currently.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Collections' && (
                        <>
                            {loading && myCollections.length === 0 ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : myCollections.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 pb-4">
                                    {myCollections.map(plan => (
                                        <div 
                                            key={plan.id} 
                                            // FIX: Added onClick to view plan
                                            onClick={() => onViewPlan && onViewPlan(plan)}
                                            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm group cursor-pointer hover:border-green-500 dark:hover:border-green-600 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${plan.type === 'meal_plan' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {plan.type === 'meal_plan' ? 'Meal Plan' : 'List'}
                                                        </span>
                                                        {plan.isPublic && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Public</span>}
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
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 px-4">
                                    <p className="text-gray-500 dark:text-gray-400 mb-2">You haven't created any public collections yet.</p>
                                    <p className="text-xs text-gray-400">Mark a Saved Plan as 'Public' to see it here.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
           </div>
       </div>
      
      <div className="absolute bottom-8 right-6 z-50">
          <button 
            onClick={onUpload}
            className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg shadow-green-600/40 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <UploadIcon className="w-7 h-7" />
          </button>
      </div>

      <style>{`
          @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default CreatorDashboardScreen;
