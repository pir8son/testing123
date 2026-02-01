
import React, { useState, useEffect, useRef } from 'react';
import { Recipe, Comment, UserProfile } from '../types';
import { interactionService } from '../services/interactionService';
import { XIcon } from './icons/XIcon';
import { SendIcon } from './icons/SendIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface CommentSheetProps {
  recipe: Recipe;
  onClose: () => void;
  currentUser: UserProfile | null;
  onViewProfile: (userId: string) => void;
}

const CommentSheet: React.FC<CommentSheetProps> = ({ recipe, onClose, currentUser, onViewProfile }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const loadComments = async () => {
          setIsLoading(true);
          const data = await interactionService.getComments(recipe.id);
          setComments(data);
          setIsLoading(false);
      }
      loadComments();
  }, [recipe.id]);

  const handleSend = async () => {
      if (!newCommentText.trim() || isSubmitting) return;
      if (!currentUser) {
          alert("Please log in to comment.");
          return;
      }
      
      setIsSubmitting(true);
      try {
          // @ts-ignore - Assuming interactionService accepts creatorId/title for notification support
          const addedComment = await interactionService.addComment(
              recipe.id,
              currentUser,
              newCommentText,
              recipe.creatorId, // Pass target ID for notifications
              recipe.title      // Pass resource title for context
          );
          
          setComments(prev => [addedComment, ...prev]);
          setNewCommentText('');
          
          // Scroll to top/latest
          if (commentsEndRef.current) {
              commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }

      } catch (error) {
          console.error("Failed to post comment", error);
          alert("Failed to post comment");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleProfileClick = (userId: string) => {
      onViewProfile(userId);
      onClose(); // Close comments to view profile
  };

  return (
     <div className="absolute inset-0 bg-black/30 z-50 flex justify-end flex-col" onClick={onClose}>
      <div 
        className="h-[75%] w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl flex flex-col animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle for dragging (Visual only) */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-2 mb-1 flex-shrink-0"></div>
        
        {/* Header */}
        <header className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-800 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white text-center flex-grow pl-8">
                {comments.length > 0 ? `${comments.length} Comments` : 'Comments'}
            </h2>
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
        </header>

        {/* Scrollable List */}
        <div className="flex-grow overflow-y-auto px-4 space-y-4 pt-4 pb-4 no-scrollbar">
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : comments.length > 0 ? (
                comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                        <div onClick={() => handleProfileClick(comment.userId)} className="cursor-pointer flex-shrink-0">
                            {comment.avatarUrl ? (
                                <img src={comment.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt={comment.username} />
                            ) : (
                                <UserCircleIcon className="w-8 h-8 text-gray-400 mt-1" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <p 
                                    className="text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer hover:underline"
                                    onClick={() => handleProfileClick(comment.userId)}
                                >
                                    @{comment.username}
                                </p>
                                <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200">{comment.text}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <p>No comments yet. Be the first!</p>
                </div>
            )}
            <div ref={commentsEndRef} />
        </div>

        {/* Input Footer - Pinned to bottom */}
        <footer className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 z-20 w-full">
            <div className="relative">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={currentUser ? `Add a comment as @${currentUser.username}...` : "Log in to comment"}
                className="w-full py-3 pl-4 pr-12 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-transparent focus:border-violet-500 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                disabled={isSubmitting || !currentUser}
              />
              <button
                onClick={handleSend}
                disabled={!newCommentText.trim() || isSubmitting}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 bg-violet-600 text-white rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors"
              >
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SendIcon className="w-5 h-5" />}
              </button>
            </div>
        </footer>
         <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .animate-slide-up {
                animation: slide-up 0.3s ease-out;
            }
        `}</style>
      </div>
    </div>
  );
};

export default CommentSheet;
