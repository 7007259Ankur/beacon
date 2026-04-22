import { useMemo, useState, useEffect } from "react";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Share2, Send, X, Link2, CornerDownRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { likePost, unlikePost } from "@/services/postService";
import { addComment, subscribeToComments, Comment } from "@/services/commentService";
import { toast } from "sonner";

export interface PostProps {
  id: string;
  author: { username: string; avatarUrl: string; fullName: string };
  content: string;
  imageUrls?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  hasLiked?: boolean;
}

function ShareSheet({ postId, onClose }: { postId: string; onClose: () => void }) {
  const postUrl = `${window.location.origin}/post/${postId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(postUrl);
    toast.success("Link copied!");
    onClose();
  };

  const shares = [
    {
      label: "WhatsApp",
      color: "bg-green-500",
      icon: "💬",
      url: `https://wa.me/?text=${encodeURIComponent(postUrl)}`,
    },
    {
      label: "Telegram",
      color: "bg-sky-500",
      icon: "✈️",
      url: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}`,
    },
    {
      label: "Instagram",
      color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
      icon: "📸",
      url: null, // Instagram doesn't support direct share URLs — copy instead
      action: () => { navigator.clipboard.writeText(postUrl); toast.success("Link copied — paste it on Instagram!"); onClose(); },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-md bg-white rounded-t-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">Share post</span>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="flex gap-4 justify-around py-2">
          {shares.map(s => (
            <button
              key={s.label}
              onClick={() => {
                if (s.action) { s.action(); return; }
                window.open(s.url!, "_blank");
                onClose();
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-2xl shadow-md`}>
                {s.icon}
              </div>
              <span className="text-xs text-slate-600">{s.label}</span>
            </button>
          ))}
          <button onClick={copyLink} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shadow-md">
              <Link2 className="w-6 h-6 text-slate-600" />
            </div>
            <span className="text-xs text-slate-600">Copy link</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CommentItem({
  comment, allComments, postId, onReply
}: {
  comment: Comment;
  allComments: Comment[];
  postId: string;
  onReply: (id: string, name: string) => void;
}) {
  const replies = allComments.filter(c => c.parentId === comment.id);
  const timeAgo = useMemo(() => {
    if (!comment.createdAt?.toDate) return "";
    const diff = Math.floor((Date.now() - comment.createdAt.toDate().getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }, [comment.createdAt]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-start">
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarImage src={comment.authorAvatar} />
          <AvatarFallback>{comment.authorName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-slate-900">{comment.authorName}</span>
            <span className="text-xs text-slate-400">{timeAgo}</span>
          </div>
          <p className="text-sm text-slate-700 mt-0.5">{comment.text}</p>
        </div>
      </div>
      <button
        onClick={() => onReply(comment.id, comment.authorName)}
        className="ml-9 flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors"
      >
        <CornerDownRight className="w-3 h-3" /> Reply
      </button>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="ml-9 space-y-2">
          {replies.map(r => (
            <div key={r.id} className="flex gap-2 items-start">
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarImage src={r.authorAvatar} />
                <AvatarFallback>{r.authorName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-900">{r.authorName}</span>
                </div>
                <p className="text-sm text-slate-700 mt-0.5">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PostCard({ post }: { post: PostProps }) {
  const { user, profile } = useAuth();
  const [liked, setLiked] = useState(post.hasLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!showComments) return;
    const unsub = subscribeToComments(post.id, setComments);
    return () => unsub();
  }, [showComments, post.id]);

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
      setLiked(!newLiked);
      setLikesCount(c => newLiked ? c - 1 : c + 1);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user || !profile) return;
    setSubmitting(true);
    try {
      await addComment(
        post.id,
        { id: user.uid, name: profile.fullName, avatar: profile.avatarUrl },
        replyTo ? `@${replyTo.name} ${commentText}` : commentText,
        replyTo?.id ?? null
      );
      setCommentText("");
      setReplyTo(null);
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const topLevelComments = comments.filter(c => !c.parentId);

  const timeAgo = useMemo(() => {
    if (!post.createdAt) return "just now";
    const date = (post.createdAt as any)?.toDate ? (post.createdAt as any).toDate() : new Date(post.createdAt);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }, [post.createdAt]);

  return (
    <>
      <AnimatePresence>
        {showShare && <ShareSheet postId={post.id} onClose={() => setShowShare(false)} />}
      </AnimatePresence>

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
                <AvatarImage src={post.author.avatarUrl} />
                <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 leading-tight">{post.author.username}</span>
                <span className="text-xs text-slate-500">{post.author.fullName} • {timeAgo}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-500">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="aspect-square bg-slate-100 overflow-hidden">
                <img src={post.imageUrls[0]} alt="Post" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="p-4">
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>
          </CardContent>

          <Separator className="bg-slate-100" />

          <CardFooter className="p-3 flex flex-col items-start gap-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleLike} className={liked ? "text-red-500 hover:text-red-600" : "text-slate-700"}>
                  <Heart className={liked ? "w-6 h-6 fill-current" : "w-6 h-6"} />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-700" onClick={() => setShowComments(v => !v)}>
                  <MessageCircle className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-700" onClick={() => setShowShare(true)}>
                  <Share2 className="w-6 h-6" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-700">
                <Bookmark className="w-6 h-6" />
              </Button>
            </div>

            <div className="px-1 space-y-0.5">
              <span className="text-sm font-bold text-slate-900">{likesCount.toLocaleString()} likes</span>
              <button
                onClick={() => setShowComments(v => !v)}
                className="block text-sm text-slate-500 hover:text-slate-600 transition-colors"
              >
                {showComments ? "Hide comments" : `View all ${post.commentsCount} comments`}
              </button>
            </div>

            {/* Comments section */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full space-y-3 overflow-hidden"
                >
                  <Separator className="bg-slate-100" />

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {topLevelComments.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">No comments yet. Be first!</p>
                    )}
                    {topLevelComments.map(c => (
                      <CommentItem
                        key={c.id}
                        comment={c}
                        allComments={comments}
                        postId={post.id}
                        onReply={(id, name) => { setReplyTo({ id, name }); }}
                      />
                    ))}
                  </div>

                  {/* Reply indicator */}
                  {replyTo && (
                    <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-1.5 rounded-lg">
                      <CornerDownRight className="w-3 h-3" />
                      Replying to {replyTo.name}
                      <button onClick={() => setReplyTo(null)} className="ml-auto text-slate-400 hover:text-slate-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Comment input */}
                  <div className="flex gap-2 items-center">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarImage src={profile?.avatarUrl} />
                      <AvatarFallback>{profile?.fullName?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                    <Input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleComment()}
                      placeholder={replyTo ? `Reply to ${replyTo.name}...` : "Add a comment..."}
                      className="rounded-full text-sm h-8 flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary shrink-0 h-8 w-8"
                      disabled={!commentText.trim() || submitting}
                      onClick={handleComment}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
}
