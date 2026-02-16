import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";

export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: "http://localhost:8000/api/chat",
  });

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-6">
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm ${
              m.role === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-200 text-black"
            }`}
          >
            {m.content}
          </div>
        ))}

        {isLoading && (
          <div className="text-gray-400 text-sm">Thinking...</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 mt-4 border-t pt-4"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask something..."
          className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-5 py-2 rounded-xl hover:opacity-80 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
