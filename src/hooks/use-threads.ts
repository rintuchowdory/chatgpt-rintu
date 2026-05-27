import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";
import {
  deriveTitle,
  loadThreads,
  newThread,
  saveThreads,
  type Thread,
} from "@/lib/threads";

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThreads(loadThreads());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Thread[]) => {
    setThreads(next);
    saveThreads(next);
  }, []);

  const createThread = useCallback((): Thread => {
    const t = newThread();
    persist([t, ...threads]);
    return t;
  }, [threads, persist]);

  const deleteThread = useCallback(
    (id: string) => {
      persist(threads.filter((t) => t.id !== id));
    },
    [threads, persist]
  );

  const updateMessages = useCallback(
    (id: string, messages: UIMessage[]) => {
      const existing = threads.find((t) => t.id === id);
      if (!existing) return;
      // Skip when nothing changed (avoid render loops).
      if (existing.messages.length === messages.length && messages.length === 0) return;
      const updated: Thread = {
        ...existing,
        messages,
        title:
          existing.title === "New chat" || existing.title === ""
            ? deriveTitle(messages)
            : existing.title,
        updatedAt: Date.now(),
      };
      const next = [updated, ...threads.filter((t) => t.id !== id)];
      persist(next);
    },
    [threads, persist]
  );

  return { threads, hydrated, createThread, deleteThread, updateMessages };
}
