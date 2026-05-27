import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

type Props = {
  threadId: string;
  initialMessages: UIMessage[];
  onMessagesChange: (messages: UIMessage[]) => void;
};

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function ChatWindow({ threadId, initialMessages, onMessagesChange }: Props) {
  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages whenever they change.
  useEffect(() => {
    onMessagesChange(messages);
  }, [messages, onMessagesChange]);

  // Keep composer focused.
  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (message: { text?: string }) => {
    const text = (message.text ?? "").trim();
    if (!text || isLoading) return;
    void sendMessage({ text });
  };

  return (
    <div className="flex h-full flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent
                  className={
                    m.role === "assistant"
                      ? "bg-transparent p-0 text-foreground"
                      : "bg-primary text-primary-foreground"
                  }
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-muted prose-pre:text-foreground">
                      <ReactMarkdown>
                        {m.parts
                          .map((p) => (p.type === "text" ? p.text : ""))
                          .join("")}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {m.parts
                        .map((p) => (p.type === "text" ? p.text : ""))
                        .join("")}
                    </span>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent className="bg-transparent p-0">
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && (
            <div className="text-sm text-destructive">
              {error.message ?? "Something went wrong."}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              name="message"
              placeholder="Message ChatGPT…"
              disabled={isLoading}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-6 h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600" />
      <h1 className="text-2xl font-semibold text-foreground">
        How can I help you today?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ask anything. Powered by Lovable AI.
      </p>
    </div>
  );
}
