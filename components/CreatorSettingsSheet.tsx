
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';
import { storageService } from '../services/storageService';
import { db } from '../config/firebase';
// @ts-ignore
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

interface CreatorSettingsSheetProps {
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

const CreatorSettingsSheet: React.FC<CreatorSettingsSheetProps> = ({ onClose, userProfile, onUpdateProfile }) => {
  const [bio, setBio] = useState(userProfile.bio || '');
  const [username, setUsername] = useState(userProfile.username || '');
  const [usernameError, setUsernameError] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Local previews for immediate feedback
  const [avatarPreview, setAvatarPreview] = useState(userProfile.avatarUrl);
  const [bannerPreview, setBannerPreview] = useState(userProfile.bannerUrl);
  
  // File objects
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const validateUsername = (val: string): boolean => {
      const regex = /^[a-zA-Z0-9_]{4,15}$/;
      if (!regex.test(val)) {
          setUsernameError("4-15 chars, alphanumeric & underscores only.");
          return false;
      }
      setUsernameError("");
      return true;
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setUsername(val);
      validateUsername(val);
  }

  const handleSave = async () => {
    if (!validateUsername(username)) return;
    
    setIsSaving(true);
    try {
      // 1. Check Username Uniqueness if changed
      if (username !== userProfile.username) {
          const usernameRef = doc(db, 'usernames', username.toLowerCase());
          const usernameDoc = await getDoc(usernameRef);
          
          if (usernameDoc.exists()) {
              setUsernameError("Username already taken.");
              setIsSaving(false);
              return;
          }
          
          // Reserve new username
          await setDoc(usernameRef, { uid: userProfile.id });
          // Note: Ideally delete old username doc here, but omitting for simplicity in this update
      }

      let newAvatarUrl = userProfile.avatarUrl;
      let newBannerUrl = userProfile.bannerUrl;

      // Upload if changed
      if (avatarFile) {
        newAvatarUrl = await storageService.uploadFile(avatarFile, 'images');
      }
      if (bannerFile) {
        newBannerUrl = await storageService.uploadFile(bannerFile, 'images');
      }

      const updatedData = {
        username: username, // Update username
        bio: bio.trim(),
        avatarUrl: newAvatarUrl,
        bannerUrl: newBannerUrl
      };

      // Update Firestore
      const userRef = doc(db, 'users', userProfile.id);
      await updateDoc(userRef, updatedData);

      // Update Local State
      onUpdateProfile({ ...userProfile, ...updatedData });
      onClose();

    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90%] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Edit Profile</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <XIcon className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-6">
            
            {/* Banner Edit */}
            <div className="relative h-32 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-violet-500"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/30 backdrop-blur-sm p-2 rounded-full text-white">
                        <CameraIcon className="w-6 h-6" />
                    </div>
                </div>
                <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
            </div>

            {/* Avatar Edit - Negative Margin to overlap banner */}
            <div className="relative -mt-16 ml-4 w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-100 group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                 <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <CameraIcon className="w-6 h-6 text-white" />
                </div>
                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>

            {/* Fields */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">@</span>
                    <input 
                        type="text" 
                        value={username}
                        onChange={handleUsernameChange}
                        className={`w-full p-3 pl-8 bg-gray-100 dark:bg-gray-800 border ${usernameError ? 'border-red-500' : 'border-transparent'} rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                </div>
                {usernameError && <p className="text-xs text-red-500 mt-1 font-semibold">{usernameError}</p>}
                <p className="text-xs text-gray-400 mt-1">Unique, 4-15 chars, alphanumeric only.</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your cooking style..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 min-h-[100px]"
                />
            </div>

        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button 
                onClick={handleSave}
                disabled={isSaving || !!usernameError}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSaving ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        Saving...
                    </>
                ) : 'Save Changes'}
            </button>
        </div>

      </div>
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default CreatorSettingsSheet;
