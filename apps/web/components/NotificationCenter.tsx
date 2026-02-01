
import React from 'react';
import { useNotifications, GroupedNotification } from '../hooks/useNotifications';
import { XIcon } from './icons/XIcon';
import { HeartIcon } from './icons/HeartIcon';
import { MessageCircleIcon } from './icons/MessageCircleIcon';
import { UserIcon } from './icons/UserIcon';
import { BellIcon } from './icons/BellIcon';

interface NotificationCenterProps {
  userId: string;
  onClose: () => void;
  onViewRecipe: (recipeId: string) => void;
  onViewProfile: (userId: string) => void;
}

const AvatarStack: React.FC<{ actors: GroupedNotification['actors'], max?: number }> = ({ actors, max = 2 }) => {
    const displayActors = actors.slice(0, max);
    
    return (
        <div className="flex -space-x-2 mr-2">
            {displayActors.map((actor, i) => (
                <img 
                    key={actor.id}
                    src={actor.avatarUrl} 
                    alt={actor.username} 
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 object-cover z-10"
                    style={{ zIndex: 10 - i }}
                />
            ))}
        </div>
    );
};

const GroupedNotificationItem: React.FC<{ 
    group: GroupedNotification, 
    onClick: () => void 
}> = ({ group, onClick }) => {
    
    const getIcon = () => {
        switch(group.type) {
            case 'like_group': return <HeartIcon className="w-4 h-4 text-white" fill="white" />;
            case 'comment': return <MessageCircleIcon className="w-4 h-4 text-white" />;
            case 'follow_group': return <UserIcon className="w-4 h-4 text-white" />;
            default: return <BellIcon className="w-4 h-4 text-white" />;
        }
    };

    const getBgColor = () => {
        switch(group.type) {
            case 'like_group': return 'bg-red-500';
            case 'comment': return 'bg-blue-500';
            case 'follow_group': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const generateText = () => {
        const firstUser = group.actors[0].username;
        const othersCount = group.count - 1;

        if (group.type === 'like_group') {
            const suffix = othersCount > 0 ? ` and ${othersCount} others` : '';
            return (
                <>
                    <span className="font-bold text-gray-900 dark:text-white">{firstUser}{suffix}</span> liked your recipe {group.resourceTitle ? <span className="italic font-medium text-gray-600 dark:text-gray-300">"{group.resourceTitle}"</span> : 'video'}.
                </>
            );
        }
        
        if (group.type === 'follow_group') {
            if (group.count === 1) return <><span className="font-bold text-gray-900 dark:text-white">{firstUser}</span> started following you.</>;
            if (group.count === 2) return <><span className="font-bold text-gray-900 dark:text-white">{firstUser} and {group.actors[1].username}</span> started following you.</>;
            return <><span className="font-bold text-gray-900 dark:text-white">{firstUser} and {othersCount} others</span> started following you.</>;
        }

        if (group.type === 'comment') {
             return <><span className="font-bold text-gray-900 dark:text-white">{firstUser}</span> commented on your recipe.</>;
        }

        return "New notification";
    };

    return (
        <div 
            onClick={onClick}
            className={`flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!group.isRead ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}
        >
            <div className="relative flex-shrink-0">
                <AvatarStack actors={group.actors} />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 ${getBgColor()}`}>
                    {getIcon()}
                </div>
            </div>
            
            <div className="flex-grow min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                    {generateText()}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {new Date(group.latestAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(group.latestAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
            </div>

            {(group.type === 'like_group' || group.type === 'comment') && group.resourceImage && (
                <img src={group.resourceImage} alt="Recipe" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 ml-2 bg-gray-200" />
            )}
        </div>
    );
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, onClose, onViewRecipe, onViewProfile }) => {
    // Use the Hook logic
    const { notifications, unreadCount, loading, markGroupRead } = useNotifications(userId);

    const handleNotificationClick = (group: GroupedNotification) => {
        markGroupRead(group);

        if (group.type === 'follow_group') {
            // View the profile of the most recent follower
            onViewProfile(group.actors[0].id);
            onClose();
        } else if (group.resourceId) {
            onViewRecipe(group.resourceId);
            onClose();
        }
    };

    return (
        <div className="absolute inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
            <div 
                className="w-full sm:w-96 bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-in-right"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto no-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map(group => (
                            <GroupedNotificationItem 
                                key={group.id} // ID of the latest notification in group serves as key
                                group={group} 
                                onClick={() => handleNotificationClick(group)} 
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 px-6">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BellIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No new notifications.</p>
                            <p className="text-xs text-gray-400 mt-2">Activity on your recipes will show up here.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default NotificationCenter;
