/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  AlertCircle, 
  ChevronDown, 
  Bot, 
  User, 
  HelpCircle,
  Apple,
  Salad,
  Flame,
  ShieldAlert
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isError?: boolean;
}

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  content: "Hi! Ask me anything about healthy eating, nutrition, or how to use the app.",
  timestamp: Date.now()
};

const SUGGESTED_PROMPTS = [
  { icon: Salad, text: "Healthy low-calorie dinner ideas" },
  { icon: Flame, text: "High-protein meal suggestions" },
  { icon: HelpCircle, text: "How to customize allergies & spice levels" },
  { icon: Apple, text: "Balanced nutrition tips for busy days" }
];

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom as messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input on open after animation
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputValue("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    // Temporary empty assistant placeholder
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: Date.now()
      }
    ]);

    try {
      // Prepare conversation history (exclude welcome and empty messages)
      const historyPayload = newMessages
        .filter((m) => m.content.trim() && !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: historyPayload })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body available for streaming");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data: ")) {
            const payload = trimmedLine.slice(6).trim();
            if (payload === "[DONE]") {
              break;
            }

            try {
              const data = JSON.parse(payload);
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.text) {
                accumulatedText += data.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              }
            } catch (jsonErr: any) {
              if (jsonErr.message && !jsonErr.message.includes("JSON")) {
                throw jsonErr;
              }
            }
          }
        }
      }

      // If nothing was streamed, provide a fallback message
      if (!accumulatedText.trim()) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: "I'm here to help with healthy eating, nutrition, and app guidance. What would you like to explore?"
                }
              : msg
          )
        );
      }
    } catch (err: any) {
      console.error("AI Assistant request error:", err);
      const fallbackErr = "Something went wrong, please try again.";
      setErrorMessage(fallbackErr);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: fallbackErr,
                isError: true
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setErrorMessage(null);
    setInputValue("");
  };

  // Simple Markdown text renderer for bolding, bullet lists, and numbered items
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      // Check for bullet line (*, -, •)
      const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
      const isNumbered = /^\d+\.\s+/.test(trimmed);
      const numberMatch = isNumbered ? trimmed.match(/^(\d+\.)\s+/) : null;

      let cleanLine = line;
      if (isBullet) {
        cleanLine = trimmed.replace(/^[•\-\*]\s*/, "");
      } else if (isNumbered && numberMatch) {
        cleanLine = trimmed.substring(numberMatch[0].length);
      }

      // Simple parser for bold segments (**text**)
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-stone-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start space-x-2 my-1 pl-1">
            <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
            <span className="flex-1">{formattedParts}</span>
          </div>
        );
      }

      if (isNumbered && numberMatch) {
        return (
          <div key={idx} className="flex items-start space-x-2 my-1 pl-1">
            <span className="text-amber-600 font-bold text-xs shrink-0 mt-0.5">{numberMatch[1]}</span>
            <span className="flex-1">{formattedParts}</span>
          </div>
        );
      }

      if (trimmed === "") {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="my-0.5">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. Fixed Floating Action Button (Bottom-Right, non-intrusive) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center group select-none print:hidden">
        {/* Floating tooltip badge */}
        {!isOpen && (
          <div className="hidden sm:flex items-center mr-3 px-3 py-1.5 rounded-full bg-stone-900/90 text-white text-xs font-medium shadow-md backdrop-blur-xs border border-stone-800 transition-all opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5 animate-pulse" />
            <span>Health & Food AI</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close AI Assistant" : "Open Health & Food AI Assistant"}
          title={isOpen ? "Close Assistant" : "Health & Food Assistant"}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl ${
            isOpen
              ? "bg-stone-900 text-white hover:bg-stone-800 scale-95 ring-2 ring-stone-900/30"
              : "bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white hover:scale-108 hover:shadow-orange-500/40 shadow-orange-500/25 ring-4 ring-white/80"
          }`}
        >
          {/* Subtle glowing ring when closed */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-30 blur-xs animate-pulse-ring -z-10" />
          )}

          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <div className="relative">
              <Sparkles className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
          )}
        </button>
      </div>

      {/* 2. Backdrop Overlay for mobile and drawer focus */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-50 transition-opacity animate-fadeIn sm:bg-stone-950/20"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3. Slide-in Chat Panel (Drawer on Desktop, Bottom-sheet/Full-screen on Mobile) */}
      <div
        className={`fixed z-50 inset-x-0 bottom-0 top-16 sm:top-0 sm:left-auto sm:right-0 sm:bottom-0 w-full sm:w-[420px] md:w-[450px] bg-[#FAF9F6] shadow-2xl flex flex-col border-t sm:border-t-0 sm:border-l border-stone-200/90 rounded-t-3xl sm:rounded-none overflow-hidden transition-transform duration-300 ease-out font-sans ${
          isOpen ? "translate-y-0 sm:translate-x-0 pointer-events-auto" : "translate-y-full sm:translate-y-0 sm:translate-x-full pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Health and Food Assistant Chat"
      >
        {/* Panel Header */}
        <div className="bg-white px-5 py-4 border-b border-stone-200 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-serif font-bold text-stone-900 text-base leading-tight">
                  Health & Food Assistant
                </h3>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
                Nutrition, Diet & App Guide
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Reset Chat button */}
            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              title="Close Assistant"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF9F6]">
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[88%] sm:max-w-[85%] ${
                    isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                      isUser
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-white border border-stone-200 text-amber-600 shadow-xs"
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                      isUser
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-xs"
                        : message.isError
                        ? "bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-xs"
                        : "bg-white text-[#1A1A1A] border border-stone-200/90 rounded-tl-xs"
                    }`}
                  >
                    {message.isError ? (
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{message.content}</p>
                          <button
                            onClick={() => {
                              const lastUser = [...messages].reverse().find((m) => m.role === "user");
                              if (lastUser) handleSendMessage(lastUser.content);
                            }}
                            className="text-[11px] underline text-rose-700 hover:text-rose-900 mt-1 cursor-pointer font-medium"
                          >
                            Click to retry
                          </button>
                        </div>
                      </div>
                    ) : (
                      renderFormattedContent(message.content)
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-stone-400 mt-1 px-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })}

          {/* Typing / Streaming Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="w-7 h-7 rounded-xl bg-white border border-stone-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-stone-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-xs text-stone-400 font-medium ml-2">Thinking...</span>
              </div>
            </div>
          )}

          {/* Suggested Starter Chips (Visible initially or when conversation is fresh) */}
          {messages.length <= 2 && !isLoading && (
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Suggested questions:
              </p>
              <div className="flex flex-col space-y-1.5">
                {SUGGESTED_PROMPTS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(item.text)}
                      className="flex items-center space-x-2 text-left px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-xs text-stone-700 hover:text-amber-900 transition-all cursor-pointer shadow-xs group"
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">{item.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0 space-y-2">
          {errorMessage && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <div className="flex items-center space-x-1.5 truncate">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-stone-400 hover:text-stone-700 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about nutrition, food choices, or app help..."
              disabled={isLoading}
              className="flex-1 bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-900 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-stone-400 disabled:opacity-60"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="w-11 h-11 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
              title="Send Message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-400 px-1 pt-1">
            <span className="flex items-center">
              <ShieldAlert className="w-3 h-3 text-stone-400 mr-1 inline" />
              General wellness guidance — not medical advice.
            </span>
            <span>Press Enter ↵</span>
          </div>
        </div>
      </div>
    </>
  );
}
