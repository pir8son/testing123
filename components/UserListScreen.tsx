
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { interactionService } from '../services/interactionService';
import { db } from '../services/firebaseConfig';
// @ts-ignore
import { doc, getDoc } from 'firebase/firestore';

interface UserListScreenProps {
  type: 'followers' | 'following';
  targetUserId: string;
  currentUserId: string;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
}

// Minimal User Type for the List
interface ListUser {
    id: string;
    username: string;
    avatarUrl: string;
    isFollowing: boolean; // Relative to current user
}

const UserListScreen: React.FC<UserListScreenProps> = ({ type, targetUserId, currentUserId, onClose, onViewProfile }) => {
  const [users, setUsers] = useState<ListUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const fetchList = async () => {
          setIsLoading(true);
          try {
              // Get the IDs first
              const ids = await interactionService.getUserList(targetUserId, type);
              
              if (ids.length === 0) {
                  setUsers([]);
                  setIsLoading(false);
                  return;
              }

              // Fetch User Profiles
              // In a real app, use a bulk query (where 'id' in [...]) or Cloud Function
              const userPromises = ids.map(async (id) => {
                  const docSnap = await getDoc(doc(db, 'users', id));
                  if (!docSnap.exists()) return null;
                  
                  const data = docSnap.data();
                  // Check if current user is following this person
                  const isFollowing = await interactionService.isFollowing(currentUserId, id);
                  
                  return {
                      id: id,
                      username: data.username,
                      avatarUrl: data.avatarUrl || 'https://i.pravatar.cc/150',
                      isFollowing
                  };
              });

              const fetchedUsers = (await Promise.all(userPromises)).filter(u => u !== null) as ListUser[];
              setUsers(fetchedUsers);

          } catch (error) {
              console.error(`Failed to load ${type} list:`, error);
          } finally {
              setIsLoading(false);
          }
      };

      fetchList();
  }, [targetUserId, type, currentUserId]);

  const handleToggleFollow = async (user: ListUser) => {
      // Optimistic update
      setUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
      ));

      try {
          await interactionService.followUser(currentUserId, user.id);
      } catch (error) {
          // Revert
          setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
        ));
      }
  };

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-950 z-50 flex flex-col animate-slide-in">
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg z-10">
        <button onClick={onClose} className="p-2 -ml-2 mr-2">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 capitalize">{type}</h1>
      </header>

      <div className="flex-grow overflow-y-auto p-4">
          {isLoading ? (
              <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
          ) : users.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <p>No {type} yet.</p>
              </div>
          ) : (
              <div className="space-y-4">
                  {users.map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                          <button onClick={() => onViewProfile(user.id)} className="flex items-center gap-3">
                              <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-800" />
                              <div className="text-left">
                                  <p className="font-bold text-gray-900 dark:text-white text-sm">{user.username}</p>
                                  {/* Optional: Add Full Name if available */}
                              </div>
                          </button>
                          
                          {user.id !== currentUserId && (
                              <button 
                                onClick={() => handleToggleFollow(user)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                    user.isFollowing
                                    ? 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                                    : 'bg-green-600 text-white'
                                }`}
                              >
                                  {user.isFollowing ? 'Following' : 'Follow'}
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          )}
      </div>
      <style>{`
          @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default UserListScreen;
