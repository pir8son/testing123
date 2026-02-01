
import React from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { Theme, DietaryPreference, UserSettings } from '../types';
import { ToggleLeftIcon } from './icons/ToggleLeftIcon';
import { ToggleRightIcon } from './icons/ToggleRightIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { UserIcon } from './icons/UserIcon';

interface SettingsScreenProps {
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onOpenCreatorSettings: () => void; // New prop
}

const dietaryOptions: DietaryPreference[] = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free'];

const ToggleSetting: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl">
        <span className="font-semibold text-gray-800 dark:text-gray-100">{label}</span>
        <button onClick={onChange} className={`text-2xl ${checked ? 'text-green-600' : 'text-gray-400'}`}>
            {checked ? <ToggleRightIcon className="w-10 h-10" /> : <ToggleLeftIcon className="w-10 h-10" />}
        </button>
    </div>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
    onClose, settings, onUpdateSettings, onOpenCreatorSettings
}) => {

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleTogglePreference = (preference: DietaryPreference) => {
    const newPreferences = new Set<DietaryPreference>(settings.dietaryPreferences);
    if (newPreferences.has(preference)) {
      newPreferences.delete(preference);
    } else {
      newPreferences.add(preference);
    }
    updateSetting('dietaryPreferences', newPreferences);
  };

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-30 flex flex-col animate-slide-in">
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <button onClick={onClose} className="p-2 -ml-2 mr-2">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Settings</h1>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-6 pb-24">
        
        {/* Account Section */}
         <div>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Account & Profile</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                <button 
                    onClick={onOpenCreatorSettings}
                    className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                    <div className="flex items-center gap-3">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                        <span className="font-semibold text-gray-800 dark:text-gray-100">Creator Profile Settings</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </button>
            </div>
        </div>

        {/* Appearance Section */}
        <div>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Appearance</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                <p className="font-semibold text-gray-800 dark:text-gray-100">Theme</p>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button 
                        onClick={() => updateSetting('theme', 'light')} 
                        className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${settings.theme === 'light' ? 'bg-white shadow text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Light
                    </button>
                    <button 
                        onClick={() => updateSetting('theme', 'dark')} 
                        className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${settings.theme === 'dark' ? 'bg-gray-600 shadow text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Dark
                    </button>
                </div>
            </div>
        </div>

        {/* App Preferences */}
        <div>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Preferences</h2>
            <div className="space-y-3">
                <ToggleSetting 
                    label="Push Notifications" 
                    checked={settings.notificationsEnabled} 
                    onChange={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)} 
                />
                <ToggleSetting 
                    label="Autoplay Videos" 
                    checked={settings.autoplayVideo} 
                    onChange={() => updateSetting('autoplayVideo', !settings.autoplayVideo)} 
                />
                <ToggleSetting 
                    label="Use Metric System (kg/ml)" 
                    checked={settings.useMetricSystem} 
                    onChange={() => updateSetting('useMetricSystem', !settings.useMetricSystem)} 
                />
            </div>
        </div>

        {/* Dietary Preferences Section */}
        <div>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Dietary Preferences</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Select any preferences that apply. This will help us personalize your recipe recommendations.</p>
                <div className="grid grid-cols-2 gap-3">
                    {dietaryOptions.map(option => (
                        <button 
                            key={option}
                            onClick={() => handleTogglePreference(option)}
                            className={`py-2 px-3 text-sm font-semibold rounded-lg border-2 transition-colors ${
                                settings.dietaryPreferences.has(option) 
                                ? 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300' 
                                : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Danger Zone */}
         <div>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Data</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                 <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                    <span className="font-semibold text-red-600">Delete Account</span>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </button>
            </div>
        </div>
        
        <div className="text-center pt-4">
             <p className="text-xs text-gray-400">Version 1.0.3 • Build 20240521</p>
        </div>

      </div>
       <style>{`
            @keyframes slide-in {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            .animate-slide-in {
                animation: slide-in 0.3s ease-out;
            }
        `}</style>
    </div>
  );
};

export default SettingsScreen;
