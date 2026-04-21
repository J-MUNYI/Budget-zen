import { useState, useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/useAuth";
import { generateInsights, patchMe } from "../api/client";
import { motion, AnimatePresence } from "framer-motion";

export default function Insights() {
  const { user, refreshUser } = useAuth();
  const [standing, setStanding] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setStanding(user?.insightsFocus || "");
  }, [user?.insightsFocus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const adjustHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "60px";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  };

  const saveStanding = async () => {
    setSaving(true);
    setSaveMsg(null);
    setError(null);
    try {
      await patchMe({ insightsFocus: standing });
      await refreshUser();
      setSaveMsg("Preferences saved.");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setError(err.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const runAnalysis = async () => {
    const trimmed = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "60px";

    const userMsg = { role: "user", text: trimmed || "Analyse my expenses and give me insights." };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const data = await generateInsights(trimmed || undefined);
      setMessages(prev => [...prev, { role: "ai", text: data.insight || "" }]);
    } catch (err) {
      let msg = err.message || "Could not generate insights.";
      if (err.data?.detail) {
        const d = err.data.detail;
        msg += typeof d === "string" ? ` ${d}` : ` ${JSON.stringify(d)}`;
      }
      setMessages(prev => [...prev, { role: "error", text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) runAnalysis();
    }
  };

  return (
    <AppShell
      title="Insights"
      subtitle="Chat with your AI finance coach powered by your real expense data."
    >
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)", maxWidth: "760px" }}>

        {/* Config toggle */}
        <div style={{ marginBottom: "12px" }}>
          <button
            type="button"
            onClick={() => setShowConfig(v => !v)}
            style={{
              background: "var(--card-strong)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "6px 14px",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {showConfig ? "Hide preferences" : "Configure AI context"}
          </button>
        </div>

        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginBottom: "12px" }}
            >
              <div className="expense-form-card" style={{ padding: "1.25rem" }}>
                <p className="dashboard-section-eyebrow">Standing context</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 10px" }}>
                  Saved to your profile and sent with every AI run.
                </p>
                <textarea
                  className="expense-input"
                  rows={3}
                  value={standing}
                  onChange={(e) => setStanding(e.target.value)}
                  style={{ resize: "vertical" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                  <button type="button" className="expense-submit" style={{ margin: 0 }} onClick={saveStanding} disabled={saving}>
                    {saving ? "Saving…" : "Save preferences"}
                  </button>
                  {saveMsg ? <p style={{ color: "#24b36b", margin: 0, fontSize: "0.85rem" }}>{saveMsg}</p> : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages area */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "4px 0 12px",
        }}>
          {messages.length === 0 && (
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              textAlign: "center",
              padding: "3rem 1rem",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💬</div>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", margin: "0 0 6px" }}>Ask your finance coach</p>
              <p style={{ fontSize: "0.88rem", margin: 0 }}>Type a message below or just hit send for a full analysis of your expenses.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px", justifyContent: "center" }}>
                {[
                  "Analyse my spending this month",
                  "Where am I overspending?",
                  "How can I save more?",
                  "What's my biggest expense category?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                    style={{
                      background: "var(--card-strong)",
                      border: "1px solid var(--border)",
                      borderRadius: "20px",
                      padding: "6px 14px",
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div style={{
                  maxWidth: "85%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user"
                    ? "var(--accent)"
                    : msg.role === "error"
                    ? "rgba(255,97,87,0.1)"
                    : "var(--card-strong)",
                  border: `1px solid ${msg.role === "error" ? "rgba(255,97,87,0.3)" : "var(--border)"}`,
                  color: msg.role === "user" ? "#fff" : msg.role === "error" ? "#ff6157" : "var(--text)",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", gap: "6px", padding: "8px 16px" }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }}
                />
              ))}
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          background: "var(--card-strong)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "8px 8px 8px 16px",
          display: "flex",
          alignItems: "flex-end",
          gap: "8px",
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your spending, savings, or request a full analysis…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: "0.88rem",
              color: "var(--text)",
              lineHeight: 1.5,
              minHeight: "60px",
              maxHeight: "200px",
              fontFamily: "inherit",
              padding: "6px 0",
            }}
          />
          <button
            type="button"
            onClick={runAnalysis}
            disabled={loading}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: loading ? "var(--border)" : "var(--accent)",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", marginTop: "6px" }}>
          Your data never leaves your server · AI-powered insights
        </p>
      </div>
    </AppShell>
  );
}