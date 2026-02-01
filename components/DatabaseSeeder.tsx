
import React, { useState } from 'react';
// @ts-ignore -- Resolves TS error claiming exports are missing in firebase/firestore module
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { mockFeed } from '../data/mockFeed';
import { UploadIcon } from './icons/UploadIcon';

const DatabaseSeeder: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [log, setLog] = useState<string>('');

  const sanitizeRecipe = (recipe: any) => {
    // Helper to ensure we only get primitives and avoid circular refs (like DOM nodes)
    const safeString = (val: any) => (val && typeof val === 'string') ? val : '';
    const safeNumber = (val: any) => (val && typeof val === 'number') ? val : 0;
    const safeArray = (val: any) => (Array.isArray(val)) ? val : [];

    return {
      id: safeString(recipe.id),
      title: safeString(recipe.title) || "Untitled",
      imageUrl: safeString(recipe.imageUrl),
      // Strictly check videoUrl is a string, otherwise null. 
      // This prevents HTMLVideoElement or other objects from slipping in.
      videoUrl: (recipe.videoUrl && typeof recipe.videoUrl === 'string') ? recipe.videoUrl : null, 
      thumbnailUrl: (recipe.thumbnailUrl && typeof recipe.thumbnailUrl === 'string') ? recipe.thumbnailUrl : null,
      creator: {
          username: safeString(recipe.creator?.username) || "Unknown",
          avatarUrl: safeString(recipe.creator?.avatarUrl)
      },
      likes: safeNumber(recipe.likes),
      comments: safeNumber(recipe.comments),
      shares: safeNumber(recipe.shares),
      prepTime: safeString(recipe.prepTime) || "0 min",
      cookTime: safeString(recipe.cookTime) || "0 min",
      servings: safeNumber(recipe.servings) || 1,
      description: safeString(recipe.description),
      difficulty: safeString(recipe.difficulty) || "Medium",
      category: safeString(recipe.category) || "General",
      // Map arrays to ensure they contain safe primitives
      collections: safeArray(recipe.collections).map((c: any) => safeString(c)),
      tags: safeArray(recipe.tags).map((t: any) => safeString(t)),
      ingredients: safeArray(recipe.ingredients).map((ing: any) => ({
          name: safeString(ing.name) || "Unknown Ingredient",
          amount: safeString(ing.amount),
          inPantry: !!ing.inPantry
      })),
      instructions: safeArray(recipe.instructions).map((i: any) => safeString(i)),
      nutrition: {
          calories: safeNumber(recipe.nutrition?.calories),
          protein: safeNumber(recipe.nutrition?.protein),
          carbs: safeNumber(recipe.nutrition?.carbs),
          fat: safeNumber(recipe.nutrition?.fat)
      }
    };
  };

  const handleSeed = async () => {
    if (!db) {
      setLog('Error: Database not initialized. Check API Key.');
      setStatus('error');
      return;
    }

    if (confirm('Are you sure you want to overwrite the "recipes" collection with mock data?')) {
      setStatus('loading');
      setLog('Starting seed process...');
      
      try {
        // We use a batch for better performance and atomicity
        const batch = writeBatch(db);
        let count = 0;

        mockFeed.forEach((recipe) => {
          const docRef = doc(db, 'recipes', recipe.id);
          // Use sanitizeRecipe to guarantee a clean object tree
          const recipeData = sanitizeRecipe(recipe);
          batch.set(docRef, recipeData);
          count++;
        });

        await batch.commit();
        
        setStatus('success');
        setLog(`Success! Uploaded ${count} recipes to Firestore.`);
        console.log(`[Seeder] Successfully uploaded ${count} documents.`);
      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setLog(`Error: ${err.message}`);
      }
    }
  };

  if (status === 'success') {
      return (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white p-4 rounded-xl shadow-2xl flex flex-col gap-2 max-w-sm">
              <p className="font-bold">Database Seeded! 🎉</p>
              <p className="text-xs">{log}</p>
              <button onClick={() => setStatus('idle')} className="bg-white/20 text-xs py-1 px-2 rounded hover:bg-white/30">Close</button>
          </div>
      )
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleSeed}
        disabled={status === 'loading'}
        className={`flex items-center gap-2 px-4 py-3 font-bold rounded-xl shadow-xl transition-all ${
            status === 'loading' 
            ? 'bg-gray-500 cursor-wait' 
            : status === 'error' 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white`}
      >
        {status === 'loading' ? (
            <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                Seeding...
            </>
        ) : (
            <>
                <UploadIcon className="w-5 h-5" />
                SEED DATABASE
            </>
        )}
      </button>
      {status === 'error' && (
          <div className="absolute top-full right-0 mt-2 bg-red-100 text-red-800 p-2 rounded text-xs w-64 border border-red-200">
              {log}
          </div>
      )}
    </div>
  );
};

export default DatabaseSeeder;
