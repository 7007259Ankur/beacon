import {
    doc, setDoc, deleteDoc, getDoc, serverTimestamp,
    collection, query, where, getDocs, updateDoc, increment
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "./notificationService";

export const followUser = async (
    followerId: string,
    targetId: string,
    actor: { name: string; avatar: string }
) => {
    await setDoc(doc(db, "follows", `${followerId}_${targetId}`), {
        followerId,
        targetId,
        createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "users", followerId), { followingCount: increment(1) });
    await updateDoc(doc(db, "users", targetId), { followersCount: increment(1) });
    await createNotification({
        type: "follow",
        targetId,
        actorId: followerId,
        actorName: actor.name,
        actorAvatar: actor.avatar,
    });
};

export const unfollowUser = async (followerId: string, targetId: string) => {
    await deleteDoc(doc(db, "follows", `${followerId}_${targetId}`));
    await updateDoc(doc(db, "users", followerId), { followingCount: increment(-1) });
    await updateDoc(doc(db, "users", targetId), { followersCount: increment(-1) });
};

export const isFollowing = async (followerId: string, targetId: string): Promise<boolean> => {
    const snap = await getDoc(doc(db, "follows", `${followerId}_${targetId}`));
    return snap.exists();
};

export const getFollowingIds = async (userId: string): Promise<string[]> => {
    const q = query(collection(db, "follows"), where("followerId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().targetId);
};
