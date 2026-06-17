"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles, Phone, ArrowLeft, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! 👋 I'm Welly AI, how can i help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lead capture form state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSendingLead, setIsSendingLead] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm experiencing some technical difficulties. You can directly contact us on Telegram at @bryantlim!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadContact.trim() || isSendingLead) return;

    setIsSendingLead(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lead",
          leadInfo: {
            name: leadName,
            contact: leadContact,
            message: leadMessage || "Requested a callback from chatbot.",
          },
          messages: messages,
        }),
      });

      if (response.ok) {
        setLeadSubmitted(true);
        setLeadName("");
        setLeadContact("");
        setLeadMessage("");
      } else {
        throw new Error("Failed to send lead details");
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      alert("Failed to request call back. Please contact us on Telegram directly.");
    } finally {
      setIsSendingLead(false);
    }
  };

  return (
    <>
      {/* Dynamic Keyframes for spinner */}
      <style jsx global>{`
        @keyframes chatbot-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .chatbot-animate-spin {
          animation: chatbot-spin 1s linear infinite;
        }
      `}</style>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "var(--accent-gradient)",
          color: "white",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          transition: "transform 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        aria-label="AI Chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
      </button>

      {/* Chat window container */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "380px",
            maxWidth: "calc(100vw - 60px)",
            height: "500px",
            maxHeight: "calc(100vh - 150px)",
            background: "rgba(18, 18, 21, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--glass-border)",
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(255, 255, 255, 0.03)",
              borderBottom: "1px solid var(--glass-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              <span style={{ fontWeight: 600, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                Welly AI <Sparkles size={14} style={{ color: "var(--accent-secondary)" }} />
              </span>
            </div>
            <button
              onClick={() => {
                setShowLeadForm(!showLeadForm);
                setLeadSubmitted(false);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--glass-border)",
                color: "var(--accent-secondary)",
                padding: "6px 12px",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Phone size={12} /> Call Back
            </button>
          </div>

          {/* Lead Capture Form Mode */}
          {showLeadForm ? (
            <div
              style={{
                flex: 1,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
            >
              <button
                onClick={() => setShowLeadForm(false)}
                style={{
                  alignSelf: "flex-start",
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "20px",
                }}
              >
                <ArrowLeft size={16} /> Back to Chat
              </button>

              {leadSubmitted ? (
                <div style={{ textAlign: "center", margin: "auto 0" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.1)",
                      color: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    ✓
                  </div>
                  <h4 style={{ marginBottom: "8px" }}>Request Received!</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.4" }}>
                    We have received your details. Our team will contact you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setShowLeadForm(false);
                      setLeadSubmitted(false);
                    }}
                    className="btn-primary"
                    style={{
                      marginTop: "20px",
                      padding: "10px 24px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h4 style={{ fontSize: "1rem", marginBottom: "4px" }}>Request a Callback</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "10px", lineHeight: "1.4" }}>
                    Leave your contact details and our team will get in touch to discuss your project.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      style={{
                        padding: "10px 14px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Phone / Email *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +60123456789 or email@domain.com"
                      value={leadContact}
                      onChange={(e) => setLeadContact(e.target.value)}
                      style={{
                        padding: "10px 14px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Message / Requirements</label>
                    <textarea
                      placeholder="What project can we help you with?"
                      rows={3}
                      value={leadMessage}
                      onChange={(e) => setLeadMessage(e.target.value)}
                      style={{
                        padding: "10px 14px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "0.85rem",
                        outline: "none",
                        resize: "none",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSendingLead}
                    style={{
                      marginTop: "10px",
                      padding: "12px",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "none",
                    }}
                  >
                    {isSendingLead ? <Loader2 className="chatbot-animate-spin" size={18} /> : "Submit Request"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Standard Messaging Mode */
            <>
              {/* Messages Body */}
              <div
                style={{
                  flex: 1,
                  padding: "20px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {messages.map((msg, index) => {
                  const isAssistant = msg.role === "assistant";
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isAssistant ? "flex-start" : "flex-end",
                        maxWidth: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "4px",
                          fontSize: "0.7rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {isAssistant ? (
                          <>
                            <Bot size={12} style={{ color: "var(--accent-secondary)" }} />
                            <span>Welly AI</span>
                          </>
                        ) : (
                          <>
                            <span>You</span>
                            <User size={12} style={{ color: "var(--accent-primary)" }} />
                          </>
                        )}
                      </div>
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: isAssistant
                            ? "4px 20px 20px 20px"
                            : "20px 4px 20px 20px",
                          background: isAssistant
                            ? "rgba(255, 255, 255, 0.04)"
                            : "rgba(139, 92, 246, 0.15)",
                          border: `1px solid ${
                            isAssistant ? "var(--glass-border)" : "rgba(139, 92, 246, 0.3)"
                          }`,
                          fontSize: "0.85rem",
                          lineHeight: "1.4",
                          whiteSpace: "pre-wrap",
                          color: "white",
                          maxWidth: "85%",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                    <Loader2 size={16} className="chatbot-animate-spin" style={{ color: "var(--accent-secondary)" }} />
                    <span style={{ fontSize: "0.8rem" }}>AI typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid var(--glass-border)",
                  background: "rgba(255, 255, 255, 0.02)",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "14px",
                    color: "white",
                    outline: "none",
                    fontSize: "0.85rem",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--glass-border)")}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  style={{
                    background: "var(--accent-gradient)",
                    color: "white",
                    border: "none",
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    opacity: inputValue.trim() ? 1 : 0.5,
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (inputValue.trim()) e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}

          {/* Footer Remark */}
          <div style={{
            textAlign: "center",
            padding: "8px 0",
            fontSize: "0.7rem",
            color: "var(--text-secondary)",
            background: "rgba(0, 0, 0, 0.15)",
            borderTop: "1px solid var(--glass-border)",
            opacity: 0.8
          }}>
            Built with ❤️ by Creativate Studio
          </div>
        </div>
      )}
    </>
  );
}
