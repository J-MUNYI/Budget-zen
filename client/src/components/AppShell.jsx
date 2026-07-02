import { useRef, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { motion } from "framer-motion";
import logo from "../assets/home/budget-zen-logo.png";
import ThemeToggleButton from "./ThemeToggleButton";
import { ShellIcon } from "./ui/AppIcons";

const navItems = [
  { label: "Dashboard",   path: "/dashboard",   icon: "grid"   },
  { label: "Add Expense", path: "/add-expense", icon: "plus"   },
  { label: "Wallet",      path: "/wallet",       icon: "wallet" },
  { label: "Insights",    path: "/insights",     icon: "chart"  },
];

export default function AppShell({ title, subtitle, children, aside }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "friend";

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="shell-sidebar">
        {/* Brand */}
        <div className="shell-brand">
          <img src={logo} alt="Budget Zen logo" className="shell-brand-logo" />
          <div>
            <p className="shell-brand-title" style={{ fontFamily: "var(--font-secondary)" }}>
              {user?.name || "Budget Zen"}
            </p>
            <p className="shell-brand-subtitle" style={{ fontFamily: "var(--font-primary)" }}>
              Shilingi Zen
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="shell-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`shell-nav-item${active ? " is-active" : ""}`}
                style={{ fontFamily: "var(--font-primary)" }}
              >
                <span className="shell-nav-icon">
                  <ShellIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar promo — tighter, no wasted height */}
        <div className="shell-sidebar-promo">
          {/* Compact illustration: three stacked stat pills */}
          <div
            style={{
              borderRadius: 20,
              padding: "16px 14px",
              marginBottom: 14,
              background:
                "linear-gradient(145deg, color-mix(in srgb, var(--accent-cool) 22%, var(--card-strong) 78%), color-mix(in srgb, var(--accent) 18%, var(--card-strong) 82%))",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[
              { label: "Income",  value: "KES 85k", color: "var(--accent)"      },
              { label: "Spent",   value: "KES 62k", color: "var(--success)"     },
              { label: "Savings", value: "KES 23k", color: "var(--accent-warm)" },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--card-strong)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "10px 14px",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-primary)" }}>
                  {row.label}
                </span>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: row.color, fontFamily: "var(--font-secondary)" }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <p className="shell-promo-title" style={{ fontFamily: "var(--font-secondary)" }}>
            Keep every budget in balance.
          </p>
          <p className="shell-promo-copy" style={{ fontFamily: "var(--font-primary)" }}>
            Switch themes, review trends, and capture expenses in one calm workspace.
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="shell-main">
        <header className="shell-header">
          <div>
            <h1 className="shell-page-title" style={{ fontFamily: "var(--font-secondary)" }}>{title}</h1>
            {subtitle && (
              <p className="shell-page-subtitle" style={{ fontFamily: "var(--font-primary)" }}>{subtitle}</p>
            )}
          </div>
          <div className="shell-actions">
            <ThemeToggleButton />
            <button
              type="button"
              className="shell-icon-button"
              aria-label="View charts"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              <ShellIcon name="chart" />
            </button>
            <button
              type="button"
              className="shell-icon-button"
              onClick={handleLogout}
              style={{ fontFamily: "var(--font-primary)" }}
            >
              Logout
            </button>
          </div>
        </header>

        <div className={`shell-content${aside ? " has-aside" : ""}`}>
          <main className="shell-primary" id="main-content">{children}</main>
          {aside && <aside className="shell-secondary">{aside}</aside>}
        </div>

        {/* ── Footer — clean, no SZ animation ── */}
        <footer
          style={{
            borderRadius: 24,
            margin: "24px 0 0",
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 24px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={logo}
                alt="Budget Zen"
                style={{ width: 28, height: 28, borderRadius: 8 }}
              />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--font-secondary)" }}>
                  Budget Zen
                </p>
                <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "var(--font-primary)" }}>
                  Your calm money workspace
                </p>
              </div>
            </div>

            {/* Nav links */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    fontFamily: "var(--font-primary)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/privacy"
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  fontFamily: "var(--font-primary)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
              >
                Privacy Policy
              </Link>
            </div>

            {/* Credit */}
            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textAlign: "right", fontFamily: "var(--font-primary)" }}>
              <p style={{ margin: 0 }}>Welcome back, {firstName}!</p>
              <p style={{ margin: "2px 0 0" }}>© {new Date().getFullYear()} A Muny1verse creation 🤍</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}