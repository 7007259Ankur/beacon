import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, UserPlus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeToNotifications,
  clearAllNotifications,
  Notification,
} from "@/services/notificationService";
import { toast } from "sonner";

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.uid, setNotifs);
    return () => unsub();
  }, [user]);

  const handleClear = async () => {
    if (!user) return;
    await clearAllNotifications(user.uid);
    toast.success("Notifications cleared");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart className="w-4 h-4 text-red-500 fill-current" />;
      case "follow": return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "message": return <MessageCircle className="w-4 h-4 text-primary" />;
      default: return null;
    }
  };

  const getText = (n: Notification) => {
    switch (n.type) {
      case "like": return "liked your post";
      case "follow": return "started following you";
      case "message": return "sent you a message";
      default: return "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 h-screen flex flex-col">
      <div className="px-4 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif">Notifications</h1>
        {notifs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-red-500 gap-2"
            onClick={handleClear}
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4">
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <MessageCircle className="w-10 h-10 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifs.map(n => (
              <div
                key={n.id}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 border border-transparent hover:border-slate-100"
              >
                <div className="relative shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={n.actorAvatar} />
                    <AvatarFallback>{n.actorName?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border">
                    {getIcon(n.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 leading-snug text-sm">
                    <span className="font-bold">{n.actorName}</span>{" "}
                    <span className="text-slate-600">{getText(n)}</span>
                  </p>
                  {n.createdAt?.toDate && (
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(n.createdAt.toDate())} ago
                    </span>
                  )}
                </div>

                {!n.isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
