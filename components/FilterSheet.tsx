import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';

interface FilterSheetProps {
  onClose: () => void;
  activeFilters: Set<string>;
  onApplyFilters: (newFilters: Set<string>) => void;
}

const availableFilters = [
  'High Protein',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Quick',
  'Healthy',
];

const FilterSheet: React.FC<FilterSheetProps> = ({ onClose, activeFilters, onApplyFilters }) => {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(activeFilters);

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filter)) {
        newSet.delete(filter);
      } else {
        newSet.add(filter);
      }
      return newSet;
    });
  };
  
  const handleApply = () => {
      onApplyFilters(selectedFilters);
  }

  const handleClear = () => {
      setSelectedFilters(new Set());
  }

  return (
    <div className="absolute inset-0 bg-black/40 z-30" onClick={onClose}>
      <div 
        className="absolute bottom-0 left-0 right-0 max-h-[60%] bg-white rounded-t-2xl shadow-xl flex flex-col p-4 pt-2 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
        
        <header className="flex justify-between items-center pb-2 mb-4">
            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100">
                <XIcon className="w-5 h-5 text-gray-600" />
            </button>
        </header>

        <div className="flex-grow overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableFilters.map(filter => (
              <button 
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`py-2.5 px-3 text-sm font-semibold rounded-lg border-2 transition-colors ${
                  selectedFilters.has(filter) 
                  ? 'bg-green-100 border-green-500 text-green-800' 
                  : 'bg-gray-100 border-gray-200 text-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <footer className="pt-4 border-t mt-auto flex gap-3">
          <button 
            onClick={handleClear}
            className="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300"
          >
            Clear All
          </button>
          <button 
            onClick={handleApply}
            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700"
          >
            Apply Filters
          </button>
        </footer>
         <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .animate-slide-up {
                animation: slide-up 0.3s ease-out;
            }
        `}</style>
      </div>
    </div>
  );
};

export default FilterSheet;