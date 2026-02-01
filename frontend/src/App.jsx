import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", text: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.text })
      })

      if (!res.ok) throw new Error()
      const data = await res.json()

      setMessages(prev => [...prev, { role: "bot", text: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Server error 😢" }])
    }

    setLoading(false)
  }

  return (
    <div className="flex justify-center items-center h-screen w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white p-4">
      <Card className="w-full max-w-2xl h-[700px] flex flex-col p-6 gap-4 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden">

        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-100 to-indigo-200 bg-clip-text text-transparent">
              AI Assistant
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div className="flex flex-col gap-6 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[400px] text-white/50 gap-4">
                <div className="p-6 bg-white/5 rounded-full ring-1 ring-white/10">
                  <svg className="w-12 h-12 text-blue-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">Start a conversation...</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`p-4 rounded-2xl max-w-[85%] shadow-lg transition-all hover:scale-[1.01] ${msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-900/20"
                    : "bg-slate-800/80 backdrop-blur-md text-slate-100 border border-white/10 rounded-tl-none shadow-black/10"
                    }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                  ) : (
                    <div className="text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-nav:my-1">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-1" {...props} />,
                          li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-blue-200" {...props} />,
                          code: ({ node, inline, ...props }) => (
                            inline
                              ? <code className="bg-white/10 px-1 py-0.5 rounded text-blue-100 font-mono text-xs" {...props} />
                              : <div className="bg-black/30 p-2 rounded-lg my-2 overflow-x-auto"><code className="text-sm font-mono text-blue-100" {...props} /></div>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-white/5">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="relative group">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            className="bg-slate-800/80 border-white/20 text-white placeholder:text-slate-400 h-16 pl-6 pr-20 rounded-2xl focus-visible:ring-blue-500/80 focus-visible:border-blue-500/50 transition-all text-base shadow-md"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-900/20 aspect-square"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>

      </Card>
    </div>
  )
}
