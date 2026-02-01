
import React from 'react';
import { Recipe } from '../types';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';

interface AddToCollectionSheetProps {
  onClose: () => void;
  recipe: Recipe;
  collections: Record<string, { name: string; recipeIds: Set<string> }>;
  onAddToCollection: (collectionId: string, recipeId: string) => void;
}

const AddToCollectionSheet: React.FC<AddToCollectionSheetProps> = ({ 
    onClose, recipe, collections, onAddToCollection
}) => {
  return (
    <div className="absolute inset-0 bg-black/40 z-50" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[60%] bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl flex flex-col p-4 pt-2 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3"></div>

        <header className="flex justify-between items-center pb-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Add to Collection</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{recipe.title}</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto space-y-2">
          {/* FIX: Using Object.keys for better type safety with object iteration. */}
          {Object.keys(collections).map((id) => (
            <button
              key={id}
              onClick={() => onAddToCollection(id, recipe.id)}
              className="w-full p-4 text-left font-semibold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {collections[id].name}
            </button>
          ))}
          {Object.keys(collections).length === 0 && (
            <p className="text-center text-gray-500 py-8">You haven't created any collections yet.</p>
          )}
        </div>
        
        <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
};

export default AddToCollectionSheet;