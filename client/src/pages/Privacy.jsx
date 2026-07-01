import { Link } from "react-router-dom";
import logo from "../assets/home/budget-zen-logo.png";
import ThemeToggleButton from "../components/ThemeToggleButton";
import "../components/AuthShell.css";

export default function Privacy() {
  return (
    <div className="auth-shell">
      <div className="auth-shell-orb auth-shell-orb-a" />
      <div className="auth-shell-orb auth-shell-orb-b" />
      <div className="auth-shell-orb auth-shell-orb-c" />

      <header className="auth-shell-header">
        <Link to="/login" className="auth-shell-brand">
          <img src={logo} alt="Budget Zen logo" className="auth-shell-brand-logo" />
          <div>
            <p className="auth-shell-brand-title">ShilingiZen</p>
            <p className="auth-shell-brand-copy">Be wise with your coins.</p>
          </div>
        </Link>

        <nav className="auth-shell-nav">
          <ThemeToggleButton className="auth-theme-button" compact />
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
        </nav>
      </header>

      <main className="auth-shell-grid" style={{ alignItems: "start", paddingTop: "2rem" }}>
        <section className="auth-hero-card" style={{ padding: "1.5rem" }}>
          <p className="auth-section-eyebrow">Privacy</p>
          <h1 className="auth-hero-title">Privacy Policy</h1>
          <p className="auth-hero-copy">
            This policy explains how ShilingiZen handles your financial data. Last updated: July 2026.
          </p>

          <div style={{ marginTop: "1.5rem", lineHeight: 1.6 }}>
            <p style={{ marginBottom: "1rem" }}>
              <strong>Data we collect</strong>
            </p>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              We collect information you provide directly: your email and password for account creation, M-Pesa balance figures, income and expense entries, and optional phone last four digits. We also store insights preferences to customize your AI coaching experience.
            </p>

            <p style={{ marginBottom: "1rem" }}>
              <strong>M-Pesa credentials</strong>
            </p>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              We never have access to your M-Pesa account credentials, passwords, or PIN. Balance values are self-reported by you or fetched via Safaricom Daraja APIs that you configure yourself — we only store the numeric values you provide.
            </p>

            <p style={{ marginBottom: "1rem" }}>
              <strong>Data storage</strong>
            </p>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              Your data is stored in MongoDB (or similar database). Sensitive fields are encrypted at rest when using managed services like Atlas. Your authentication token is stored locally in browser storage.
            </p>

            <p style={{ marginBottom: "1rem" }}>
              <strong>Third parties</strong>
            </p>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              We may use third-party services for: image optimization (Cloudinary), AI insights generation, and analytics. These parties are contractually bound not to use your data for other purposes. We do not sell your data.
            </p>

            <p style={{ marginBottom: "1rem" }}>
              <strong>Your rights</strong>
            </p>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              You may request a copy of your data, correct inaccurate information, or delete your account at any time. Contact us to exercise these rights.
            </p>

            <p style={{ marginBottom: "1rem" }}>
              <strong>Contact</strong>
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              Questions? Email us at <a href="mailto:privacy@shilingizen.app" style={{ color: "var(--link)" }}>privacy@shilingizen.app</a>
            </p>
          </div>
        </section>

        <section className="auth-form-card" style={{ padding: "1.5rem" }}>
          <h2 className="auth-form-title">Privacy matters</h2>
          <p className="auth-form-copy">
            Your financial information belongs to you. We're just helping you manage it wisely.
          </p>

          <div className="auth-insight-grid" style={{ marginTop: "1.5rem" }}>
            <div className="auth-insight-card">
              <p className="auth-insight-label">Zero access</p>
              <p className="auth-insight-value">No M-Pesa passwords stored</p>
            </div>
            <div className="auth-insight-card">
              <p className="auth-insight-label">Your control</p>
              <p className="auth-insight-value">Delete anytime</p>
            </div>
          </div>

          <Link to="/wallet" style={{ display: "block", marginTop: "1.5rem", color: "var(--link)" }}>
            ← Back to Wallet
          </Link>
        </section>
      </main>
    </div>
  );
}