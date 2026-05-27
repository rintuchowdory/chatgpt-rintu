import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useThreads } from "@/hooks/use-threads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChatGPT Clone" },
      { name: "description", content: "Chat with AI — powered by Lovable AI." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { threads, hydrated, createThread, deleteThread } = useThreads();

  useEffect(() => {
    if (!hydrated) return;
    if (threads.length > 0) {
      void navigate({ to: "/$threadId", params: { threadId: threads[0].id }, replace: true });
    }
  }, [hydrated, threads, navigate]);

  const handleNew = () => {
    const t = createThread();
    void navigate({ to: "/$threadId", params: { threadId: t.id } });
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar threads={threads} onNew={handleNew} onDelete={deleteThread} />
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">ChatGPT Clone</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a new chat from the sidebar.
          </p>
          <button
            onClick={handleNew}
            className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New chat
          </button>
        </div>
      </main>
    </div>
  );
}
