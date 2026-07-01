import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/useAuth";
import { patchMe, testDarajaConnection, requestMpesaAccountBalance } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function AdminIntegrations() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [darajaBusy, setDarajaBusy] = useState(null);
  const [darajaNote, setDarajaNote] = useState(null);
  const [darajaErr, setDarajaErr] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <AppShell title="Admin">
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
      </AppShell>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

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
    } catch (err) {
      setDarajaErr(err.message || "Balance request failed.");
    } finally {
      setDarajaBusy(null);
    }
  };

  return (
    <AppShell title="Admin" subtitle="Safaricom Daraja integration tools">
      <div className="wallet-page" style={{ maxWidth: 560 }}>
        <div className="expense-form-card" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
          <p className="dashboard-section-eyebrow">Safaricom Daraja</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.15rem", marginTop: 6 }}>
            Live billing / balance (Account Balance API)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1rem" }}>
            On the server, set <code style={{ fontSize: "0.82em" }}>MPESA_CONSUMER_KEY</code>,{" "}
            <code style={{ fontSize: "0.80em" }}>MPESA_CONSUMER_SECRET</code>,{" "}
            <code style={{ fontSize: "0.80em" }}>MPESA_SHORTCODE</code>,{" "}
            <code style={{ fontSize: "0.80em" }}>MPESA_INITIATOR_NAME</code>,{" "}
            <code style={{ fontSize: "0.80em" }}>MPESA_SECURITY_CREDENTIAL</code> (from the Daraja tools), and{" "}
            <code style={{ fontSize: "0.80em" }}>MPESA_PUBLIC_BASE_URL</code> as your HTTPS API root (ngrok in dev).
            Use <code style={{ fontSize: "0.80em" }}>MPESA_ENV=production</code> only when going live.
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
      </div>
    </AppShell>
  );
}