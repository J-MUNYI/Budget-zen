import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/useAuth";
import { generateInsights, patchMe } from "../api/client";

export default function Insights() {
  const { user, refreshUser } = useAuth();
  const [standing, setStanding] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    setStanding(user?.insightsFocus || "");
  }, [user?.insightsFocus]);

  const saveStanding = async () => {
    setSaving(true);
    setSaveMsg(null);
    setError(null);
    try {
      await patchMe({ insightsFocus: standing });
      await refreshUser();
      setSaveMsg("Preferences saved.");
    } catch (err) {
      setError(err.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setInsight("");
    try {
      const data = await generateInsights(sessionNotes.trim() || undefined);
      setInsight(data.insight || "");
    } catch (err) {
      let msg = err.message || "Could not generate insights.";
      if (err.data?.detail) {
        const d = err.data.detail;
        msg += typeof d === "string" ? ` ${d}` : ` ${JSON.stringify(d)}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Insights"
      subtitle="Configure context for the AI coach, then generate a tailored summary and advice from your real expenses."
    >
      <div className="insights-page" style={{ maxWidth: 720 }}>
        <div className="expense-form-card" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
          <p className="dashboard-section-eyebrow">Configuration</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.15rem", marginTop: 6 }}>
            Standing context (saved to your profile)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "0.75rem" }}>
            This text is sent with every AI run so recommendations stay relevant to your situation. You can also edit it
            under Wallet.
          </p>
          <textarea
            className="expense-input"
            rows={4}
            value={standing}
            onChange={(e) => setStanding(e.target.value)}
            style={{ resize: "vertical", minHeight: "100px" }}
          />
          <button type="button" className="expense-submit" style={{ marginTop: "0.75rem" }} onClick={saveStanding} disabled={saving}>
            {saving ? "Saving…" : "Save preferences"}
          </button>
          {saveMsg ? <p style={{ color: "#24b36b", marginTop: "0.5rem", fontSize: "0.88rem" }}>{saveMsg}</p> : null}
        </div>

        <div className="expense-form-card" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
          <p className="dashboard-section-eyebrow">This session</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.15rem", marginTop: 6 }}>
            Extra notes for this run only
          </h2>
          <textarea
            className="expense-input"
            rows={3}
            placeholder="e.g. I just paid school fees and expect lower spend next month."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <button type="button" className="expense-submit" style={{ marginTop: "0.75rem" }} onClick={runAnalysis} disabled={loading}>
            {loading ? "Analyzing…" : "Generate AI insights"}
          </button>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.65rem" }}>
            Requires <code style={{ fontSize: "0.85em" }}>OPENAI_API_KEY</code> on the server. No key is stored in the browser.
          </p>
        </div>

        {error ? (
          <div className="expense-form-card" style={{ padding: "1.25rem", borderColor: "rgba(255, 97, 87, 0.35)" }}>
            <p style={{ color: "#ff6157", margin: 0 }}>{error}</p>
          </div>
        ) : null}

        {insight ? (
          <div className="expense-form-card" style={{ padding: "1.5rem" }}>
            <p className="dashboard-section-eyebrow">Summary &amp; advice</p>
            <pre
              style={{
                marginTop: "0.75rem",
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                lineHeight: 1.55,
                color: "var(--text)",
              }}
            >
              {insight}
            </pre>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
