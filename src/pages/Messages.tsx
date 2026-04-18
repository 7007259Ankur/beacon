import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { followUser, unfollowUser, getFollowingIds } from "@/services/followService";
import { sendMessage, subscribeToMessages, Message } from "@/services/messageService";
import { createNotification } from "@/services/notificationService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UserProfile {
    uid: string;
    username: string;
    fullName: string;
    avatarUrl: string;
}

export function MessagesPage() {
    const { user, profile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    // Load all users except self
    useEffect(() => {
        if (!user) return;
        getDocs(collection(db, "users")).then(snap => {
            const list = snap.docs
                .filter(d => d.id !== user.uid)
                .map(d => ({ uid: d.id, ...d.data() } as UserProfile));
            setUsers(list);
        });
    }, [user]);

    // Load following list
    useEffect(() => {
        if (!user) return;
        getFollowingIds(user.uid).then(ids => setFollowingIds(new Set(ids)));
    }, [user]);

    // Subscribe to messages when a chat is open
    useEffect(() => {
        if (!user || !selectedUser) return;
        const unsub = subscribeToMessages(user.uid, selectedUser.uid, setMessages);
        return () => unsub();
    }, [user, selectedUser]);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFollow = async (target: UserProfile) => {
        if (!user) return;
        const already = followingIds.has(target.uid);
        try {
            if (already) {
                await unfollowUser(user.uid, target.uid);
                setFollowingIds(prev => { const s = new Set(prev); s.delete(target.uid); return s; });
                if (selectedUser?.uid === target.uid) setSelectedUser(null);
            } else {
                await followUser(user.uid, target.uid, {
                    name: profile?.fullName || "Someone",
                    avatar: profile?.avatarUrl || "",
                });
                setFollowingIds(prev => new Set([...prev, target.uid]));
                toast.success(`Following ${target.username}`);
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    const handleSend = async () => {
        if (!text.trim() || !user || !selectedUser) return;
        const msg = text;
        setText("");
        await sendMessage(user.uid, selectedUser.uid, msg);
        await createNotification({
            type: "message",
            targetId: selectedUser.uid,
            actorId: user.uid,
            actorName: profile?.fullName || "Someone",
            actorAvatar: profile?.avatarUrl || "",
        });
    };

    return (
        <div className="flex h-screen max-h-screen overflow-hidden">
            {/* User list panel */}
            <div className={cn(
                "w-full md:w-80 border-r bg-white flex flex-col",
                selectedUser ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold font-serif">Messages</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Follow people to start chatting</p>
                </div>
                <ScrollArea className="flex-1">
                    {users.length === 0 && (
                        <p className="text-center text-slate-400 py-10 text-sm">No other users yet</p>
                    )}
                    {users.map(u => {
                        const following = followingIds.has(u.uid);
                        return (
                            <div key={u.uid} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                                <Avatar className="w-10 h-10 shrink-0">
                                    <AvatarImage src={u.avatarUrl} />
                                    <AvatarFallback>{u.fullName?.[0] ?? "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm truncate">{u.fullName}</p>
                                    <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <Button
                                        size="sm"
                                        variant={following ? "outline" : "default"}
                                        className="rounded-full text-xs h-7 px-3"
                                        onClick={() => handleFollow(u)}
                                    >
                                        {following ? "Unfollow" : "Follow"}
                                    </Button>
                                    {following && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="rounded-full text-xs h-7 px-3 text-primary"
                                            onClick={() => setSelectedUser(u)}
                                        >
                                            Chat
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </ScrollArea>
            </div>

            {/* Chat panel */}
            <div className={cn(
                "flex-1 flex flex-col bg-slate-50",
                selectedUser ? "flex" : "hidden md:flex"
            )}>
                {!selectedUser ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                        Select a conversation to start messaging
                    </div>
                ) : (
                    <>
                        {/* Chat header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUser(null)}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <Avatar className="w-9 h-9">
                                <AvatarImage src={selectedUser.avatarUrl} />
                                <AvatarFallback>{selectedUser.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{selectedUser.fullName}</p>
                                <p className="text-xs text-slate-400">@{selectedUser.username}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 px-4 py-4">
                            <div className="space-y-2">
                                {messages.length === 0 && (
                                    <p className="text-center text-slate-400 text-sm py-10">
                                        Say hi to {selectedUser.fullName}!
                                    </p>
                                )}
                                {messages.map(msg => {
                                    const isMine = msg.senderId === user?.uid;
                                    return (
                                        <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[70%] px-4 py-2 rounded-2xl text-sm",
                                                isMine
                                                    ? "bg-primary text-white rounded-br-sm"
                                                    : "bg-white text-slate-900 border rounded-bl-sm"
                                            )}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="px-4 py-3 bg-white border-t flex gap-2">
                            <Input
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSend()}
                                placeholder="Type a message..."
                                className="rounded-full"
                            />
                            <Button size="icon" className="rounded-full shrink-0" onClick={handleSend} disabled={!text.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
