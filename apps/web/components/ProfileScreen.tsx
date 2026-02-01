import React, { useState, useEffect } from 'react';
import { Recipe, QuickActionType, SubScreen, UserProfile, SavedList } from '../types';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { PackageIcon } from './icons/PackageIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { PieChartIcon } from './icons/PieChartIcon';
import { CameraIcon } from './icons/CameraIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ShareIcon } from './icons/ShareIcon';
import { shareService } from '../services/shareService';
import { LightbulbIcon } from './icons/LightbulbIcon';
import SavedMealPlansScreen from './SavedMealPlansScreen'; 
import { CalendarIcon } from './icons/CalendarIcon';

interface ProfileScreenProps {
  userProfile: UserProfile;
  savedRecipeIds: Set<string>;
  onSelectRecipe: (recipe: Recipe) => void;
  shoppingListRecipeIds: Set<string>;
  pantryItemCount: number;
  onNavigate: (screen: SubScreen) => void;
  onOpenSettings: () => void;
  dailyCalories: number;
  calorieGoal: number;
  onOpenCreatorDashboard: () => void;
  onOpenSavedRecipes: () => void;
  onAskAi: () => void;
  onScanPantry: () => void;
  onLogFood: () => void;
  onCreateRecipe: () => void;
  quickActions: Set<QuickActionType>;
  setQuickActions: (actions: Set<QuickActionType>) => void;
  onOpenMealPlanner: () => void;
  onGetSmartSuggestions: () => void;
}

