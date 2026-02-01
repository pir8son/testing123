
import React, { useState } from 'react';
import { Recipe } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { PlusIcon } from './icons/PlusIcon';
import { StarIcon } from './icons/StarIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { PlayIcon } from './icons/PlayIcon';

interface SavedRecipesScreenProps {
  onClose: () => void;
  savedRecipes: Recipe[];
  favoritedRecipeIds: Set<string>;
  onToggleFavorite: (recipeId: string) => void;
  userCollections: Record<string, { name: string; recipeIds: Set<string> }>;
  onOpenAddCollection: () => void;
  onAddToCollection: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onViewInFeed: (recipe: Recipe) => void; // New Prop
}

const RecipeGridCard: React.FC<{
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCollection: () => void;
  onSelectRecipe: () => void;
  onViewInFeed: () => void;
}> = ({ recipe, isFavorite, onToggleFavorite, onAddToCollection, onSelectRecipe, onViewInFeed }) => (
    <div className="w-full group bg-white dark:bg-gray-900 rounded-xl p-2 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="relative overflow-hidden rounded-lg" onClick={onSelectRecipe}>
            <img 
                src={recipe.imageUrl} 
                alt={recipe.title} 
                className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
            />
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
                className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full hover:bg-black/60 transition-colors"
            >
                <StarIcon className="w-4 h-4 text-white" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            
            {/* Hover Play Overlay */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 p-2 rounded-full shadow-lg">
                    <PlayIcon className="w-4 h-4 text-gray-900" />
                </div>
            </div>
        </div>

        <div className="mt-3 px-1">
            <div className="flex justify-between items-start gap-2 mb-3">
                <div onClick={onSelectRecipe} className="cursor-pointer flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-2 leading-snug" title={recipe.title}>
                        {recipe.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        @{recipe.creator?.username || 'unknown'}
                    </p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onAddToCollection(); }} 
                    className="p-1 -mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                    <MoreVerticalIcon className="w-4 h-4"/>
                </button>
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); onViewInFeed(); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
            >
                <PlayIcon className="w-3 h-3" />
                View Original
            </button>
        </div>
    </div>
);


const SavedRecipesScreen: React.FC<SavedRecipesScreenProps> = ({ 
    onClose, savedRecipes, favoritedRecipeIds, onToggleFavorite, 
    userCollections, onOpenAddCollection, onAddToCollection, onSelectRecipe,
    onViewInFeed
}) => {
    const [activeTab, setActiveTab] = useState('all');
    
    // FIX: Using Object.keys for better type safety with object iteration.
    const collectionsForTabs = [
        { id: 'all', name: 'All' },
        { id: 'favorites', name: 'Favorites' },
        ...Object.keys(userCollections).map((id) => ({ id, name: userCollections[id].name }))
    ];

    const getRecipesForTab = () => {
        if (activeTab === 'favorites') {
            return savedRecipes.filter(r => favoritedRecipeIds.has(r.id));
        }
        if (activeTab !== 'all') {
            const collection = userCollections[activeTab];
            return collection ? savedRecipes.filter(r => collection.recipeIds.has(r.id)) : [];
        }
        return savedRecipes; // 'all' tab
    };

    const displayedRecipes = getRecipesForTab();

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-30 flex flex-col animate-slide-in">
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg z-10">
        <button onClick={onClose} className="p-2 -ml-2 mr-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Saved Recipes</h1>
      </header>

      <div className="border-b border-gray-200 dark:border-gray-800 px-4 bg-white dark:bg-gray-950 sticky top-[60px] z-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {collectionsForTabs.map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-3 px-3 text-sm font-semibold transition-all border-b-2 ${
                        activeTab === tab.id
                        ? `border-green-600 text-green-700 dark:text-green-400`
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    {tab.name}
                </button>
            ))}
            <button 
                onClick={onOpenAddCollection} 
                className="ml-auto flex-shrink-0 p-2 my-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Create Collection"
            >
                <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
            </button>
          </div>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto pb-20">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            {displayedRecipes.map(recipe => (
                <RecipeGridCard 
                    key={recipe.id}
                    recipe={recipe}
                    isFavorite={favoritedRecipeIds.has(recipe.id)}
                    onToggleFavorite={() => onToggleFavorite(recipe.id)}
                    onAddToCollection={() => onAddToCollection(recipe)}
                    onSelectRecipe={() => onSelectRecipe(recipe)}
                    onViewInFeed={() => onViewInFeed(recipe)}
                />
            ))}
        </div>
        {displayedRecipes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <StarIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-gray-800 dark:text-gray-200 font-bold text-lg mb-1">No recipes here yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Save recipes from the feed to build your collection.</p>
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

export default SavedRecipesScreen;
