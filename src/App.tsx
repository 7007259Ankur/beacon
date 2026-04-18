/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { Toaster } from "@/components/ui/sonner";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { Sidebar, MobileNav } from "./components/layout/Navigation";
import { AuthScreens } from "./components/auth/AuthScreens";
import { ExplorePage } from "./pages/Explore";
import { NotificationsPage } from "./pages/Notifications";
import { ProfilePage } from "./pages/Profile";
import { MessagesPage } from "./pages/Messages";
import { useAuth } from "./context/AuthContext";
import { PostCard } from "./components/feed/PostCard";
import { CreatePostModal } from "./components/feed/CreatePostModal";
import { subscribeToPosts, Post } from "./services/postService";

function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToPosts((newPosts) => {
      setPosts(newPosts);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-8 px-4">
        <CreatePostModal />
      </div>
      <div className="space-y-4 px-4 md:px-0">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post as any} />
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  // Only show landing if not logged in and haven't dismissed it
  const [showLanding, setShowLanding] = useState(true);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Already logged in — skip landing entirely
  if (user) {
    return (
      <Router>
        <div className="min-h-screen bg-slate-50 flex">
          <Sidebar />
          <MobileNav />
          <main className="flex-1 pb-16 md:pb-0 md:ml-64 lg:ml-72 bg-slate-50 min-h-screen">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </Router>
    );
  }

  if (showLanding) {
    return (
      <div className="font-sans">
        <LandingPage onEnter={() => setShowLanding(false)} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="font-sans">
      <AuthScreens onAuthSuccess={() => { }} />
      <Toaster />
    </div>
  );
}
