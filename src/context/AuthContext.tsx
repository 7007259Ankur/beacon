import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut, deleteUser } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  profile: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const profileUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // Clean up previous profile listener
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }

      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const newProfile = {
            username: user.email?.split("@")[0] || `user_${user.uid.slice(0, 5)}`,
            fullName: user.displayName || "Beacon User",
            avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            email: user.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isPrivate: false,
            bio: "Welcome to my Beacon profile!",
            followersCount: 0,
            followingCount: 0,
          };
          await setDoc(userRef, newProfile);
        }

        // Real-time listener so follower/following counts update live
        profileUnsubRef.current = onSnapshot(userRef, (snap) => {
          if (snap.exists()) setProfile(snap.data());
        });
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsubRef.current) profileUnsubRef.current();
    };
  }, []);

  const signIn = async () => {
    try {
      // prompt: 'select_account' forces picker; use 'none' to auto-sign if session exists
      googleProvider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      // If no cached session, fall back to account picker
      if (error?.code === "auth/popup-closed-by-user") return;
      console.error("Auth Error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    const uid = user.uid;
    try {
      // Delete user's posts
      const postsSnap = await getDocs(query(collection(db, "posts"), where("authorId", "==", uid)));
      await Promise.all(postsSnap.docs.map(d => deleteDoc(d.ref)));

      // Delete follow relationships
      const followingSnap = await getDocs(query(collection(db, "follows"), where("followerId", "==", uid)));
      const followersSnap = await getDocs(query(collection(db, "follows"), where("targetId", "==", uid)));
      await Promise.all([...followingSnap.docs, ...followersSnap.docs].map(d => deleteDoc(d.ref)));

      // Delete user profile doc
      await deleteDoc(doc(db, "users", uid));

      // Delete Firebase Auth account
      await deleteUser(user);
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout, deleteAccount, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
