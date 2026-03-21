"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/lib/context";
import { generateId } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { Send, Trash2, Bot, Loader2 } from "lucide-react";

export default function AIAssistant() {
  const t = useTranslations("assistant");
  const { profile, messages, addMessage, clearMessages } = useApp();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          profile,
          history: messages.slice(-10),
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMsg);

      // Announce to screen readers
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = data.response;
      }
    } catch {
      const errMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: t("errorMessage"),
        timestamp: new Date().toISOString(),
      };
      addMessage(errMsg);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  const suggestions = [t("suggested1"), t("suggested2"), t("suggested3")];

  return (
    <section
      className="card flex flex-col"
      style={{ height: "520px" }}
      aria-label="AI Financial Assistant"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-accent-subtle)" }}
          >
            <Bot size={14} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
            AI Assistant
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="btn-ghost text-xs px-2 py-1"
            aria-label={t("clearHistory")}
            title={t("clearHistory")}
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
              Ask me anything about your finances
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="btn-ghost text-xs text-left"
                  style={{ justifyContent: "flex-start" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "var(--color-accent-subtle)" }}
              >
                <Bot size={12} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
              </div>
            )}
            <div
              className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? { background: "var(--color-accent)", color: "#000", borderBottomRightRadius: "4px" }
                  : {
                      background: "var(--color-surface-raised)",
                      color: "var(--color-text-primary)",
                      border: "1px solid var(--color-border)",
                      borderBottomLeftRadius: "4px",
                    }
              }
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--color-accent-subtle)" }}
            >
              <Bot size={12} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderBottomLeftRadius: "4px",
              }}
            >
              <Loader2
                size={14}
                className="animate-spin"
                style={{ color: "var(--color-accent)" }}
                aria-hidden="true"
              />
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("thinking")}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* SR live region */}
      <div ref={liveRegionRef} className="sr-only" aria-live="assertive" aria-atomic="true" />

      {/* Input */}
      <div
        className="px-4 pb-4 pt-3"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex gap-2 items-end">
          <label htmlFor="chat-input" className="sr-only">
            {t("placeholder")}
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={t("placeholder")}
            rows={1}
            className="input resize-none text-sm"
            style={{ lineHeight: "1.5", minHeight: "40px", maxHeight: "100px" }}
            disabled={isLoading || !profile}
            aria-label={t("placeholder")}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading || !profile}
            className="btn-primary px-3 py-2.5 flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
