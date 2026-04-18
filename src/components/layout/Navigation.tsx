import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  PlusSquare,
  User,
  MessageCircle,
  Menu,
  Bell,
  UserX,
  LogOut,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: PlusSquare, label: "Create", path: "/create" },
  { icon: User, label: "Profile", path: "/profile" },
];

function MoreMenu({ onClose }: { onClose: () => void }) {
  const { logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const handleDeactivate = async () => {
    if (!confirming) { setConfirming(true); return; }
    await deleteAccount();
    navigate("/");
  };

  return (
    <div className="absolute bottom-14 left-4 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-semibold text-sm">More options</span>
        <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
      </div>
      <button
        onClick={() => { logout(); onClose(); }}
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Log out
      </button>
      <button
        onClick={handleDeactivate}
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
      >
        <UserX className="w-4 h-4" />
        {confirming ? "Tap again to confirm delete" : "Deactivate account"}
      </button>
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r h-screen bg-white fixed left-0 top-0 z-40 px-4 py-8">
      <div className="mb-10 px-4">
        <Link to="/" className="text-3xl font-serif italic font-bold tracking-tight text-primary">
          Beacon
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-slate-50",
                isActive ? "font-bold text-slate-900" : "text-slate-500"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 transition-transform group-hover:scale-110",
                isActive ? "text-primary" : "text-slate-500"
              )} />
              <span className="text-lg">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 relative">
        {moreOpen && <MoreMenu onClose={() => setMoreOpen(false)} />}
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 px-0 hover:bg-transparent"
          onClick={() => setMoreOpen(v => !v)}
        >
          <Menu className="w-6 h-6" />
          <span className="text-lg">More</span>
        </Button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-50 px-2">
      {NAV_ITEMS.filter(i => ["Home", "Explore", "Create", "Notifications", "Profile"].includes(i.label)).map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <item.icon className="w-6 h-6" />
          </Link>
        );
      })}
    </nav>
  );
}
