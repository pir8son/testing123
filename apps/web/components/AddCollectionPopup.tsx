
import React, { useState } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

interface AddCollectionPopupProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

const AddCollectionPopup: React.FC<AddCollectionPopupProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col p-6 animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">New Collection</h2>
          <button onClick={onClose} className="p-1 -mr-2 -mt-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XCircleIcon className="w-7 h-7" />
          </button>
        </header>

        <div>
          <label htmlFor="collection-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Collection Name</label>
          <input
            id="collection-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Weeknight Dinners"
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full mt-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          Create Collection
        </button>

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

export default AddCollectionPopup;
