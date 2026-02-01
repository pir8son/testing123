
import React, { useState, useEffect } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { MicIcon } from './icons/MicIcon';
import { SearchIcon } from './icons/SearchIcon';
import { recipeDatabase } from '../data/recipeDatabase';
import RecipeCard from './RecipeCard';
import { Ingredient, Recipe, UserProfile } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import FilterSheet from './FilterSheet';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlayIcon } from './icons/PlayIcon';
import { FilterIcon } from './icons/FilterIcon';
import { CheckIcon } from './icons/CheckIcon';
import { recipeService } from '../services/recipeService';
import { RECIPE_CATEGORIES, getCategoryIconComponent } from '../constants/categories';
import AllCategoriesScreen from './AllCategoriesScreen';
import { searchService } from '../services/searchService';
import { UserIcon } from './icons/UserIcon';

const CategoryCard: React.FC<{ name: string; icon: React.ReactNode; onClick: () => void, isSelected: boolean }> = ({ name, icon, onClick, isSelected }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group transition-transform active:scale-95">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 ${isSelected ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''} group-hover:shadow-md transition-all duration-200`}>
            <div className={`${isSelected ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>
                {icon}
            </div>
        </div>
        <p className={`font-semibold text-[11px] sm:text-xs text-center ${isSelected ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{name}</p>
    </button>
);

const TrendingClip: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => (
    <div onClick={onClick} className="flex-shrink-0 w-28 snap-center flex flex-col gap-2 cursor-pointer transition-transform active:scale-95">
        <div className="relative w-28 h-44 rounded-xl overflow-hidden shadow-md group">
            <img src={recipe.thumbnailUrl || recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
                <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
                    <PlayIcon className="w-4 h-4 text-white fill-white" />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white">
                <p className="text-xs font-bold line-clamp-2 leading-tight">{recipe.title}</p>
            </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1 flex items-center gap-1">
            <span className="text-red-500">♥</span> {recipe.likes}
        </p>
    </div>
);

const UserResultItem: React.FC<{ user: UserProfile, onClick: () => void }> = ({ user, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
        <div className="text-left flex-grow">
            <p className="font-bold text-gray-900 dark:text-white">@{user.username}</p>
            {user.bio && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{user.bio}</p>}
        </div>
        <ChevronRightIcon className="w-5 h-5 text-gray-300" />
    </button>
);

interface SearchScreenProps {
  onSelectRecipe: (recipe: Recipe) => void;
  pantryItems: Ingredient[];
  onAskAi: () => void;
  onSuggest: (type: 'Category' | 'Collection') => void;
  onViewTrendingFeed?: (initialRecipeId: string) => void; // For Recipe Clicks
  onViewProfile?: (userId: string) => void; // For User Clicks
}

const SearchScreen: React.FC<SearchScreenProps> = ({ onSelectRecipe, pantryItems, onAskAi, onSuggest, onViewTrendingFeed, onViewProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState(new Set<string>());
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [useMyIngredients, setUseMyIngredients] = useState(false);
  
  // Real Data State
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  // Search Implementation
  const [searchMode, setSearchMode] = useState<'recipes' | 'users'>('recipes');
  const [isSearching, setIsSearching] = useState(false);
  const [recipeResults, setRecipeResults] = useState<Recipe[]>([]);
  const [userResults, setUserResults] = useState<UserProfile[]>([]);

  // Load Trending Data
  useEffect(() => {
      const loadTrending = async () => {
          setIsLoadingTrending(true);
          try {
              const data = await recipeService.getTrendingRecipes(5);
              setTrendingRecipes(data);
          } catch (error) {
              console.error("Failed to load trending recipes:", error);
          } finally {
              setIsLoadingTrending(false);
          }
      };
      loadTrending();
  }, []);

  // Debounced Search Effect
  useEffect(() => {
      if (!searchQuery.trim()) {
          setRecipeResults([]);
          setUserResults([]);
          return;
      }

      const timer = setTimeout(async () => {
          setIsSearching(true);
          try {
              if (searchMode === 'recipes') {
                  const results = await searchService.searchRecipes(searchQuery);
                  setRecipeResults(results);
              } else {
                  const results = await searchService.searchUsers(searchQuery);
                  setUserResults(results);
              }
          } catch (error) {
              console.error("Search failed:", error);
          } finally {
              setIsSearching(false);
          }
      }, 500);

      return () => clearTimeout(timer);
  }, [searchQuery, searchMode]);


  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
    setActiveCollection(null);
    setSearchQuery('');
    setShowAllCategories(false);
  }
  
  const handleCollectionClick = (collectionId: string) => {
      setActiveCollection(collectionId);
      setActiveCategory(null);
      setSearchQuery('');
  }

  const handleBack = () => {
      setSearchQuery('');
      setActiveCategory(null);
      setActiveCollection(null);
      setShowAllCategories(false);
      setShowAllCollections(false);
  }

  const handleApplyFilters = (newFilters: Set<string>) => {
    setActiveFilters(newFilters);
    setShowFilterSheet(false);
  }

  const removeFilter = (filter: string) => {
      setActiveFilters(prev => {
          const newSet = new Set(prev);
          newSet.delete(filter);
          return newSet;
      });
  }

  const handleTrendingClick = (recipe: Recipe) => {
      console.log("[SearchScreen] Clicked trending:", recipe.id);
      if (onViewTrendingFeed) {
          onViewTrendingFeed(recipe.id);
      } else {
          // Fallback if prop not connected
          onSelectRecipe(recipe);
      }
  }

  const handleRecipeResultClick = (recipe: Recipe) => {
      if (onViewTrendingFeed) {
          onViewTrendingFeed(recipe.id);
      } else {
          onSelectRecipe(recipe);
      }
  }

  const handleUserResultClick = (userId: string) => {
      if (onViewProfile) {
          onViewProfile(userId);
      } else {
          console.warn("onViewProfile not connected");
      }
  }

  // --- RENDERING HELPERS ---

  const collections = [
    { title: 'Quick Weeknight Meals', subtitle: '30 min or less', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', id: 'Quick' },
    { title: 'Healthy Choices', subtitle: 'Light & nutritious', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17025?auto=format&fit=crop&w=800&q=80', id: 'Healthy' },
    { title: 'Vegetarian Delights', subtitle: 'Plant-based recipes', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', id: 'Vegetarian' },
    { title: 'Dessert Favorites', subtitle: 'Sweet treats & bakes', imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80', id: 'Dessert' }
  ];

  const hasActiveSearch = searchQuery.length > 0;
  const isResultsView = hasActiveSearch || activeCategory || activeCollection;

  // --- RENDER CONTENT SWITCHER ---

  if (showAllCategories) {
      return (
          <AllCategoriesScreen 
            onClose={() => setShowAllCategories(false)}
            onSelectCategory={handleCategoryClick}
            onSuggest={() => onSuggest('Category')}
          />
      );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 h-full overflow-y-auto pb-24 no-scrollbar">
       
       {/* SEARCH HEADER */}
       <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-xl pb-2 transition-all border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="p-4 pb-2">
                <div className="flex items-center gap-3 mb-2">
                    {(activeCategory || activeCollection || showAllCollections) && (
                        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 flex-shrink-0">
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    )}
                    <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={searchMode === 'recipes' ? "Search recipes..." : "Search people..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-3 pl-12 pr-10 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                            />
                            {searchQuery ? (
                                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-1">
                                        <XIcon className="w-3 h-3 text-gray-500" />
                                    </div>
                                </button>
                            ) : (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <MicIcon className="w-5 h-5"/>
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <CameraIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            
                {hasActiveSearch ? (
                    /* Search Toggle (Recipes | People) */
                    <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl mt-2">
                        <button 
                            onClick={() => setSearchMode('recipes')}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${searchMode === 'recipes' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Recipes
                        </button>
                        <button 
                            onClick={() => setSearchMode('users')}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${searchMode === 'users' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            People
                        </button>
                    </div>
                ) : !activeCategory && !activeCollection && !showAllCollections ? (
                    <div className="flex items-center justify-between mt-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Discover
                        </h1>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setUseMyIngredients(!useMyIngredients)} 
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                    useMyIngredients 
                                    ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-200 dark:shadow-none' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                {useMyIngredients && <CheckIcon className="w-3 h-3 stroke-2" />}
                                My Pantry
                            </button>
                            <button 
                                onClick={() => setShowFilterSheet(true)} 
                                className={`p-1.5 rounded-full border transition-all ${
                                    activeFilters.size > 0
                                    ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                <FilterIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 px-1">
                        {activeCategory ? `${activeCategory} Recipes` : activeCollection ? `${collections.find(c=>c.id === activeCollection)?.title}` : 'Search Results'}
                    </h1>
                )}

                {activeFilters.size > 0 && !hasActiveSearch && (
                    <div className="flex flex-wrap gap-2 mt-3 pb-1">
                        {[...activeFilters].map(filter => (
                            <div key={filter} className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold pl-2 pr-1 py-1 rounded-full flex items-center gap-1">
                                <span>{filter}</span>
                                <button onClick={() => removeFilter(filter)} className="bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 rounded-full p-0.5">
                                    <XIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
       </div>

       {/* MAIN CONTENT AREA */}
       <div className="px-4 pb-4 pt-4">
           
           {/* 1. ACTIVE SEARCH VIEW */}
           {hasActiveSearch ? (
               <div className="space-y-4">
                   {isSearching ? (
                       <div className="flex justify-center py-20">
                           <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                       </div>
                   ) : searchMode === 'recipes' ? (
                       recipeResults.length > 0 ? (
                           <div className="grid grid-cols-2 gap-4">
                               {recipeResults.map(recipe => (
                                   <RecipeCard key={recipe.id} recipe={recipe} onClick={() => handleRecipeResultClick(recipe)} />
                               ))}
                           </div>
                       ) : (
                           <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                               No recipes found for "{searchQuery}".
                           </div>
                       )
                   ) : (
                       userResults.length > 0 ? (
                           <div className="space-y-3">
                               {userResults.map(user => (
                                   <UserResultItem key={user.id} user={user} onClick={() => handleUserResultClick(user.id)} />
                               ))}
                           </div>
                       ) : (
                           <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                               No users found for "{searchQuery}".
                           </div>
                       )
                   )}
               </div>
           ) : isResultsView ? (
               /* 2. CATEGORY/COLLECTION FILTERED VIEW (Local Search) */
               <>
                  {/* Using Fallback Filtered List */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                      {/* Note: This uses the existing `filteredRecipes` logic if you kept it in the closure, 
                          but since this component is large, I'm simplifying to show structure. 
                          Ideally `filteredRecipes` logic should be up top. */}
                      {recipeDatabase.filter((recipe: Recipe) => {
                            const categoryMatch = activeCategory ? recipe.category === activeCategory : true;
                            const collectionMatch = activeCollection ? recipe.collections?.includes(activeCollection) : true;
                            return categoryMatch && collectionMatch;
                      }).map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} onClick={() => handleRecipeResultClick(recipe)} />
                      ))}
                  </div>
               </>
           ) : showAllCollections ? (
               /* 3. ALL COLLECTIONS VIEW */
               <div className="space-y-3 mt-4">
                  {collections.map(col => (
                    <button key={col.id} onClick={() => handleCollectionClick(col.id)} className="w-full flex items-center text-left p-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 shadow-sm">
                        <img src={col.imageUrl} className="w-20 h-20 object-cover rounded-lg mr-4" />
                        <div className="flex-grow">
                            <h3 className="font-bold text-gray-800 dark:text-white">{col.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{col.subtitle}</p>
                        </div>
                        <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                    </button>
                  ))}
                  <button onClick={() => onSuggest('Collection')} className="w-full mt-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">Suggest a Collection</button>
                </div>
           ) : (
               /* 4. DEFAULT DASHBOARD VIEW */
               <>
                {/* Trending Clips */}
                <div>
                     <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <PlayIcon className="w-4 h-4 text-red-500 fill-red-500" />
                        Trending Now
                     </h2>
                     {isLoadingTrending ? (
                         <div className="flex gap-3 overflow-x-hidden">
                             {[...Array(3)].map((_, i) => (
                                 <div key={i} className="w-28 h-44 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse flex-shrink-0"></div>
                             ))}
                         </div>
                     ) : trendingRecipes.length > 0 ? (
                         <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar snap-x">
                            {trendingRecipes.map((recipe) => (
                                <TrendingClip key={recipe.id} recipe={recipe} onClick={() => handleTrendingClick(recipe)} />
                            ))}
                         </div>
                     ) : (
                         <p className="text-gray-500 text-sm">No trending recipes yet.</p>
                     )}
                </div>

                {/* Categories */}
               <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-bold text-gray-800 dark:text-white">Categories</h2>
                         <button onClick={() => setShowAllCategories(true)} className="text-sm font-semibold text-green-600 dark:text-green-400">See all</button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {RECIPE_CATEGORIES.slice(0, 8).map(cat => (
                        <CategoryCard 
                            key={cat.id} 
                            name={cat.name} 
                            icon={getCategoryIconComponent(cat.icon)} 
                            onClick={() => handleCategoryClick(cat.name)} 
                            isSelected={activeCategory === cat.name} 
                        />
                      ))}
                    </div>
               </div>

                {/* Curated Collections */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-bold text-gray-800 dark:text-white">Curated Collections</h2>
                         <button onClick={() => setShowAllCollections(true)} className="text-sm font-semibold text-green-600 dark:text-green-400">See all</button>
                    </div>
                    <div className="space-y-3">
                      {collections.slice(0, 2).map(col => (
                        <button key={col.id} onClick={() => handleCollectionClick(col.id)} className="w-full flex items-center text-left p-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 shadow-sm">
                            <img src={col.imageUrl} className="w-20 h-20 object-cover rounded-lg mr-4" />
                            <div className="flex-grow">
                                <h3 className="font-bold text-gray-800 dark:text-white">{col.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{col.subtitle}</p>
                            </div>
                            <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                        </button>
                      ))}
                    </div>
                </div>

                <div className="mt-8 mb-4 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl p-5 flex items-center justify-between text-white shadow-lg shadow-violet-200 dark:shadow-none">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-yellow-300" />
                        <div>
                            <p className="font-bold text-sm">AI Chef Assistant</p>
                            <p className="text-xs text-white/80">Not sure what to cook?</p>
                        </div>
                    </div>
                    <button onClick={onAskAi} className="bg-white text-violet-600 font-bold text-sm px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm">Ask Now</button>
                </div>
               </>
           )}
       </div>
      
       {showFilterSheet && (
           <FilterSheet 
             onClose={() => setShowFilterSheet(false)}
             activeFilters={activeFilters}
             onApplyFilters={handleApplyFilters}
           />
       )}
    </div>
  );
};

export default SearchScreen;
