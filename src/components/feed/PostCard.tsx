import { useMemo, useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Share2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { likePost, unlikePost } from "@/services/postService";

export interface PostProps {
  id: string;
  author: {
    username: string;
    avatarUrl: string;
    fullName: string;
  };
  content: string;
  imageUrls?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  hasLiked?: boolean;
}

export function PostCard({ post }: { post: PostProps }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.hasLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = async () => {
    if (!user) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(c => newLiked ? c + 1 : c - 1);
    try {
      if (newLiked) await likePost(post.id, user.uid, {
        name: user.displayName || "Someone",
        avatar: user.photoURL || "",
      });
      else await unlikePost(post.id, user.uid);
    } catch {
      // revert on failure
      setLiked(!newLiked);
      setLikesCount(c => newLiked ? c - 1 : c + 1);
    }
  };

  const timeAgo = useMemo(() => {
    if (!post.createdAt) return "just now";
    const date = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }, [post.createdAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-xl mx-auto mb-8"
    >
      <Card className="border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-slate-100 p-0.5">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
              <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 leading-tight">
                {post.author.username}
              </span>
              <span className="text-xs text-slate-500">
                {post.author.fullName} • {timeAgo}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-500">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="aspect-square bg-slate-100 overflow-hidden">
              <img
                src={post.imageUrls[0]}
                alt="Post content"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div className="p-4 space-y-2">
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </CardContent>

        <Separator className="bg-slate-100" />

        <CardFooter className="p-3 flex flex-col items-start gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleLike} className={liked ? "text-red-500 hover:text-red-600" : "text-slate-700"}>
                <Heart className={liked ? "w-6 h-6 fill-current" : "w-6 h-6"} />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-700">
                <MessageCircle className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-700">
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-700">
              <Bookmark className="w-6 h-6" />
            </Button>
          </div>

          <div className="px-1 space-y-1">
            <span className="text-sm font-bold text-slate-900">
              {likesCount.toLocaleString()} likes
            </span>
            <button className="block text-sm text-slate-500 hover:text-slate-600 transition-colors">
              View all {post.commentsCount} comments
            </button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
