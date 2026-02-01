
import React, { useState, useRef } from 'react';
import { Recipe, Difficulty, Ingredient, UserProfile } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { mediaAnalysisService } from '../services/mediaAnalysis'; 
import { CameraIcon } from './icons/CameraIcon';
import { VideoIcon } from './icons/VideoIcon';
import { storageService } from '../services/storageService';
import { backend } from '../services/backend'; 
import { recipeService } from '../services/recipeService'; // Import RecipeService
import { VideoFrameSelector } from './VideoFrameSelector'; // Import Selector
import { RECIPE_CATEGORIES } from '../constants/categories'; // Import Categories

interface UploadScreenProps {
  onClose: () => void;
  onPublish: (newRecipe: Omit<Recipe, 'id' | 'creator' | 'likes' | 'comments' | 'shares'>) => void;
  currentUser: UserProfile;
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


const UploadScreen: React.FC<UploadScreenProps> = ({ onClose, onPublish, currentUser }) => {
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [prepTime, setPrepTime] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [servings, setServings] = useState('2');
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [ingredients, setIngredients] = useState<Omit<Ingredient, 'inPantry'>[]>([{ amount: '', name: '' }]);
    const [instructions, setInstructions] = useState(['']);
    const [category, setCategory] = useState<string>(''); // New Category State
    
    // Media State
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string>('');
    
    // New: Frame Selector State
    const [thumbnailTime, setThumbnailTime] = useState(1000); // Default 1s
    
    // Status State
    const [isScanning, setIsScanning] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [uploadStep, setUploadStep] = useState(''); // 'image' | 'video' | 'saving'
    // const [progress, setProgress] = useState(0); // recipeService handles this internally now (simplified)

    // Refs
    const scanMediaInputRef = useRef<HTMLInputElement>(null);
    const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
    const videoFileInputRef = useRef<HTMLInputElement>(null);

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
    
    const populateForm = (data: Partial<Recipe>) => {
        if(data.title) setTitle(data.title);
        if(data.description) setDescription(data.description);
        if(data.prepTime) setPrepTime(data.prepTime);
        if(data.cookTime) setCookTime(data.cookTime);
        if(data.servings) setServings(data.servings.toString());
        if(data.difficulty) setDifficulty(data.difficulty);
        if(data.ingredients && data.ingredients.length > 0) setIngredients(data.ingredients);
        if(data.instructions && data.instructions.length > 0) setInstructions(data.instructions);
    };

    const handleMediaScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setUploadStep('Analyzing Media...');
        try {
            // Optimized analysis (Video -> Frame -> AI)
            const parsedData = await mediaAnalysisService.analyzeMedia(file);
            populateForm(parsedData);
            
            // Auto-set as respective file
            const isVideo = file.type.startsWith('video/');
            if (isVideo) {
                setVideoFile(file);
                setVideoPreview(URL.createObjectURL(file));
                // Automatically clear any manual thumbnail to show frame selector
                setThumbnailFile(null); 
                setThumbnailPreview('');
            } else {
                setThumbnailFile(file);
                setThumbnailPreview(URL.createObjectURL(file));
            }
        } catch (error) {
            console.error("Failed to scan recipe", error);
            alert("Sorry, I couldn't read the recipe from that media. Please try another one or enter the details manually.");
        } finally {
            setIsScanning(false);
            setUploadStep('');
        }
    };

