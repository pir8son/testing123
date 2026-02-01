import React, { useState } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { ToggleRightIcon } from './icons/ToggleRightIcon';
import { ToggleLeftIcon } from './icons/ToggleLeftIcon';

interface SaveListModalProps {
  onClose: () => void;
  onSave: (title: string, isPublic: boolean, description: string) => void;
  itemCount: number;
}

const SaveListModal: React.FC<SaveListModalProps> = ({ onClose, onSave, itemCount }) => {
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), isPublic, description.trim());
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl p-6 animate-popup flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-start">
            <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Save Plan</h3>
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mt-2">{itemCount} Ingredients</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <XCircleIcon className="w-8 h-8 text-gray-300 hover:text-gray-500" />
            </button>
        </header>

        <div className="space-y-5">
            <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Plan Name</label>
                <input 
                    autoFocus
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Weekly Essentials"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-base focus:ring-2 focus:ring-green-500 font-bold text-gray-900 dark:text-white placeholder-gray-400"
                />
            </div>

            <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Description (Optional)</label>
                <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What's this plan for?"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 min-h-[80px] text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none"
                />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600">
                <div className="flex-1 pr-4">
                    <p className="font-black text-gray-800 dark:text-white text-sm">Public Template</p>
                    <p className="text-[10px] text-gray-500 font-bold leading-tight mt-0.5">Share with community</p>
                </div>
                <button 
                    onClick={() => setIsPublic(!isPublic)}
                    className={`transition-all duration-200 transform ${isPublic ? 'text-green-600 scale-110' : 'text-gray-300 dark:text-gray-600'}`}
                >
                    {isPublic ? <ToggleRightIcon className="w-12 h-12" /> : <ToggleLeftIcon className="w-12 h-12" />}
                </button>
            </div>
        </div>

        <button 
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full py-4 bg-green-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-500/20 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
        >
            Save Plan
        </button>
      </div>
      <style>{`
        @keyframes popup { 
          from { opacity: 0; transform: scale(0.9) translateY(20px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        .animate-popup { animation: popup 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default SaveListModal;