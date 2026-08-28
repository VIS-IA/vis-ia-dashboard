import {
  TrendingUp,
  Star,
  MessageSquare,
  Users,
  ThumbsDown,
  Clock,
  Megaphone,
  Camera,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "./types";

/**
 * Supabase can only store text, not React components, so every
 * icon reference in the database is a plain string key. This maps
 * that key back to the actual lucide-react icon at render time.
 */
export const ICON_MAP: Record<IconKey, LucideIcon> = {
  "trending-up": TrendingUp,
  star: Star,
  "message-square": MessageSquare,
  users: Users,
  "thumbs-down": ThumbsDown,
  clock: Clock,
  megaphone: Megaphone,
  camera: Camera,
};
