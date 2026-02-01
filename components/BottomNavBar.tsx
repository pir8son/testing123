
import React from 'react';
import { Tab } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { SearchIcon } from './icons/SearchIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserIcon } from './icons/UserIcon';

interface BottomNavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
  label: Tab;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeColor = label === 'AI' ? 'text-violet-600' : 'text-green-600';
  const inactiveColor = 'text-gray-400';

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-1/4 gap-1 transition-colors duration-200"
    >
      <div className={`w-8 h-8 flex items-center justify-center ${isActive ? activeColor : inactiveColor}`}>
        {icon}
      </div>
      <span className={`text-xs font-medium ${isActive ? 'text-gray-800 font-bold' : inactiveColor}`}>
        {label}
      </span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[83px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 flex justify-around items-start pt-2 z-50">
      <NavItem
        label="Feed"
        icon={<HomeIcon />}
        isActive={activeTab === 'Feed'}
        onClick={() => setActiveTab('Feed')}
      />
      <NavItem
        label="Search"
        icon={<SearchIcon />}
        isActive={activeTab === 'Search'}
        onClick={() => setActiveTab('Search')}
      />
      <NavItem
        label="AI"
        icon={<SparklesIcon />}
        isActive={activeTab === 'AI'}
        onClick={() => setActiveTab('AI')}
      />
      <NavItem
        label="You"
        icon={<UserIcon />}
        isActive={activeTab === 'You'}
        onClick={() => setActiveTab('You')}
      />
    </div>
  );
};

export default BottomNavBar;
