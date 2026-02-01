
import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
// @ts-ignore
import { collection, query, orderBy, limit, onSnapshot, where, doc, writeBatch } from 'firebase/firestore';
import { AppNotification } from '../types';

export interface GroupedNotification {
    id: string; // ID of the most recent notification in the group
    type: 'like_group' | 'follow_group' | 'comment' | 'system';
    actors: { id: string; username: string; avatarUrl: string }[];
    count: number;
    resourceId?: string;
    resourceImage?: string;
    resourceTitle?: string;
    latestAt: string;
    isRead: boolean;
    rawIds: string[]; // All notification IDs in this group (for bulk read marking)
}

export const useNotifications = (userId: string | null) => {
    const [notifications, setNotifications] = useState<GroupedNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        // Listen to subcollection users/{userId}/notifications
        const q = query(
            collection(db, 'users', userId, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(50) // Reasonable limit for performance
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rawNotifications: AppNotification[] = [];
            let unread = 0;

            snapshot.forEach((doc: any) => {
                const data = doc.data() as AppNotification;
                rawNotifications.push({ ...data, id: doc.id });
                if (!data.isRead) unread++;
            });

            const grouped = groupNotifications(rawNotifications);
            setNotifications(grouped);
            setUnreadCount(unread);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const markGroupRead = async (group: GroupedNotification) => {
        if (group.isRead || !userId) return;

        // Optimistic Update
        setNotifications(prev => prev.map(n => 
            n.id === group.id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - group.rawIds.length));

        // Batch Update in Firestore
        try {
            const batch = writeBatch(db);
            group.rawIds.forEach(notifId => {
                const ref = doc(db, 'users', userId, 'notifications', notifId);
                batch.update(ref, { isRead: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    };

    return { notifications, unreadCount, loading, markGroupRead };
};

/**
 * Aggregation Algorithm
 * 1. Groups LIKES on the same Recipe.
 * 2. Groups FOLLOWS if they appear sequentially (to reduce clutter).
 * 3. Leaves COMMENTS and SYSTEM messages as individual items.
 */
function groupNotifications(raw: AppNotification[]): GroupedNotification[] {
    const grouped: GroupedNotification[] = [];

    if (raw.length === 0) return [];

    // Helper to create an actor object
    const toActor = (n: AppNotification) => ({
        id: n.senderId,
        username: n.senderUsername,
        avatarUrl: n.senderAvatarUrl
    });

    raw.forEach((curr) => {
        const lastGroup = grouped[grouped.length - 1];

        // GROUPING LIKES
        if (curr.type === 'like' && lastGroup && lastGroup.type === 'like_group' && lastGroup.resourceId === curr.resourceId) {
            // Check if actor already in list (prevent duplicates if user liked/unliked spam)
            if (!lastGroup.actors.some(a => a.id === curr.senderId)) {
                lastGroup.actors.push(toActor(curr));
                lastGroup.count++;
            }
            lastGroup.rawIds.push(curr.id);
            if (!curr.isRead) lastGroup.isRead = false; // If any in group is unread, group is unread
            return;
        }

        // GROUPING FOLLOWS
        // We group follows if they are adjacent in the list to keep "New Followers" clean
        if (curr.type === 'follow' && lastGroup && lastGroup.type === 'follow_group') {
             if (!lastGroup.actors.some(a => a.id === curr.senderId)) {
                lastGroup.actors.push(toActor(curr));
                lastGroup.count++;
            }
            lastGroup.rawIds.push(curr.id);
            if (!curr.isRead) lastGroup.isRead = false;
            return;
        }

        // NEW GROUP CREATION
        let type: GroupedNotification['type'] = 'system';
        if (curr.type === 'like') type = 'like_group';
        else if (curr.type === 'follow') type = 'follow_group';
        else if (curr.type === 'comment') type = 'comment';

        grouped.push({
            id: curr.id,
            type,
            actors: [toActor(curr)],
            count: 1,
            resourceId: curr.resourceId,
            resourceImage: curr.resourceImage,
            resourceTitle: curr.resourceTitle, // Passed from service now
            latestAt: curr.createdAt,
            isRead: curr.isRead,
            rawIds: [curr.id]
        });
    });

    return grouped;
}
