import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, Bookmark, Tag, MapPin, Link as LinkIcon, Calendar, LogOut } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, uploadImage } from "@/lib/firebase";
import { Post } from "@/services/postService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, profile, logout } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const openEdit = () => {
    setEditBio(profile?.bio || "");
    setEditFullName(profile?.fullName || "");
    setEditAvatarUrl(profile?.avatarUrl || "");
    setEditOpen(true);
  };

  const handleAvatarPick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !user) return;
      setUploadingAvatar(true);
      try {
        const url = await uploadImage(file, "avatars");
        setEditAvatarUrl(url);
        toast.success("Photo uploaded!");
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Failed to upload photo — check Cloudinary env vars");
      } finally {
        setUploadingAvatar(false);
      }
    };
    input.click();
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        bio: editBio,
        fullName: editFullName,
        avatarUrl: editAvatarUrl,
      });
      toast.success("Profile updated!");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "posts"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setUserPosts(posts);
    });
    return () => unsubscribe();
  }, [user]);

  if (!profile) return null;

  const displayUser = {
    username: profile.username || "user",
    fullName: profile.fullName || "Beacon User",
    bio: profile.bio || "No bio yet.",
    avatarUrl: profile.avatarUrl || `https://picsum.photos/seed/${user?.uid}/200/200`,
    coverUrl: profile.coverUrl || `https://picsum.photos/seed/cover_${user?.uid}/1200/400`,
    location: profile.location || "Earth",
    website: profile.website || "",
    joinedDate: profile.createdAt?.toDate?.() ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(profile.createdAt.toDate()) : "Recently",
    followers: profile.followersCount || 0,
    following: profile.followingCount || 0,
    postsCount: userPosts.length
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 bg-slate-200 relative">
        <img src={displayUser.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      <div className="px-4">
        <div className="relative flex justify-between items-end -mt-12 md:-mt-16 mb-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-sm">
            <AvatarImage src={displayUser.avatarUrl} />
            <AvatarFallback>{displayUser.fullName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2 mb-2">
            <Button variant="outline" className="rounded-full" onClick={openEdit}>Edit Profile</Button>
            <Button variant="outline" size="icon" className="rounded-full text-red-500 hover:text-red-600" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{displayUser.fullName}</h1>
            <p className="text-slate-500">@{displayUser.username}</p>
          </div>

          <p className="text-slate-800 max-w-lg leading-relaxed">{displayUser.bio}</p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {displayUser.location}</span>
            {displayUser.website && (
              <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4" /> <a href={`https://${displayUser.website}`} target="_blank" className="text-primary hover:underline">{displayUser.website}</a></span>
            )}
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {displayUser.joinedDate}</span>
          </div>

          <div className="flex gap-6 pt-2">
            <div className="flex gap-1.5 items-center">
              <span className="font-bold text-slate-900">{displayUser.postsCount}</span>
              <span className="text-slate-500 text-sm">Posts</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="font-bold text-slate-900">{displayUser.followers.toLocaleString()}</span>
              <span className="text-slate-500 text-sm">Followers</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="font-bold text-slate-900">{displayUser.following.toLocaleString()}</span>
              <span className="text-slate-500 text-sm">Following</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="posts" className="mt-8">
        <TabsList className="w-full justify-start rounded-none bg-transparent border-b px-4 h-12 gap-8">
          <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none h-full px-0">
            <Grid className="w-4 h-4 mr-2" /> Posts
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none h-full px-0">
            <Bookmark className="w-4 h-4 mr-2" /> Saved
          </TabsTrigger>
          <TabsTrigger value="tagged" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none h-full px-0">
            <Tag className="w-4 h-4 mr-2" /> Tagged
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="pt-6 px-0 md:px-4">
          <div className="grid grid-cols-1 gap-4">
            {userPosts.map(post => (
              <PostCard key={post.id} post={post as any} />
            ))}
            {userPosts.length === 0 && (
              <div className="py-20 text-center text-slate-400">
                You haven't posted anything yet.
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="saved" className="py-20 text-center text-slate-400">
          No saved posts yet.
        </TabsContent>
        <TabsContent value="tagged" className="py-20 text-center text-slate-400">
          No tagged posts yet.
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="w-20 h-20 cursor-pointer" onClick={handleAvatarPick}>
                  <AvatarImage src={editAvatarUrl} />
                  <AvatarFallback>{editFullName[0]}</AvatarFallback>
                </Avatar>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleAvatarPick} disabled={uploadingAvatar}>
                {uploadingAvatar ? "Uploading..." : "Change Photo"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editFullName} onChange={e => setEditFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} />
            </div>
            <Button className="w-full" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
