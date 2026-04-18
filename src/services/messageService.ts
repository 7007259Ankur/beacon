import {
    collection, addDoc, query, orderBy, onSnapshot,
    serverTimestamp, doc, setDoc, getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Message {
    id?: string;
    senderId: string;
    text: string;
    createdAt: any;
}

// Conversation ID is always sorted so both users get the same doc
export const getConversationId = (uid1: string, uid2: string) =>
    [uid1, uid2].sort().join("_");

export const sendMessage = async (senderId: string, receiverId: string, text: string) => {
    const convId = getConversationId(senderId, receiverId);
    // Ensure conversation doc exists
    await setDoc(doc(db, "conversations", convId), {
        participants: [senderId, receiverId],
        lastMessage: text,
        updatedAt: serverTimestamp(),
    }, { merge: true });

    await addDoc(collection(db, "conversations", convId, "messages"), {
        senderId,
        text,
        createdAt: serverTimestamp(),
    });
};

export const subscribeToMessages = (
    uid1: string,
    uid2: string,
    callback: (msgs: Message[]) => void
) => {
    const convId = getConversationId(uid1, uid2);
    const q = query(
        collection(db, "conversations", convId, "messages"),
        orderBy("createdAt", "asc")
    );
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });
};
