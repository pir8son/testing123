import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { db } from '../services/firebaseConfig';
// @ts-ignore
import { doc, setDoc } from 'firebase/firestore';
import { CameraIcon } from './icons/CameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface OnboardingScreenProps {
  userId: string; // Phone number from login
  onComplete: (profile: UserProfile) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ userId, onComplete }) => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      alert("Please choose a username.");
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarUrl = 'https://i.pravatar.cc/150'; // Default

      if (avatarFile) {
        avatarUrl = await storageService.uploadFile(avatarFile, 'images');
      }

      // 1. Profile Data (From Form)
      const profileData: UserProfile = {
        id: userId,
        username: username.trim(),
        bio: bio.trim(),
        avatarUrl,
        createdAt: new Date().toISOString(),
        followersCount: 0,
        followingCount: 0,
        likedRecipeIds: [],
        followingIds: []
      };

      // 2. Full User State (Profile + Defaults)
      // We merge the profile with the default app state so the database has a complete record
      const newUserFullProfile = {
        ...profileData,

        // Default App State (The "Kitchen")
        pantryItems: [],
        shoppingListRecipeIds: [],
        checkedShoppingListItems: [],
        savedRecipeIds: [],
        favoritedRecipeIds: [],
        nutritionLog: [],
        savedMealPlans: [],
        
        // Default Settings
        settings: {
            theme: 'light',
            dietaryPreferences: [],
            notificationsEnabled: true,
            useMetricSystem: false,
            autoplayVideo: true
        },

        // Default Goals
        nutritionGoals: {
            calories: 2200,
            protein: 160,
            carbs: 250,
            fat: 70
        },

        // Default Quick Actions
        quickActions: ["scan", "log", "create"],

        // Default Collections
        collections: {
            "healthy-choices": { name: "Healthy Choices", recipeIds: [] },
            "quick-dinners": { name: "Quick Dinners", recipeIds: [] }
        }
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), newUserFullProfile);

      // Complete Onboarding
      // We pass just the profile part to the app state, ensuring the UI updates immediately
      onComplete(profileData);

    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 flex flex-col p-6 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">Tell us a bit about yourself</p>
        </div>

        {/* Avatar Upload */}
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-32 h-32 rounded-full border-4 border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-lg">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <CameraIcon className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full border-2 border-white dark:border-gray-900">
            <CameraIcon className="w-4 h-4 text-white" />
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
        </div>

        <div className="w-full max-w-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@chef_john"
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bio (Optional)</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I love italian food..."
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white h-24 resize-none"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-green-200 dark:shadow-none hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating Profile...' : 'Get Started'}
      </button>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default OnboardingScreen;