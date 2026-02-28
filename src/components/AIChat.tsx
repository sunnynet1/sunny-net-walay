import { useState, useRef, useEffect, FormEvent } from "react";
import { Send, Bot, User, Loader2, Sparkles, Mic, MicOff } from "lucide-react";
import { getAIResponse } from "../services/geminiService";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  stats: any;
}

export function AIChat({ stats }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Assalam-o-Alaikum! Main Suni Net ka AI Assistant hoon. Aap mujhse business stats ke bare mein Urdu ya English mein pooch sakte hain." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice start
      setTimeout(() => {
        setIsRecording(false);
        setInput("17MB se kitna profit aa raha hai?");
      }, 3000);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getAIResponse(userMessage, stats);
      setMessages(prev => [...prev, { role: "assistant", content: response || "No response received." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI service." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "17MB se kitna profit aa raha hai?",
    "Total monthly profit kitna hai?",
    "Kis bandwidth mein sab se zyada users hain?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Admin Assistant</h2>
          <p className="text-slate-400 text-sm">Ask questions about your business in Urdu or English.</p>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-slate-800 text-slate-400" : "bg-indigo-600 text-white"
                  }`}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20" 
                      : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="whitespace-nowrap px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-all shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={handleSend} className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Recording voice..." : "Ask anything about your business..."}
                className={`w-full pl-4 pr-12 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-500 ${
                  isRecording ? "border-red-500 ring-2 ring-red-900/50" : ""
                }`}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-all shadow-sm ${
                isRecording 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
