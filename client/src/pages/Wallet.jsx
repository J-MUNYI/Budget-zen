import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/useAuth";
import { patchMe } from "../api/client";

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const [mpesaBalance, setMpesaBalance] = useState("");
  const [mpesaPhoneLast4, setMpesaPhoneLast4] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [insightsFocus, setInsightsFocus] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setMpesaBalance(user.mpesaBalance != null ? String(user.mpesaBalance) : "0");
    setMpesaPhoneLast4(user.mpesaPhoneLast4 || "");
    setMonthlyIncome(user.monthlyIncome != null ? String(user.monthlyIncome) : "");
    setInsightsFocus(user.insightsFocus || "");
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await patchMe({
        mpesaBalance: Number(mpesaBalance) || 0,
        mpesaPhoneLast4,
        monthlyIncome: monthlyIncome.trim() === "" ? null : Number(monthlyIncome),
        insightsFocus,
      });
      await refreshUser();
      setMessage("Saved. Your dashboard and M-Pesa card will use these values.");
    } catch (err) {
      setError(err.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title="Wallet"
      subtitle="M-Pesa balance and optional income shape how your dashboard and AI coach interpret your money."
    >
      <div className="wallet-page" style={{ maxWidth: 560 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.55, marginBottom: "1.5rem" }}>
          Your balance is private and stays on your device's view — we don't have access to your M-Pesa account.
        </p>

        <form onSubmit={handleSave} className="expense-form-card" style={{ padding: "1.5rem" }}>
          <p className="dashboard-section-eyebrow">M-Pesa</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.15rem", marginTop: 6 }}>
            Balance &amp; card display
          </h2>

          <label className="expense-input-label" style={{ marginTop: "1rem" }}>Current M-Pesa balance (KES)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="expense-input"
            value={mpesaBalance}
            onChange={(e) => setMpesaBalance(e.target.value)}
            required
          />

          <label className="expense-input-label" style={{ marginTop: "1rem" }}>Last 4 digits of M-Pesa phone (optional)</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            className="expense-input"
            placeholder="e.g. 7821"
            value={mpesaPhoneLast4}
            onChange={(e) => setMpesaPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />

          <p className="dashboard-section-eyebrow" style={{ marginTop: "1.75rem" }}>Income</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.15rem", marginTop: 6 }}>
            Optional monthly income
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            Leave empty if you do not receive a regular monthly salary or stipend. The chart can still show spend by month.
          </p>

          <label className="expense-input-label">Expected monthly income (KES)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="expense-input"
            placeholder="Leave blank if not applicable"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
          />

          <p className="dashboard-section-eyebrow" style={{ marginTop: "1.75rem" }}>AI coach</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.15rem", marginTop: 6 }}>
            Standing instructions for Insights
          </h2>
          <label className="expense-input-label">What should analysis always consider?</label>
          <textarea
            className="expense-input"
            rows={4}
            placeholder="e.g. I am a student with irregular gigs; prioritize rent and food."
            value={insightsFocus}
            onChange={(e) => setInsightsFocus(e.target.value)}
            style={{ resize: "vertical", minHeight: "100px" }}
          />

          {error ? <p style={{ color: "#ff6157", marginTop: "0.75rem" }}>{error}</p> : null}
          {message ? <p style={{ color: "#24b36b", marginTop: "0.75rem" }}>{message}</p> : null}

          <button type="submit" className="expense-submit" style={{ marginTop: "1.25rem" }} disabled={saving}>
            {saving ? "Saving…" : "Save wallet"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          See our <a href="/privacy" style={{ color: "var(--link)" }}>Privacy Policy</a> for details on data handling.
        </p>
      </div>
    </AppShell>
  );
}