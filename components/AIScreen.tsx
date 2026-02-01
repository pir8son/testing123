
import React from 'react';
import { CalendarIcon } from './icons/CalendarIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { PackageIcon } from './icons/PackageIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Ingredient, Recipe } from '../types';
import { mockFeed } from '../data/mockFeed';

const ToolCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'purple' | 'green' | 'amber' | 'blue';
  onClick?: () => void;
}> = ({ title, subtitle, icon, color, onClick }) => {
  // Updated to use solid colors for all cards
  const colorClasses = {
    purple: 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-none',
    green: 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none',
    amber: 'bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none',
    blue: 'bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-none',
  };

  const iconBgClasses = {
    purple: 'bg-white/20 backdrop-blur-sm',
    green: 'bg-white/20 backdrop-blur-sm',
    amber: 'bg-white/20 backdrop-blur-sm',
    blue: 'bg-white/20 backdrop-blur-sm',
  }

  const iconColor = {
    purple: 'text-white',
    green: 'text-white',
    amber: 'text-white',
    blue: 'text-white'
  }

  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-2xl flex flex-col justify-between h-40 text-left ${colorClasses[color]} transition-transform hover:scale-105 active:scale-95`}
    >
      <div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClasses[color]}`}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6 ${iconColor[color]}` })}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-lg leading-tight">{title}</h3>
        <p className="text-sm opacity-90 font-medium">{subtitle}</p>
      </div>
    </button>
  );
};

const RecipePreviewCard: React.FC<{recipe: Recipe, tagText?: string, tagColor?: string}> = ({ recipe, tagText, tagColor }) => (
    <div className="w-40 flex-shrink-0">
        <div className="relative">
            <img src={recipe.imageUrl} className="w-full h-24 object-cover rounded-xl"/>
            {tagText && (
                <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full ${tagColor || 'bg-black/60'}`}>
                    {tagText}
                </div>
            )}
        </div>
        <p className="font-bold text-sm mt-1 truncate text-gray-800 dark:text-gray-100">{recipe.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{recipe.cookTime}</p>
    </div>
);

interface AIScreenProps {
    onAskAi: () => void;
    pantryItems: Ingredient[];
    allRecipes: Recipe[];
    onCookWhatYouHave: () => void;
    onPlanMeal: () => void;
    onSmartSuggestions: () => void;
    onSmartSwaps: () => void;
}

const AIScreen: React.FC<AIScreenProps> = ({ onAskAi, pantryItems, allRecipes, onCookWhatYouHave, onPlanMeal, onSmartSuggestions, onSmartSwaps }) => {
  const pantryItemNames = new Set(pantryItems.map(i => i.name.toLowerCase()));
  const recipesYouCanMake = allRecipes.filter(recipe => 
      recipe.ingredients.every(ingredient => pantryItemNames.has(ingredient.name.toLowerCase()))
  ).slice(0, 5); // Limit to 5 for the scroll view

  return (
    <div className="p-4 space-y-6 bg-gray-50 dark:bg-gray-950 h-full overflow-y-auto pb-24 no-scrollbar">
      <div className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Assistant</h1>
          <p className="text-gray-500 dark:text-gray-400">Your AI-powered kitchen helper</p>
        </div>
        <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <SparklesIcon className="w-5 h-5 text-violet-500" />
        </div>
        <button 
          onClick={onAskAi}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-left py-3 pl-12 pr-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          Ask anything... recipes, meal plans
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">AI-Powered Tools</h2>
        <div className="grid grid-cols-2 gap-4">
          <ToolCard 
            title="AI Meal Planner" 
            subtitle="Generate weekly plans" 
            icon={<CalendarIcon />} 
            color="purple" 
            onClick={onPlanMeal}
          />
          <ToolCard 
            title="Smart Suggestions" 
            subtitle="Personalized picks" 
            icon={<LightbulbIcon />} 
            color="green"
            onClick={onSmartSuggestions}
          />
          <ToolCard 
            title="Cook What You Have" 
            subtitle="Use your pantry" 
            icon={<PackageIcon />} 
            color="amber" 
            onClick={onCookWhatYouHave}
          />
          <ToolCard 
            title="Smart Swaps" 
            subtitle="AI substitutions" 
            icon={<RefreshCwIcon />} 
            color="blue" 
            onClick={onSmartSwaps}
          />
        </div>
      </div>

      {recipesYouCanMake.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Recipes You Can Make Now</h2>
             <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                {recipesYouCanMake.map(recipe => (
                    <RecipePreviewCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        tagText={`${recipe.ingredients.length} items`}
                        tagColor="bg-green-600/80"
                    />
                ))}
            </div>
          </div>
        )}
      
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">For You</h2>
                <a href="#" className="text-sm font-semibold text-green-600">See all</a>
            </div>
             <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                <RecipePreviewCard recipe={mockFeed[2]} tagText="Quick & Easy" tagColor="bg-violet-600/80" />
                <RecipePreviewCard recipe={mockFeed[1]} tagText="Uses your pantry" tagColor="bg-amber-600/80" />
                <RecipePreviewCard recipe={mockFeed[0]} tagText="Popular" tagColor="bg-pink-600/80" />
            </div>
        </div>
    </div>
  );
};

export default AIScreen;
