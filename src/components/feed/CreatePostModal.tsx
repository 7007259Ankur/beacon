import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, X, Smile, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/services/postService";
import { uploadImage } from "@/lib/firebase";

export function CreatePostModal() {
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImagePick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files || []);
      files.forEach(file => {
        setImageFiles(prev => [...prev, file]);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) setImagePreviews(prev => [...prev, e.target!.result as string]);
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  const removeImage = (i: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleCreate = async () => {
    if (!content.trim() || !user || !profile) return;
    setIsSubmitting(true);
    try {
      // Upload all images to Firebase Storage first
      const uploadedUrls = await Promise.all(
        imageFiles.map(file => uploadImage(file, "posts"))
      );
      await createPost(user.uid, {
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        fullName: profile.fullName
      }, content, uploadedUrls);
      toast.success("Post created successfully!");
      setContent("");
      setImageFiles([]);
      setImagePreviews([]);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="flex items-center w-full gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left text-slate-400">Share something with the community...</div>
            <div className="text-primary">
              <Image className="w-5 h-5" />
            </div>
          </button>
        }
      />
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 border-bottom">
          <DialogTitle className="text-center text-lg font-bold">Create new post</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-slate-900">current_user</span>
          </div>

          <Textarea
            placeholder="What's on your mind?"
            className="min-h-[150px] border-none focus-visible:ring-0 text-lg resize-none p-0"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <AnimatePresence>
            {imagePreviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-2 gap-2 mt-4"
              >
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={src} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500"
                onClick={handleImagePick}
              >
                <Image className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-500">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-500">
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
            <Button
              disabled={!content.trim() || isSubmitting}
              onClick={handleCreate}
              className="px-8 rounded-full"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
