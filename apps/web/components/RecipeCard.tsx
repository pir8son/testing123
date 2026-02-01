
import React, { useState } from 'react';
import { Recipe } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlayIcon } from './icons/PlayIcon';
import { XIcon } from './icons/XIcon';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipeId: string) => void;
  onViewVideo?: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, onEdit, onDelete, onViewVideo }) => {
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowActionSheet(true);
  };

  const handleEdit = () => {
      setShowActionSheet(false);
      if (onEdit) onEdit(recipe);
  };

  const handleViewVideo = () => {
      setShowActionSheet(false);
      if (onViewVideo) onViewVideo(recipe);
  };

  const handleDelete = () => {
      setShowActionSheet(false);
      if (onDelete) {
          // Double Confirmation
          if (window.confirm(`Delete "${recipe.title}"?\nThis action cannot be undone.`)) {
              onDelete(recipe.id);
          }
      }
  };

  return (
    <div className="w-full cursor-pointer group relative">
        {/* Main Card Container */}
        <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800" onClick={onClick}>
            <img 
                src={recipe.imageUrl} 
                alt={recipe.title} 
                className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" 
            />
            
            {/* Visual indicator for video content */}
            {recipe.videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                    <div className="bg-white/90 p-2 rounded-full shadow-lg">
                        <PlayIcon className="w-4 h-4 text-gray-900" />
                    </div>
                </div>
            )}

            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                <ClockIcon className="w-3 h-3" />
                <span>{recipe.cookTime}</span>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-1.5">
                <div className="bg-violet-600/80 text-white p-1.5 rounded-full backdrop-blur-sm shadow-md">
                    <SparklesIcon className="w-3.5 h-3.5"/>
                </div>
                
                {/* 3-Dots Trigger */}
                {(onEdit || onDelete || onViewVideo) && (
                    <button 
                        onClick={handleMenuClick} 
                        className="bg-black/40 text-white p-1.5 rounded-full hover:bg-black/60 backdrop-blur-sm shadow-md transition-colors border border-white/10"
                    >
                        <MoreVerticalIcon className="w-4 h-4"/>
                    </button>
                )}
            </div>
        </div>
        
        {/* Info Block */}
        <div onClick={onClick} className="mt-2 px-1">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate leading-tight">{recipe.title}</h3>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{recipe.ingredients.length} ingredients • {recipe.difficulty}</p>
        </div>

        {/* FIXED ACTION SHEET (Standard Mobile Pattern) */}
        {/* This is positioned 'fixed' so it is never clipped by the card's overflow:hidden */}
        {showActionSheet && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={() => setShowActionSheet(false)}>
                <div 
                    className="w-full max-w-[400px] bg-white dark:bg-gray-900 rounded-t-3xl p-4 pb-8 shadow-2xl animate-slide-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6"></div>
                    
                    <h2 className="text-center font-bold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest mb-4">Manage Recipe</h2>
                    
                    <div className="space-y-3">
                        {onViewVideo && (
                            <button 
                                onClick={handleViewVideo}
                                className="w-full py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-800 dark:text-white active:scale-95 transition-transform"
                            >
                                <PlayIcon className="w-5 h-5 text-green-600" />
                                View in Feed
                            </button>
                        )}
                        
                        {onEdit && (
                            <button 
                                onClick={handleEdit}
                                className="w-full py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-800 dark:text-white active:scale-95 transition-transform"
                            >
                                <EditIcon className="w-5 h-5 text-blue-500" />
                                Edit Recipe
                            </button>
                        )}

                        {onDelete && (
                            <button 
                                onClick={handleDelete}
                                className="w-full py-4 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center gap-3 font-bold text-red-600 active:scale-95 transition-transform"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Delete Post
                            </button>
                        )}

                        <button 
                            onClick={() => setShowActionSheet(false)}
                            className="w-full py-4 mt-2 font-bold text-gray-500 dark:text-gray-400 active:scale-95 transition-transform"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0, 0, 0.2, 1); }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
        `}</style>
    </div>
  );
};

export default RecipeCard;
