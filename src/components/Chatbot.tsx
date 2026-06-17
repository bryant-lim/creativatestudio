"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles, Phone, ArrowLeft, Bot, User, Clock } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  showDetailsForm?: boolean;
  showQuickReplies?: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Onboarding pre-chat states
  const [hasStarted, setHasStarted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Inactivity session state
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [sessionEndReason, setSessionEndReason] = useState<"inactivity" | "completed" | null>(null);

  // Temporary details state for inline verification
  const [tempName, setTempName] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempEmail, setTempEmail] = useState("");

  // Inactivity timeout configuration (360000ms = 6 minutes)
  const INACTIVITY_TIMEOUT_MS = 360000;
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for external open trigger
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("welly-ai-open", handleOpen);
    return () => window.removeEventListener("welly-ai-open", handleOpen);
  }, []);

  // Lead capture form state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSendingLead, setIsSendingLead] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && hasStarted) {
      scrollToBottom();
    }
  }, [messages, isOpen, hasStarted]);

  // Handle inactivity timeout triggers
  const handleInactivityTimeout = async () => {
    setIsSessionEnded(true);
    setSessionEndReason("inactivity");
    
    // Only send summary if user had typed something
    const userHasMessaged = messages.some((m) => m.role === "user");
    if (!userHasMessaged) return;

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lead",
          leadInfo: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            message: "Chat closed automatically due to 5 minutes of inactivity.",
          },
          messages: messages,
        }),
      });
    } catch (err) {
      console.error("Auto-lead submission error on timeout:", err);
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (isOpen && hasStarted && !isSessionEnded) {
      inactivityTimerRef.current = setTimeout(handleInactivityTimeout, INACTIVITY_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [messages, isOpen, hasStarted, isSessionEnded]);

  const handleStartOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        alert("Please enter a valid email address.");
        return;
      }
    }

    setMessages([
      {
        role: "assistant",
        content: `Hi ${customerName}! 👋 I'm Welly AI, how can I help you today?`,
      },
    ]);
    setHasStarted(true);
  };

  const startNewChatSession = () => {
    setMessages([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setHasStarted(false);
    setIsSessionEnded(false);
    setSessionEndReason(null);
    setShowLeadForm(false);
    setLeadSubmitted(false);
  };

  const handleSendMessage = async (e: React.FormEvent | null, customValue?: string) => {
    if (e) e.preventDefault();
    
    const valueToUse = customValue !== undefined ? customValue : inputValue;
    if (!valueToUse.trim() || isLoading || isSessionEnded) return;

    const userMessage: Message = { role: "user", content: valueToUse };
    const cleanPrevMessages = messages.map(msg => ({
      ...msg,
      showDetailsForm: false,
      showQuickReplies: false
    }));
    const updatedMessages = [...cleanPrevMessages, userMessage];
    setMessages(updatedMessages);
    if (customValue === undefined) setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          clientName: customerName,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();

      if (data.reply) {
        const finalMessages = [...updatedMessages, {
          role: "assistant" as const,
          content: data.reply,
          showDetailsForm: data.isPreClosure,
          showQuickReplies: data.isFinalClosure,
        }];
        setMessages(finalMessages);

        if (data.isPreClosure) {
          setTempName(customerName);
          setTempPhone(customerPhone);
          setTempEmail(customerEmail);
        }

        if (data.isClosureComplete) {
          setIsSessionEnded(true);
          setSessionEndReason("completed");
          // Automatically submit lead details for standard completion
          try {
            await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "lead",
                leadInfo: {
                  name: customerName,
                  phone: customerPhone,
                  email: customerEmail,
                  message: "Conversation completed successfully.",
                },
                messages: finalMessages,
              }),
            });
          } catch (err) {
            console.error("Auto-lead submission error on completion:", err);
          }
        }
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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleConfirmDetails = async (messageIndex: number) => {
    if (!tempName.trim() || !tempPhone.trim()) {
      alert("Please fill in Name and Phone.");
      return;
    }

    if (tempEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tempEmail.trim())) {
        alert("Please enter a valid email address.");
        return;
      }
    }

    setCustomerName(tempName);
    setCustomerPhone(tempPhone);
    setCustomerEmail(tempEmail);

    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === messageIndex ? { ...msg, showDetailsForm: false } : msg
      )
    );

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lead",
          leadInfo: {
            name: tempName,
            phone: tempPhone,
            email: tempEmail,
            message: "User verified and updated contact details.",
          },
          messages: messages,
        }),
      });
    } catch (err) {
      console.error("Error submitting verified lead:", err);
    }

    const confirmationText = `My details are correct: Name: ${tempName}, Phone: ${tempPhone}${tempEmail ? `, Email: ${tempEmail}` : ""}.`;
    await handleSendMessage(null, confirmationText);
  };

  const handleOpenCallBackForm = () => {
    setLeadName(customerName);
    setLeadPhone(customerPhone);
    setLeadEmail(customerEmail);
    setLeadMessage("");
    setShowLeadForm(true);
    setLeadSubmitted(false);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim() || isSendingLead) return;

    if (leadEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(leadEmail.trim())) {
        alert("Please enter a valid email address.");
        return;
      }
    }

    setIsSendingLead(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lead",
          leadInfo: {
            name: leadName,
            phone: leadPhone,
            email: leadEmail,
            message: leadMessage || "Requested a callback from chatbot.",
          },
          messages: messages,
        }),
      });

      if (response.ok) {
        setLeadSubmitted(true);
        setCustomerName(leadName);
        setCustomerPhone(leadPhone);
        setCustomerEmail(leadEmail);
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
                  background: isSessionEnded ? "#ef4444" : hasStarted ? "#10b981" : "#e4e4e7",
                }}
              />
              <span style={{ fontWeight: 600, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                Welly AI <Sparkles size={14} style={{ color: "var(--accent-secondary)" }} />
              </span>
            </div>
            {hasStarted && !isSessionEnded && (
              <button
                onClick={handleOpenCallBackForm}
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
            )}
          </div>

          {/* Body Panels */}
          {!hasStarted ? (
            /* CASE 1: Pre-chat Onboarding Form */
            <form
              onSubmit={handleStartOnboarding}
              style={{
                flex: 1,
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                overflowY: "auto",
              }}
            >
              <div>
                <h4 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>Welcome!</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.4" }}>
                  Please share your name and contact details to begin chatting with Welly AI.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    padding: "12px 14px",
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
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 60123456789"
                  value={customerPhone}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/\D/g, "").slice(0, 12);
                    setCustomerPhone(filtered);
                  }}
                  style={{
                    padding: "12px 14px",
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
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. hello@creativatestudio.my"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  marginTop: "10px",
                  padding: "14px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Start Chatting
              </button>
            </form>
          ) : showLeadForm ? (
            /* CASE 2: Lead Callback Form */
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
                    Confirm your details below to submit a direct enquiry to our team.
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
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 60123456789"
                      value={leadPhone}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/\D/g, "").slice(0, 12);
                        setLeadPhone(filtered);
                      }}
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
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. hello@creativatestudio.my"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
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
            /* CASE 3: Messaging Mode */
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

                        {/* Inline Contact details verification form */}
                        {msg.showDetailsForm && (
                          <div style={{
                            marginTop: "12px",
                            padding: "12px",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid var(--glass-border)",
                            borderRadius: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            textAlign: "left"
                          }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Verify Contact Details:</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Name</label>
                              <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                style={{
                                  padding: "6px 10px",
                                  background: "rgba(0, 0, 0, 0.2)",
                                  border: "1px solid var(--glass-border)",
                                  borderRadius: "6px",
                                  color: "white",
                                  fontSize: "0.8rem",
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Phone</label>
                              <input
                                type="text"
                                value={tempPhone}
                                onChange={(e) => {
                                  const filtered = e.target.value.replace(/\D/g, "").slice(0, 12);
                                  setTempPhone(filtered);
                                }}
                                style={{
                                  padding: "6px 10px",
                                  background: "rgba(0, 0, 0, 0.2)",
                                  border: "1px solid var(--glass-border)",
                                  borderRadius: "6px",
                                  color: "white",
                                  fontSize: "0.8rem",
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Email (Optional)</label>
                              <input
                                type="email"
                                value={tempEmail}
                                onChange={(e) => setTempEmail(e.target.value)}
                                style={{
                                  padding: "6px 10px",
                                  background: "rgba(0, 0, 0, 0.2)",
                                  border: "1px solid var(--glass-border)",
                                  borderRadius: "6px",
                                  color: "white",
                                  fontSize: "0.8rem",
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleConfirmDetails(index)}
                              className="btn-primary"
                              style={{
                                marginTop: "6px",
                                padding: "8px",
                                fontSize: "0.75rem",
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              Confirm details is correct
                            </button>
                          </div>
                        )}

                        {/* Quick Replies for Final Closure */}
                        {msg.showQuickReplies && (
                          <div style={{
                            marginTop: "12px",
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap"
                          }}>
                            <button
                              type="button"
                              onClick={() => handleSendMessage(null, "No, thank you")}
                              style={{
                                padding: "8px 12px",
                                background: "rgba(139, 92, 246, 0.15)",
                                border: "1px solid rgba(139, 92, 246, 0.3)",
                                borderRadius: "10px",
                                color: "white",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139, 92, 246, 0.3)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)")}
                            >
                              No, thank you
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMessages((prev) =>
                                  prev.map((m, idx) =>
                                    idx === index ? { ...m, showQuickReplies: false } : m
                                  )
                                );
                                setTimeout(() => inputRef.current?.focus(), 50);
                              }}
                              style={{
                                padding: "8px 12px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "10px",
                                color: "white",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
                            >
                              Yes, I have another question
                            </button>
                          </div>
                        )}
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
                
                {isSessionEnded && (
                  <div
                    style={{
                      padding: "12px",
                      background: sessionEndReason === "completed" ? "rgba(16, 185, 129, 0.06)" : "rgba(239, 68, 68, 0.06)",
                      border: sessionEndReason === "completed" ? "1px dashed rgba(16, 185, 129, 0.2)" : "1px dashed rgba(239, 68, 68, 0.2)",
                      borderRadius: "14px",
                      textAlign: "center",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.4",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "10px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: sessionEndReason === "completed" ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                      {sessionEndReason === "completed" ? (
                        <>✓ Conversation Completed</>
                      ) : (
                        <><Clock size={14} /> Session Closed</>
                      )}
                    </div>
                    <span>
                      {sessionEndReason === "completed" ? (
                        "Conversation Completed. Our team will contact you soonest!"
                      ) : (
                        'Chat closed due to 5 minutes of inactivity. Kindly "Start New Chat" so we can assist you.'
                      )}
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Actions Form */}
              {isSessionEnded ? (
                /* Session Ended Action Button */
                <div
                  style={{
                    padding: "14px 20px",
                    borderTop: "1px solid var(--glass-border)",
                    background: "rgba(255, 255, 255, 0.02)",
                    display: "flex",
                  }}
                >
                  <button
                    onClick={startNewChatSession}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: "12px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    Start New Chat
                  </button>
                </div>
              ) : (
                /* Regular Message Input Form */
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
                  <textarea
                    ref={inputRef}
                    placeholder="Ask a question..."
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      resetInactivityTimer();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    rows={1}
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
                      resize: "none",
                      minHeight: "38px",
                      maxHeight: "100px",
                      lineHeight: "1.4",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--accent-primary)";
                      resetInactivityTimer();
                    }}
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
              )}
            </>
          )}

          {/* Footer Remark */}
          <div
            style={{
              textAlign: "center",
              padding: "8px 0",
              fontSize: "0.7rem",
              color: "var(--text-secondary)",
              background: "rgba(0, 0, 0, 0.15)",
              borderTop: "1px solid var(--glass-border)",
              opacity: 0.8,
            }}
          >
            Built with ❤️ by Creativate Studio
          </div>
        </div>
      )}
    </>
  );
}
