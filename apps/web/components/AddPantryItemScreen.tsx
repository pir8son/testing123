
import React, { useRef } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { BarcodeIcon } from './icons/BarcodeIcon';
import { CameraIcon } from './icons/CameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Ingredient } from '../types';

interface AddPantryItemScreenProps {
  onClose: () => void;
  onManualAdd: (items: Ingredient[]) => void;
  onScanImage: (file: File, source: 'Receipt' | 'Fridge') => void;
  onScanBarcode: () => void;
}

const AddPantryItemScreen: React.FC<AddPantryItemScreenProps> = ({ onClose, onManualAdd, onScanImage, onScanBarcode }) => {
    const receiptFileRef = useRef<HTMLInputElement>(null);
    const fridgeFileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, source: 'Receipt' | 'Fridge') => {
        const file = event.target.files?.[0];
        if (file) {
            onScanImage(file, source);
        }
    };
    
    const handleManualAdd = () => {
        const name = prompt("Enter item name:");
        const amount = prompt("Enter amount:");
        if(name && amount) {
            onManualAdd([{name, amount}]);
            alert("Item added!");
        }
    }

    return (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-40 flex flex-col animate-slide-in">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
                <button onClick={onClose} className="p-2 -ml-2 mr-2">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Add to Pantry</h1>
            </header>
            
            <div className="flex-grow p-4 space-y-4">
                <p className="text-sm text-center text-gray-500">Choose a method to add items to your pantry.</p>
                
                <input type="file" accept="image/*" ref={receiptFileRef} onChange={(e) => handleFileChange(e, 'Receipt')} className="hidden" />
                <input type="file" accept="image/*" ref={fridgeFileRef} onChange={(e) => handleFileChange(e, 'Fridge')} className="hidden" />

                <button onClick={() => receiptFileRef.current?.click()} className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-violet-300 dark:border-violet-700 flex items-center gap-4 text-left hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                    <SparklesIcon className="w-8 h-8 text-violet-500 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-800 dark:text-white">Scan Receipt with AI</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Upload a photo of your receipt.</p>
                    </div>
                </button>

                <button onClick={() => fridgeFileRef.current?.click()} className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-300 dark:border-green-700 flex items-center gap-4 text-left hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                    <CameraIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-800 dark:text-white">Scan Fridge with AI</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Take a picture of your fridge or cabinet.</p>
                    </div>
                </button>
                
                <button onClick={onScanBarcode} className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-300 dark:border-blue-700 flex items-center gap-4 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                    <BarcodeIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-800 dark:text-white">Scan a Barcode</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Quickly add packaged items.</p>
                    </div>
                </button>
                 <button onClick={handleManualAdd} className="w-full mt-2 py-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 font-bold rounded-xl">
                    Add Manually
                </button>
            </div>
            <style>{`
              @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
              .animate-slide-in { animation: slide-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default AddPantryItemScreen;