    const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const objectUrl = URL.createObjectURL(file);
            setThumbnailPreview(objectUrl);
        }
    }

    const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
            const objectUrl = URL.createObjectURL(file);
            setVideoPreview(objectUrl);
            
            // If no custom thumbnail is set, we will default to frame selector
            if (!thumbnailFile) {
                setThumbnailPreview('');
            }
        }
    }

    // "Instant" Draft Save (Keeps existing robust logic)
    const handleSaveDraft = async () => {
        if (!title.trim()) {
            alert("Please enter a title to save a draft.");
            return;
        }
        
        setIsPublishing(true);
        setUploadStep('Saving Draft...');
        
        const draftId = `draft_${Date.now()}`;
        
        try {
            const draftData: Partial<Recipe> = {
                id: draftId,
                title,
                description,
                ingredients: ingredients.filter(i => i.name),
                instructions: instructions.filter(i => i),
                prepTime,
                cookTime,
                imageUrl: '', 
                videoUrl: '',
                category: category // Save category to draft
            };

            await backend.saveDraft(currentUser.id, draftData);
            
            // Background uploads for drafts still use direct storageService
            const uploadTask = async () => {
                let imageUrl = '';
                let videoUrl = '';
                try {
                    if (thumbnailFile) imageUrl = await storageService.uploadFile(thumbnailFile, 'images');
                    if (videoFile) videoUrl = await storageService.uploadFile(videoFile, 'videos');
                    if (imageUrl || videoUrl) await backend.updateDraft(currentUser.id, draftId, { imageUrl, videoUrl });
                } catch (e) { console.error("Background upload for draft failed:", e); }
            };
            uploadTask();

            alert("Draft saved!");
            onClose();

        } catch(e) {
            console.error("Draft save failed", e);
            alert("Failed to save draft.");
            setIsPublishing(false);
        }
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert("Please enter a recipe title.");
            return;
        }
        if (!videoFile) {
            alert("A recipe video is required to post.");
            return;
        }
        // Requirement check: Either custom thumbnail OR video exists (to generate one)
        if (!thumbnailFile && !videoFile) {
             alert("Please upload a video to generate a cover photo.");
             return;
        }

        setIsPublishing(true);
        setUploadStep('Publishing...');

        try {
            const recipeData = {
                title,
                description,
                prepTime,
                cookTime,
                servings: Number(servings),
                difficulty,
                ingredients: ingredients.filter(i => i.name && i.amount),
                instructions: instructions.filter(i => i),
                nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
            };

            // Use the enhanced RecipeService
            // It handles: Compression, Auto-Thumbnail generation from video timestamp, Uploads, and DB write.
            const newRecipe = await recipeService.createRecipe(
                currentUser,
                recipeData,
                { 
                    video: videoFile, 
                    image: thumbnailFile || undefined // If undefined, service uses video + timestamp
                },
                thumbnailTime, // Pass selected timestamp
                category // Pass selected category
            );

            onPublish(newRecipe);
            
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to publish recipe. Please try again.");
        } finally {
            setIsPublishing(false);
            setUploadStep('');
        }
    };

  return (
    <>
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-40 flex flex-col animate-slide-in">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg z-10">
        <div className="flex items-center">
            <button onClick={onClose} className="p-2 -ml-2 mr-2">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Upload Recipe</h1>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleSaveDraft}
                disabled={isPublishing}
                className="text-gray-500 font-medium text-sm px-3 py-1 hover:text-gray-800 dark:hover:text-gray-200"
            >
                Save Draft
            </button>
            <button 
                onClick={handleSubmit} 
                disabled={isPublishing}
                className="text-green-600 font-bold text-lg disabled:opacity-50"
            >
                {isPublishing ? 'Posting...' : 'Post'}
            </button>
        </div>
      </header>
      
      <div className="flex-grow p-4 overflow-y-auto space-y-6 pb-20">
        
        {/* Unified Scan Helper */}
        <input type="file" accept="image/*,video/*" ref={scanMediaInputRef} onChange={handleMediaScan} className="hidden" />
        <button 
            onClick={() => scanMediaInputRef.current?.click()}
            disabled={isScanning}
            className="w-full py-3 bg-violet-100 text-violet-700 font-bold rounded-xl hover:bg-violet-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border border-violet-200"
        >
            {isScanning ? (
                <>
                    <div className="w-5 h-5 border-2 border-violet-700 border-t-transparent rounded-full animate-spin"></div>
                    {uploadStep || "Analyzing..."}
                </>
            ) : (
                <>
                    <SparklesIcon className="w-5 h-5" />
                    Autofill from Media (Video/Image)
                </>
            )}
        </button>

        {/* Media Section */}
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-800 pb-2">Media</h3>
            
            {/* Video Input (Primary) */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Recipe Video (Required)</label>
                <input type="file" accept="video/*" ref={videoFileInputRef} onChange={handleVideoSelect} className="hidden" />
                
                {!videoFile ? (
                    <div 
                        onClick={() => videoFileInputRef.current?.click()}
                        className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                    >
                        <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <VideoIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Tap to upload video</span>
                    </div>
                ) : (
                    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black">
                        <video src={videoPreview} controls className="w-full max-h-64 object-contain" />
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setVideoPreview('');
                                setVideoFile(null);
                                if(videoFileInputRef.current) videoFileInputRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-md z-10 hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Cover Photo Selection (Adaptive UI) */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Cover Photo</label>
                    
                    {/* Toggle between Custom Upload and Frame Selector */}
                    {videoFile && !thumbnailFile && (
                        <button 
                            onClick={() => thumbnailFileInputRef.current?.click()} 
                            className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full transition-colors"
                        >
                            Upload Custom Image
                        </button>
                    )}
                    {thumbnailFile && (
                        <button 
                            onClick={() => {
                                setThumbnailFile(null);
                                setThumbnailPreview('');
                                if(thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = '';
                            }} 
                            className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full transition-colors"
                        >
                            Remove Custom Image
                        </button>
                    )}
                </div>

                <input type="file" accept="image/*" ref={thumbnailFileInputRef} onChange={handleThumbnailSelect} className="hidden" />

                {thumbnailFile ? (
                    // 1. Custom Image UI
                    <div className="w-full h-48 rounded-xl overflow-hidden relative group border border-gray-200 dark:border-gray-700">
                        <img src={thumbnailPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => thumbnailFileInputRef.current?.click()} className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">
                                Change Image
                            </button>
                        </div>
                    </div>
                ) : videoFile ? (
                    // 2. Video Frame Selector UI
                    <VideoFrameSelector 
                        videoFile={videoFile} 
                        onTimeChange={(ms) => setThumbnailTime(ms)}
                    />
                ) : (
                    // 3. Placeholder UI (No video yet)
                    <div 
                        onClick={() => thumbnailFileInputRef.current?.click()}
                        className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-60"
                    >
                        <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs font-semibold text-gray-500">Upload a video first to select a frame</span>
                        <span className="text-[10px] text-gray-400">or tap here to upload an image now</span>
                    </div>
                )}
            </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-4 border-b dark:border-gray-800 pb-2">Details</h3>
            
            <InputField label="Recipe Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Creamy Tuscan Chicken" />
            <TextAreaField label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="A short, enticing description of your dish." />
            
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
                <InputField label="Prep Time" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="e.g., 10 min" />
                <InputField label="Cook Time" value={cookTime} onChange={e => setCookTime(e.target.value)} placeholder="e.g., 30 min" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Servings" value={servings} onChange={e => setServings(e.target.value)} type="number" placeholder="e.g., 4" />
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
      
       <footer className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-20">
          <button 
            onClick={handleSubmit}
            disabled={isPublishing}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPublishing ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    {uploadStep}
                </>
            ) : (
                "Post Recipe"
            )}
          </button>
      </footer>

      <style>{`
          @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
    </>
  );
};

export default UploadScreen;
