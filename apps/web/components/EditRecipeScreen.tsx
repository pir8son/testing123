
import React, { useState } from 'react';
import { Recipe, Difficulty, Ingredient } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { CameraIcon } from './icons/CameraIcon';
import { recipeService } from '../services/recipeService';
import { RECIPE_CATEGORIES } from '../constants/categories';

interface EditRecipeScreenProps {
  recipe: Recipe;
  onClose: () => void;
  onUpdate: (updatedRecipe: Recipe) => void;
  userId: string;
}

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }> = 
    ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
        />
    </div>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string }> = 
    ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</label>
        <textarea 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px] dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
        />
    </div>
);

const EditRecipeScreen: React.FC<EditRecipeScreenProps> = ({ recipe, onClose, onUpdate, userId }) => {
    // Form State (Pre-filled)
    const [title, setTitle] = useState(recipe.title);
    const [description, setDescription] = useState(recipe.description);
    const [prepTime, setPrepTime] = useState(recipe.prepTime);
    const [cookTime, setCookTime] = useState(recipe.cookTime);
    const [servings, setServings] = useState(recipe.servings.toString());
    const [difficulty, setDifficulty] = useState<Difficulty>(recipe.difficulty);
    const [ingredients, setIngredients] = useState<Omit<Ingredient, 'inPantry'>[]>(recipe.ingredients || []);
    const [instructions, setInstructions] = useState<string[]>(recipe.instructions || []);
    const [category, setCategory] = useState<string>(recipe.category || 'General');
    
    // Media State
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>(recipe.imageUrl);
    
    // Status State
    const [isSaving, setIsSaving] = useState(false);

    const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    }

    const handleIngredientChange = (index: number, field: 'amount' | 'name', value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { amount: '', name: '' }]);
    };
    
    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleInstructionChange = (index: number, value: string) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
    };

    const addInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const removeInstruction = (index: number) => {
        setInstructions(instructions.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert("Title is required.");
            return;
        }

        setIsSaving(true);

        try {
            const updates: Partial<Recipe> = {
                title,
                description,
                prepTime,
                cookTime,
                servings: Number(servings),
                difficulty,
                category,
                ingredients: ingredients.filter(i => i.name && i.amount),
                instructions: instructions.filter(i => i),
            };

            await recipeService.updateRecipe(userId, recipe.id, updates, thumbnailFile || undefined);
            
            // Construct optimistic updated object to return immediately
            const updatedRecipeFull: Recipe = {
                ...recipe,
                ...updates,
                imageUrl: thumbnailFile ? thumbnailPreview : recipe.imageUrl // Approximate preview
            };

            onUpdate(updatedRecipeFull);
            onClose();

        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update recipe.");
        } finally {
            setIsSaving(false);
        }
    };

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-50 flex flex-col animate-slide-in">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg z-10">
        <div className="flex items-center">
            <button onClick={onClose} className="p-2 -ml-2 mr-2">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Edit Recipe</h1>
        </div>
        <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="text-green-600 font-bold text-lg disabled:opacity-50"
        >
            {isSaving ? 'Saving...' : 'Save'}
        </button>
      </header>
      
      <div className="flex-grow p-4 overflow-y-auto space-y-6 pb-20">
        
        {/* Cover Photo */}
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Cover Photo</label>
            <div className="w-full h-48 rounded-xl overflow-hidden relative group border border-gray-200 dark:border-gray-700">
                <img src={thumbnailPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <label className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 cursor-pointer">
                        <CameraIcon className="w-4 h-4" />
                        Change Image
                        <input type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                    </label>
                </div>
            </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
            <InputField label="Recipe Title" value={title} onChange={e => setTitle(e.target.value)} />
            <TextAreaField label="Description" value={description} onChange={e => setDescription(e.target.value)} />
            
            {/* Category Selector */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Category</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {RECIPE_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.name)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                category === cat.name
                                ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputField label="Prep Time" value={prepTime} onChange={e => setPrepTime(e.target.value)} />
                <InputField label="Cook Time" value={cookTime} onChange={e => setCookTime(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Servings" value={servings} onChange={e => setServings(e.target.value)} type="number" />
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Difficulty</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Ingredients */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Ingredients</h3>
            <div className="space-y-2">
                {ingredients.map((ing, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={ing.amount} 
                            onChange={e => handleIngredientChange(index, 'amount', e.target.value)} 
                            placeholder="Amount" 
                            className="w-1/3 p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
                        />
                        <input 
                            type="text" 
                            value={ing.name} 
                            onChange={e => handleIngredientChange(index, 'name', e.target.value)} 
                            placeholder="Ingredient Name" 
                            className="w-2/3 p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
                        />
                        <button onClick={() => removeIngredient(index)} className="p-2 text-red-500">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={addIngredient} className="mt-2 text-sm font-bold text-green-600 flex items-center gap-1"><PlusIcon className="w-4 h-4" /> Add Ingredient</button>
        </div>
        
        {/* Instructions */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Instructions</h3>
             <div className="space-y-2">
                {instructions.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                         <span className="font-bold pt-3 text-gray-500 dark:text-gray-400">{index + 1}.</span>
                        <textarea 
                            value={step} 
                            onChange={e => handleInstructionChange(index, e.target.value)} 
                            placeholder={`Step ${index + 1}`} 
                            className="flex-grow p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px] dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
                        />
                        <button onClick={() => removeInstruction(index)} className="p-2 text-red-500 pt-3">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
            </div>
             <button onClick={addInstruction} className="mt-2 text-sm font-bold text-green-600 flex items-center gap-1"><PlusIcon className="w-4 h-4" /> Add Step</button>
        </div>

      </div>

      <style>{`
          @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default EditRecipeScreen;
