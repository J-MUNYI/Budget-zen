import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { patchMe, testDarajaConnection, requestMpesaAccountBalance } from "../api/client";

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const [mpesaBalance, setMpesaBalance] = useState("");
  const [mpesaPhoneLast4, setMpesaPhoneLast4] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [insightsFocus, setInsightsFocus] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [darajaBusy, setDarajaBusy] = useState(null);
  const [darajaNote, setDarajaNote] = useState(null);
  const [darajaErr, setDarajaErr] = useState(null);

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

  const runDarajaTest = async () => {
    setDarajaBusy("test");
    setDarajaErr(null);
    setDarajaNote(null);
    try {
      const r = await testDarajaConnection();
      setDarajaNote(r.message || "Daraja OAuth OK.");
    } catch (err) {
      setDarajaErr(err.message || "Daraja test failed.");
    } finally {
      setDarajaBusy(null);
    }
  };

  const runBalanceRequest = async () => {
    setDarajaBusy("balance");
    setDarajaErr(null);
    setDarajaNote(null);
    try {
      const r = await requestMpesaAccountBalance();
      setDarajaNote(r.message || "Request sent.");
      await refreshUser();
    } catch (err) {
      setDarajaErr(err.message || "Balance request failed.");
    } finally {
      setDarajaBusy(null);
    }
  };

  return (
    <AppShell
      title="Wallet"
      subtitle="M-Pesa balance and optional income shape how your dashboard and AI coach interpret your money."
    >
      <div className="wallet-page" style={{ maxWidth: 560 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.55, marginBottom: "1.5rem" }}>
          The sidebar card shows your <strong>M-Pesa balance</strong> (not a bank credit line). You can type what you
          see on your handset, or use <strong>Daraja Account Balance</strong> below when the server is configured and
          your API is reachable on the public internet (Safaricom POSTs the result to your Result URL).
        </p>

        <div className="expense-form-card" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
          <p className="dashboard-section-eyebrow">Safaricom Daraja</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.15rem", marginTop: 6 }}>
            Live billing / balance (Account Balance API)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1rem" }}>
            On the server, set <code style={{ fontSize: "0.82em" }}>MPESA_CONSUMER_KEY</code>,{" "}
            <code style={{ fontSize: "0.82em" }}>MPESA_CONSUMER_SECRET</code>,{" "}
            <code style={{ fontSize: "0.82em" }}>MPESA_SHORTCODE</code>,{" "}
            <code style={{ fontSize: "0.82em" }}>MPESA_INITIATOR_NAME</code>,{" "}
            <code style={{ fontSize: "0.82em" }}>MPESA_SECURITY_CREDENTIAL</code> (from the Daraja tools), and{" "}
            <code style={{ fontSize: "0.82em" }}>MPESA_PUBLIC_BASE_URL</code> as your HTTPS API root (ngrok in dev).
            Use <code style={{ fontSize: "0.82em" }}>MPESA_ENV=production</code> only when going live.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="button"
              className="expense-submit"
              style={{ marginTop: 0, flex: "1 1 160px" }}
              disabled={darajaBusy !== null}
              onClick={runDarajaTest}
            >
              {darajaBusy === "test" ? "Testing…" : "Test Daraja OAuth"}
            </button>
            <button
              type="button"
              className="expense-submit"
              style={{ marginTop: 0, flex: "1 1 200px", background: "var(--card-strong)", color: "var(--text)" }}
              disabled={darajaBusy !== null}
              onClick={runBalanceRequest}
            >
              {darajaBusy === "balance" ? "Requesting…" : "Request M-Pesa account balance"}
            </button>
          </div>
          {darajaErr ? <p style={{ color: "#ff6157", marginTop: "0.75rem", fontSize: "0.88rem" }}>{darajaErr}</p> : null}
          {darajaNote ? <p style={{ color: "#24b36b", marginTop: "0.75rem", fontSize: "0.88rem" }}>{darajaNote}</p> : null}
        </div>

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
      </div>
    </AppShell>
  );
}
