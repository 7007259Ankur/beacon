import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDocs,
  where,
  deleteDoc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "./notificationService";

export interface Post {
  id?: string;
  authorId: string;
  author: {
    username: string;
    avatarUrl: string;
    fullName: string;
  };
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: any;
  visibility: "public" | "friends_only" | "private";
}

export const createPost = async (authorId: string, author: Post['author'], content: string, imageUrls: string[] = []) => {
  const postData: Omit<Post, 'id'> = {
    authorId,
    author,
    content,
    imageUrls,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
    visibility: "public"
  };
  return addDoc(collection(db, "posts"), postData);
};

export const subscribeToPosts = (callback: (posts: Post[]) => void) => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
    callback(posts);
  });
};

export const likePost = async (
  postId: string,
  userId: string,
  actor: { name: string; avatar: string }
) => {
  const likeRef = doc(db, "posts", postId, "likes", userId);
  const postRef = doc(db, "posts", postId);
  await setDoc(likeRef, { createdAt: serverTimestamp() });
  await updateDoc(postRef, { likesCount: increment(1) });
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    await createNotification({
      type: "like",
      targetId: postSnap.data().authorId,
      actorId: userId,
      actorName: actor.name,
      actorAvatar: actor.avatar,
      postId,
    });
  }
};

export const unlikePost = async (postId: string, userId: string) => {
  const likeRef = doc(db, "posts", postId, "likes", userId);
  const postRef = doc(db, "posts", postId);

  await deleteDoc(likeRef);
  await updateDoc(postRef, {
    likesCount: increment(-1)
  });
};

export const checkHasLiked = async (postId: string, userId: string): Promise<boolean> => {
  const likeRef = doc(db, "posts", postId, "likes", userId);
  const snap = await getDocs(query(collection(db, "posts", postId, "likes"), where("__name__", "==", userId)));
  return !snap.empty;
};
