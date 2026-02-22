import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStream } from "./hooks/useChatStream";

export default function App() {
  const { messages, sendMessage, loading } = useChatStream(
    "https://fuzzy-space-spoon-xrg4pq7gq7jhvjv-8000.app.github.dev/api/chat"
  );

  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b p-4 text-xl font-semibold">
        AI Chatbot
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <Card
              key={index}
              className={`p-4 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : ""
              }`}
            >
              {msg.content}
            </Card>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4 flex gap-2 max-w-3xl mx-auto w-full">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          rows={2}
        />
        <Button onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
}