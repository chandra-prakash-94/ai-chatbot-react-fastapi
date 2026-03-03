import React from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { LoadExternalComponent } from "@langchain/langgraph-sdk/react-ui";

export default function ChatGenUI() {
  const { thread, values } = useStream({
    apiUrl: "https://fuzzy-space-spoon-xrg4pq7gq7jhvjv-2024.app.github.dev/", // Update if backend runs elsewhere
    assistantId: "agent",
  });

  return (
    <div className="p-4 max-w-xl mx-auto">
      {thread.messages.map((message) => (
        <div key={message.id} className="mb-4">
          <div className="bg-gray-100 p-2 rounded mb-1">{message.content}</div>
          {values.ui
            ?.filter((ui) => ui.metadata?.message_id === message.id)
            .map((ui) => (
              <LoadExternalComponent key={ui.id} stream={thread} message={ui} />
            ))}
        </div>
      ))}
    </div>
  );
}
