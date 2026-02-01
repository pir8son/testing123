import React, { useState, useEffect } from 'react';
import { Recipe, HealthierVersion } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface MakeHealthierPopupProps {
  recipe: Recipe;
  onClose: () => void;
  getHealthierVersion: (recipe: Recipe) => Promise<HealthierVersion>;
}

const MakeHealthierPopup: React.FC<MakeHealthierPopupProps> = ({ recipe, onClose, getHealthierVersion }) => {
    const [healthierVersion, setHealthierVersion] = useState<HealthierVersion | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHealthierVersion = async () => {
            setIsLoading(true);
            try {
                const result = await getHealthierVersion(recipe);
                setHealthierVersion(result);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHealthierVersion();
    }, [recipe, getHealthierVersion]);
    
    return (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-4 animate-popup max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-start mb-2 flex-shrink-0">
                     <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Make it Healthier</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered suggestions for "{recipe.title}"</p>
                    </div>
                    <button onClick={onClose} className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </header>

                <div className="overflow-y-auto no-scrollbar">
                     {isLoading ? (
                         <div className="flex justify-center items-center h-40">
                            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                     ) : healthierVersion ? (
                         <div className="space-y-4 py-2">
                             <h3 className="font-bold text-lg text-violet-600 dark:text-violet-400">{healthierVersion.newTitle}</h3>
                             <p className="text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">{healthierVersion.description}</p>
                             <div>
                                 <h4 className="font-bold mb-2">New Ingredients:</h4>
                                 <ul className="list-disc list-inside text-sm space-y-1">
                                     {healthierVersion.ingredients.map((ing, i) => (
                                        <li key={i}><span className="font-semibold">{ing.amount}</span> {ing.name}</li>
                                     ))}
                                 </ul>
                             </div>
                             <div>
                                 <h4 className="font-bold mb-2">New Instructions:</h4>
                                  <ol className="list-decimal list-inside text-sm space-y-2">
                                     {healthierVersion.instructions.map((step, i) => <li key={i}>{step}</li>)}
                                 </ol>
                             </div>
                         </div>
                     ) : (
                         <p className="text-center py-10">Could not generate a healthier version.</p>
                     )}
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

export default MakeHealthierPopup;