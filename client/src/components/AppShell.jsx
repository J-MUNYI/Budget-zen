import { useRef, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { motion } from "framer-motion";
import logo from "../assets/home/budget-zen-logo.png";
import ThemeToggleButton from "./ThemeToggleButton";
import { ShellIcon } from "./ui/AppIcons";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "grid" },
  { label: "Add Expense", path: "/add-expense", icon: "plus" },
  { label: "Wallet", path: "/wallet", icon: "wallet" },
  { label: "Insights", path: "/insights", icon: "chart" },
];

function TextHoverEffect({ text }) {
  const svgRef = useRef(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({ cx: `${cxPercentage}%`, cy: `${cyPercentage}%` });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      <defs>
        <linearGradient id="textGradient" gradientUnits="userSpaceOnUse">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="25%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#24b36b" />
              <stop offset="75%" stopColor="#1f9ce5" />
              <stop offset="100%" stopColor="#5f4bc8" />
            </>
          )}
        </linearGradient>
        <radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>
      <text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        style={{
          fill: "transparent",
          stroke: "var(--border)",
          fontFamily: "helvetica",
          fontSize: "72px",
          fontWeight: 700,
          opacity: hovered ? 0.5 : 0,
          transition: "opacity 0.3s",
        }}
      >
        {text}
      </text>
      <motion.text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        style={{ fill: "transparent", stroke: "var(--accent)", fontFamily: "helvetica", fontSize: "72px", fontWeight: 700 }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>
      <text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.3"
        mask="url(#textMask)"
        style={{ fill: "transparent", fontFamily: "helvetica", fontSize: "72px", fontWeight: 700 }}
      >
        {text}
      </text>
    </svg>
  );
}

export default function AppShell({ title, subtitle, children, aside }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "friend";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="shell-sidebar">
        <div className="shell-brand">
          <img src={logo} alt="Budget Zen logo" className="shell-brand-logo" />
          <div>
            <p className="shell-brand-title">{user?.name || "Budget Zen User"}</p>
            <p className="shell-brand-subtitle">Budget Zen</p>
          </div>
        </div>
        <nav className="shell-nav">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`shell-nav-item${active ? " is-active" : ""}`}
              >
                <span className="shell-nav-icon">
                  <ShellIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="shell-sidebar-promo">
          <div className="shell-promo-illustration">
            <div className="shell-promo-bubble shell-promo-bubble-a" />
            <div className="shell-promo-bubble shell-promo-bubble-b" />
            <div className="shell-promo-card" />
          </div>
          <p className="shell-promo-title">Keep every budget in balance.</p>
          <p className="shell-promo-copy">Switch themes, review trends, and capture expenses in one calm workspace.</p>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-header">
          <div>
            <h1 className="shell-page-title">{title}</h1>
            {subtitle ? <p className="shell-page-subtitle">{subtitle}</p> : null}
          </div>
          <div className="shell-actions">
            <ThemeToggleButton />
            <button type="button" className="shell-icon-button" aria-label="Search">
              <ShellIcon name="chart" />
            </button>
            <button type="button" className="shell-icon-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className={`shell-content${aside ? " has-aside" : ""}`}>
          <main className="shell-primary">{children}</main>
          {aside ? <aside className="shell-secondary">{aside}</aside> : null}
        </div>

        {/* Hover Footer */}
        <footer style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          margin: "24px 16px 16px",
          background: "var(--card)",
          border: "1px solid var(--border)",
        }}>
          {/* Footer top row */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 28px 12px",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={logo} alt="Budget Zen" style={{ width: "28px", height: "28px", borderRadius: "8px" }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>Budget Zen</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>Your calm money workspace</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.target.style.color = "var(--accent)"}
                  onMouseLeave={e => e.target.style.color = "var(--text-muted)"}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "right" }}>
              <p style={{ margin: 0 }}>Welcome back, {firstName}! </p>
              <p style={{ margin: "2px 0 0" }}>© {new Date().getFullYear()} A Muny1verse creation 🤍</p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "var(--border)", margin: "0 28px" }} />

          {/* Hover text animation */}
          <div style={{ height: "120px", marginBottom: "-40px", padding: "0 28px" }}>
            <TextHoverEffect text="Muny1verse" />
          </div>
        </footer>
      </div>
    </div>
  );
}