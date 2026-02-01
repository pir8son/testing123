
import React, { useState, useEffect } from 'react';
import { Ingredient } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface EditPantryItemPopupProps {
  item: Ingredient;
  onClose: () => void;
  onSave: (updatedItem: Ingredient) => void;
}

const EditPantryItemPopup: React.FC<EditPantryItemPopupProps> = ({ item, onClose, onSave }) => {
  const [name, setName] = useState(item.name);
  const [amount, setAmount] = useState(item.amount);

  useEffect(() => {
    setName(item.name);
    setAmount(item.amount);
  }, [item]);

  const handleSave = () => {
    onSave({ ...item, name, amount });
  };

  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-4 animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Item</h2>
          <button onClick={onClose} className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XCircleIcon className="w-7 h-7" />
          </button>
        </header>

        <div className="space-y-4">
            <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1 block">Item Name</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
            </div>
            <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1 block">Amount</label>
                <input 
                    type="text" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
            </div>
        </div>
        
        <div className="flex gap-3 mt-6">
             <button 
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
        </div>

        <style>{`
            @keyframes popup {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-popup { animation: popup 0.2s ease-out; }
        `}</style>
      </div>
    </div>
  );
};

export default EditPantryItemPopup;
