import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Thread } from "@/lib/threads";

type Props = {
  threads: Thread[];
  activeId?: string;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function Sidebar({ threads, activeId, onNew, onDelete }: Props) {
  const navigate = useNavigate();

  const handleNew = () => {
    onNew();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
    if (id === activeId) {
      void navigate({ to: "/" });
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="p-3">
        <button
          onClick={handleNew}
          className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-sm font-medium hover:bg-sidebar-accent"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Chats
        </p>
        {threads.length === 0 ? (
          <p className="px-2 py-4 text-xs text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {threads.map((t) => (
              <li key={t.id}>
                <div
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    t.id === activeId
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60"
                  )}
                >
                  <Link
                    to="/$threadId"
                    params={{ threadId: t.id }}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{t.title}</span>
                  </Link>
                  <button
                    aria-label="Delete chat"
                    onClick={(e) => handleDelete(e, t.id)}
                    className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-sidebar-border p-3 text-xs text-muted-foreground">
        Local history · this browser
      </div>
    </aside>
  );
}
