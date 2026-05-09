import { Bell, Check, CheckCheck, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type NotificationRow } from "@/hooks/useNotifications";

interface Props {
  audience: "user" | "admin";
  userId?: string | null;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
}

const typeColor: Record<string, string> = {
  inquiry: "bg-accent",
  booking: "bg-primary",
  application: "bg-secondary",
  user: "bg-primary",
  success: "bg-secondary",
  info: "bg-muted-foreground",
  chat: "bg-accent",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationBell({ audience, userId, align = "end", triggerClassName }: Props) {
  const navigate = useNavigate();
  const { items, unreadCount, markAsRead, markAllRead } = useNotifications({ audience, userId });

  const handleClick = (n: NotificationRow) => {
    if (!n.read) markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={triggerClassName ?? "relative h-9 w-9 text-muted-foreground"}>
          <Bell className="h-[18px] w-[18px] text-current" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-[calc(100vw-2rem)] p-0 sm:w-[360px]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-[14px] font-semibold text-foreground">Notifications</p>
            <p className="text-[11px] text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={markAllRead}>
              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[420px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <Inbox className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-[13px] font-medium text-foreground">No notifications yet</p>
              <p className="text-[11px] text-muted-foreground">
                You'll see updates here as they happen.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={`group flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${typeColor[n.type] ?? "bg-primary"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">{n.title}</p>
                      {n.body && (
                        <p className="line-clamp-2 text-[12px] text-muted-foreground">{n.body}</p>
                      )}
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="mt-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-primary/10 group-hover:flex">
                        <Check className="h-3 w-3 text-primary" />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
