import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";
import type { UIMessage } from "ai";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { useThreads } from "@/hooks/use-threads";

export const Route = createFileRoute("/$threadId")({
  head: () => ({
    meta: [{ title: "Chat · ChatGPT Clone" }],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = useParams({ from: "/$threadId" });
  const navigate = useNavigate();
  const { threads, hydrated, createThread, deleteThread, updateMessages } = useThreads();

  const thread = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId]
  );

  // If the requested thread doesn't exist after hydration, redirect to home.
  useEffect(() => {
    if (hydrated && !thread) {
      void navigate({ to: "/", replace: true });
    }
  }, [hydrated, thread, navigate]);

  const handleNew = useCallback(() => {
    const t = createThread();
    void navigate({ to: "/$threadId", params: { threadId: t.id } });
  }, [createThread, navigate]);

  const handleMessagesChange = useCallback(
    (messages: UIMessage[]) => {
      if (!thread) return;
      // Only persist when there's an actual change in count or last id.
      const last = thread.messages[thread.messages.length - 1]?.id;
      const newLast = messages[messages.length - 1]?.id;
      if (thread.messages.length === messages.length && last === newLast) return;
      updateMessages(thread.id, messages);
    },
    [thread, updateMessages]
  );

  if (!hydrated) {
    return <div className="h-screen bg-background" />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        threads={threads}
        activeId={threadId}
        onNew={handleNew}
        onDelete={deleteThread}
      />
      <main className="flex flex-1 flex-col">
        {thread ? (
          <ChatWindow
            key={thread.id}
            threadId={thread.id}
            initialMessages={thread.messages}
            onMessagesChange={handleMessagesChange}
          />
        ) : null}
      </main>
    </div>
  );
}
