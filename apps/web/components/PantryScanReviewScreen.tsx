
import React, { useState } from 'react';
import { Ingredient } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import EditPantryItemPopup from './EditPantryItemPopup';

interface PantryScanReviewScreenProps {
  onClose: () => void;
  scanResult: { items: Ingredient[]; source: 'Receipt' | 'Fridge' };
  onConfirm: (itemsToAdd: Ingredient[]) => void;
}

const PantryScanReviewScreen: React.FC<PantryScanReviewScreenProps> = ({ onClose, scanResult, onConfirm }) => {
    const [items, setItems] = useState<Ingredient[]>(scanResult.items);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateItem = (indexToUpdate: number, updatedItem: Ingredient) => {
        const newItems = items.map((item, index) => 
            index === indexToUpdate ? updatedItem : item
        );
        setItems(newItems);
        setEditingIndex(null);
    };
    
    const handleConfirm = () => {
        onConfirm(items);
    }

    return (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-50 flex flex-col animate-slide-in">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
                <button onClick={onClose} className="p-2 -ml-2 mr-2">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Review Items</h1>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">AI found the following items from your {scanResult.source.toLowerCase()}. Review, edit, or remove any incorrect items before adding to your pantry.</p>
                {items.length > 0 ? (
                    <ul className="space-y-2">
                        {items.map((item, index) => (
                            <button 
                                key={index} 
                                onClick={() => setEditingIndex(index)}
                                className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.amount}</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveItem(index); }} 
                                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </button>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">No items to review.</p>
                )}
            </div>

            <footer className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button onClick={handleConfirm} disabled={items.length === 0} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400">
                    Add {items.length} Items to Pantry
                </button>
            </footer>

            {editingIndex !== null && (
               <EditPantryItemPopup 
                   item={items[editingIndex]}
                   onClose={() => setEditingIndex(null)}
                   onSave={(updatedItem) => handleUpdateItem(editingIndex, updatedItem)}
               />
            )}

            <style>{`
              @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
              .animate-slide-in { animation: slide-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default PantryScanReviewScreen;
