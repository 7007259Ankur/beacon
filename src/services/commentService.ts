import {
    collection, addDoc, serverTimestamp, query,
    orderBy, onSnapshot, doc, updateDoc, increment
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    createdAt: any;
    parentId?: string | null; // for replies
}

export const addComment = async (
    postId: string,
    author: { id: string; name: string; avatar: string },
    text: string,
    parentId: string | null = null
) => {
    await addDoc(collection(db, "posts", postId, "comments"), {
        postId,
        authorId: author.id,
        authorName: author.name,
        authorAvatar: author.avatar,
        text,
        parentId: parentId ?? null,
        createdAt: serverTimestamp(),
    });
    // only increment count for top-level comments
    if (!parentId) {
        await updateDoc(doc(db, "posts", postId), { commentsCount: increment(1) });
    }
};

export const subscribeToComments = (
    postId: string,
    callback: (comments: Comment[]) => void
) => {
    const q = query(
        collection(db, "posts", postId, "comments"),
        orderBy("createdAt", "asc")
    );
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    });
};
