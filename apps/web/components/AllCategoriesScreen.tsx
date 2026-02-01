
import React from 'react';
import { RECIPE_CATEGORIES, getCategoryIconComponent } from '../constants/categories';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface AllCategoriesScreenProps {
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  onSuggest: () => void;
}

const AllCategoriesScreen: React.FC<AllCategoriesScreenProps> = ({ onClose, onSelectCategory, onSuggest }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 animate-slide-in">
      <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-xl p-4 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center gap-3">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Categories</h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 pb-24 no-scrollbar">
        <div className="grid grid-cols-4 gap-4">
          {RECIPE_CATEGORIES.map((cat) => (
            <button 
                key={cat.id} 
                onClick={() => onSelectCategory(cat.name)}
                className="flex flex-col items-center gap-2 group"
            >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 group-hover:shadow-md transition-all duration-200 group-active:scale-95">
                    <div className="text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {getCategoryIconComponent(cat.icon)}
                    </div>
                </div>
                <p className="font-semibold text-[11px] sm:text-xs text-center text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400 leading-tight">
                    {cat.name}
                </p>
            </button>
          ))}
        </div>

        <button 
            onClick={onSuggest}
            className="w-full mt-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
        >
            Suggest a Category
        </button>
      </div>
      
      <style>{`
          @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AllCategoriesScreen;