const InfoCard: React.FC<{ title: string; value: string | number; subtitle: string; variant: 'green' | 'amber' | 'orange' | 'violet'; icon: React.ReactNode; onClick?: () => void }> = ({ title, value, subtitle, variant, icon, onClick }) => {
    const variantStyles = {
        green: 'bg-emerald-500 text-white',
        amber: 'bg-amber-500 text-white',
        orange: 'bg-orange-500 text-white',
        violet: 'bg-violet-500 text-white',
    };

    return (
        <button 
            className={`p-4 rounded-2xl flex flex-col justify-between h-32 text-left shadow-md shadow-gray-100 dark:shadow-none transition-transform hover:scale-[1.02] active:scale-95 ${variantStyles[variant]} ${onClick ? 'cursor-pointer' : ''}`} 
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
                    {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6 text-white" })}
                </div>
                <div className="text-right">
                     <span className="text-3xl font-bold leading-none">{value}</span>
                </div>
            </div>
            <div>
                <p className="font-bold text-white text-lg leading-tight">{title}</p>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wide opacity-80">{subtitle}</p>
            </div>
        </button>
    );
};

const QuickTool: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; iconBg: string; onClick: () => void; }> = ({ title, subtitle, icon, iconBg, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center text-left p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${iconBg}`}>
            {icon}
        </div>
        <div className="flex-grow">
            <p className="font-bold text-gray-800 dark:text-gray-100 text-base">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-gray-300" />
    </button>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
    userProfile, savedRecipeIds, onSelectRecipe, shoppingListRecipeIds, pantryItemCount, onNavigate, 
    onOpenSettings, dailyCalories, calorieGoal, onOpenCreatorDashboard, onOpenSavedRecipes, onAskAi,
    onScanPantry, onLogFood, onCreateRecipe, quickActions, setQuickActions, onOpenMealPlanner, onGetSmartSuggestions
}) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'plans'>('hub');
  
  const quickActionConfig: Record<QuickActionType, any> = {
      'scan': { title: "Scan Groceries", subtitle: "Add items to pantry", icon: <CameraIcon className="w-6 h-6 text-green-600 dark:text-green-300"/>, iconBg: "bg-green-100 dark:bg-green-900/30", handler: onScanPantry },
      'log': { title: "Log Calories", subtitle: "Track your meals", icon: <PlusCircleIcon className="w-6 h-6 text-sky-600 dark:text-sky-300"/>, iconBg: "bg-sky-100 dark:bg-sky-900/30", handler: onLogFood },
      'create': { title: "Create Recipe", subtitle: "Share your dish", icon: <UploadIcon className="w-6 h-6 text-pink-600 dark:text-pink-300"/>, iconBg: "bg-pink-100 dark:bg-pink-900/30", handler: onCreateRecipe },
      'plan': { title: "Meal Planner", subtitle: "Plan your week", icon: <CalendarIcon className="w-6 h-6 text-violet-600 dark:text-violet-300"/>, iconBg: "bg-violet-100 dark:bg-violet-900/30", handler: onOpenMealPlanner },
      'suggest': { title: "Smart Ideas", subtitle: "Get AI suggestions", icon: <LightbulbIcon className="w-6 h-6 text-amber-600 dark:text-amber-300"/>, iconBg: "bg-amber-100 dark:bg-amber-900/30", handler: onGetSmartSuggestions }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-950 overflow-y-auto pb-24 no-scrollbar flex flex-col">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
             <img src={userProfile.avatarUrl} alt={userProfile.username} className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover" />
             <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    Hey {userProfile.username} <span className="animate-wave inline-block origin-bottom-right">👋</span>
                </h1>
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => shareService.shareProfile(userProfile)} className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                <ShareIcon className="w-6 h-6" />
            </button>
            <button onClick={onOpenSettings} className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
      </header>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-2xl mx-6 mt-6 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('hub')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'hub' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
          >
              Kitchen Hub
          </button>
          <button 
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'plans' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
          >
              Saved Plans
          </button>
      </div>

      <div className="flex-grow">
          {activeTab === 'hub' ? (
              <div className="p-6 space-y-8">
                <button 
                    onClick={onOpenCreatorDashboard}
                    className="w-full bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 py-3 px-5 rounded-2xl font-bold flex justify-between items-center border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors shadow-sm"
                >
                    <div className="flex items-center gap-2">
                        <span>Creator Dashboard</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 opacity-60" />
                </button>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Cooking Hub</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoCard title="Saved" value={savedRecipeIds.size} subtitle="RECIPES" variant="green" icon={<BookmarkIcon />} onClick={onOpenSavedRecipes} />
                        <InfoCard title="Shopping" value={shoppingListRecipeIds.size} subtitle="RECIPES" variant="amber" icon={<ShoppingCartIcon />} onClick={() => onNavigate('shoppingList')} />
                        <InfoCard title="Pantry" value={pantryItemCount} subtitle="ITEMS" variant="orange" icon={<PackageIcon />} onClick={() => onNavigate('pantry')} />
                        <InfoCard title="Nutrition" value={Math.round(dailyCalories)} subtitle="KCAL GOAL" variant="violet" icon={<PieChartIcon />} onClick={() => onNavigate('nutrition')} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-5 text-white relative overflow-hidden shadow-lg shadow-indigo-200 dark:shadow-none">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <SparklesIcon className="w-5 h-5 text-yellow-300" />
                            <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
                        </div>
                        <h3 className="font-bold text-xl leading-tight mb-4 max-w-[80%]">Wondering what to cook?</h3>
                        <button onClick={onAskAi} className="bg-white text-indigo-600 font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">Ask AI ›</button>
                    </div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        {Array.from(quickActions).map((key) => {
                            const config = quickActionConfig[key as QuickActionType];
                            return <QuickTool key={key} title={config.title} subtitle={config.subtitle} icon={config.icon} iconBg={config.iconBg} onClick={config.handler} />;
                        })}
                    </div>
                </div>
              </div>
          ) : (
              <div className="h-full">
                  {/* FIXED: Explicitly pass the Phone Number based ID */}
                  <SavedMealPlansScreen 
                    userId={userProfile.id}
                    onClose={() => setActiveTab('hub')} 
                    onAddToShoppingList={(plan) => console.log("Added plan via Hub:", plan.title)} 
                    onSelectRecipe={onSelectRecipe}
                    isEmbedded={true}
                  />
              </div>
          )}
      </div>

      <style>{`
        @keyframes wave { 0%, 100% { transform: rotate(0deg); } 20% { transform: rotate(14deg); } 40% { transform: rotate(-8deg); } 60% { transform: rotate(14deg); } 80% { transform: rotate(-4deg); } }
        .animate-wave { animation: wave 2.5s infinite; transform-origin: 70% 70%; }
      `}</style>
    </div>
  );
};

export default ProfileScreen;