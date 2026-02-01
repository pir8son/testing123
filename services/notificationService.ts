
import { db } from './firebaseConfig';
// @ts-ignore
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { AppNotification } from '../types';

export const notificationService = {
  
  /**
   * Fetch notifications for a user.
   */
  getNotifications: async (userId: string, limitCount: number = 20): Promise<AppNotification[]> => {
    try {
      const notifsRef = collection(db, 'notifications');
      const q = query(
        notifsRef,
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as AppNotification[];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  /**
   * Mark a notification as read.
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { isRead: true });
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  },

  /**
   * Create a notification (Used by interaction service)
   */
  createNotification: async (notification: Omit<AppNotification, 'id'>): Promise<void> => {
    try {
        const notifsRef = collection(db, 'notifications');
        await addDoc(notifsRef, notification);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
  },

  /**
   * MOCK SEED: Since we don't have a backend trigger for this yet, 
   * this function simulates receiving notifications for the demo.
   */
  seedMockNotifications: async (userId: string) => {
      const mocks: Omit<AppNotification, 'id'>[] = [
          {
              recipientId: userId,
              senderId: 'mock_user_1',
              senderUsername: 'chef_julia',
              senderAvatarUrl: 'https://i.pravatar.cc/150?u=chef_julia',
              type: 'like',
              message: 'liked your recipe "Spicy Pasta".',
              resourceId: '3',
              resourceImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
              isRead: false,
              createdAt: new Date().toISOString()
          },
          {
              recipientId: userId,
              senderId: 'mock_user_2',
              senderUsername: 'foodie_mark',
              senderAvatarUrl: 'https://i.pravatar.cc/150?u=foodie_mark',
              type: 'follow',
              message: 'started following you.',
              isRead: false,
              createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
              recipientId: userId,
              senderId: 'mock_user_3',
              senderUsername: 'vegan_vibes',
              senderAvatarUrl: 'https://i.pravatar.cc/150?u=vegan_vibes',
              type: 'comment',
              message: 'commented: "Can I swap sugar for honey?"',
              resourceId: '1',
              resourceImage: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
              isRead: true,
              createdAt: new Date(Date.now() - 86400000).toISOString()
          }
      ];
      
      // In a real app, this is done by Cloud Functions.
      // We perform a client-side check to avoid infinite seeding in this demo
      const existing = await notificationService.getNotifications(userId, 1);
      if (existing.length === 0) {
          for(const n of mocks) {
              await notificationService.createNotification(n);
          }
      }
  }
};
