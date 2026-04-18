import {
    collection, addDoc, serverTimestamp, query,
    where, orderBy, onSnapshot, writeBatch, getDocs, doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NotifType = "like" | "follow" | "message";

export interface Notification {
    id: string;
    type: NotifType;
    targetId: string;   // who receives it
    actorId: string;    // who triggered it
    actorName: string;
    actorAvatar: string;
    postId?: string;
    isRead: boolean;
    createdAt: any;
}

export const createNotification = async (
    notif: Omit<Notification, "id" | "isRead" | "createdAt">
) => {
    // Don't notify yourself
    if (notif.actorId === notif.targetId) return;
    await addDoc(collection(db, "notifications"), {
        ...notif,
        isRead: false,
        createdAt: serverTimestamp(),
    });
};

export const subscribeToNotifications = (
    userId: string,
    callback: (notifs: Notification[]) => void
) => {
    const q = query(
        collection(db, "notifications"),
        where("targetId", "==", userId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });
};

export const clearAllNotifications = async (userId: string) => {
    const q = query(collection(db, "notifications"), where("targetId", "==", userId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
};
