import { Link } from "react-router-dom";
import logo from "../assets/home/budget-zen-logo.png";

export default function AuthShell({
  eyebrow,
  title,
  copy,
  statLabel,
  statValue,
  chart,
  formTitle,
  formCopy,
  error,
  socialButtons,
  dividerLabel,
  form,
  footer,
  bottomCard,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-shell-orb auth-shell-orb-a" />
      <div className="auth-shell-orb auth-shell-orb-b" />
      <div className="auth-shell-orb auth-shell-orb-c" />

      <header className="auth-shell-header">
        <Link to="/login" className="auth-shell-brand">
          <img src={logo} alt="Budget Zen logo" className="auth-shell-brand-logo" />
          <div>
            <p className="auth-shell-brand-title">Budget Zen</p>
            <p className="auth-shell-brand-copy">Your calm money workspace</p>
          </div>
        </Link>

        <nav className="auth-shell-nav">
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
        </nav>
      </header>

      <main className="auth-shell-grid">
        <section className="auth-hero-card">
          <p className="auth-section-eyebrow">{eyebrow}</p>
          <h1 className="auth-hero-title">{title}</h1>
          <p className="auth-hero-copy">{copy}</p>

          <div className="auth-metric-card">
            <div className="auth-metric-header">
              <div>
                <p className="auth-metric-label">{statLabel}</p>
                <p className="auth-metric-value">{statValue}</p>
              </div>
              <span className="auth-metric-pill">Live</span>
            </div>
            <div className="auth-chart-frame">{chart}</div>
          </div>

          {bottomCard ? <div className="auth-bottom-card">{bottomCard}</div> : null}
        </section>

        <section className="auth-form-card">
          <h2 className="auth-form-title">{formTitle}</h2>
          <p className="auth-form-copy">{formCopy}</p>

          {error ? <p className="auth-form-error">{error}</p> : null}

          <div className="auth-social-row">{socialButtons}</div>

          <div className="auth-divider">
            <span>{dividerLabel}</span>
          </div>

          {form}
          {footer}
        </section>
      </main>
    </div>
  );
}
