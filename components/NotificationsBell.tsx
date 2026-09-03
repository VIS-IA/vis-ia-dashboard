"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function NotificationsBell() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoaded(true);
        return;
      }

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!client) {
        setLoaded(true);
        return;
      }

      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, created_at, read")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setNotifications(data ?? []);
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  function timeAgo(dateStr: string) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    return `Hace ${days} días`;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
      >
        <Bell size={16} className="text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">Notificaciones</p>
          </div>
          {!loaded ? (
            <p className="text-sm text-slate-400 px-4 py-6 text-center">Cargando…</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-slate-400 px-4 py-6 text-center">
              No tienes notificaciones todavía
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 ${
                  !n.read ? "bg-blue-50/40" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
