import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/home/budget-zen-logo.png";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "grid" },
  { label: "Add Expense", path: "/add-expense", icon: "plus" },
  { label: "Wallet", path: "/dashboard?view=wallet", icon: "wallet", placeholder: true },
  { label: "Insights", path: "/dashboard?view=insights", icon: "chart", placeholder: true },
  { label: "Settings", path: "/dashboard?view=settings", icon: "settings", placeholder: true },
];

function Icon({ name }) {
  const common = {
    fill: "none",
    height: 18,
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    width: 18,
  };

  if (name === "grid") {
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "wallet") {
    return (
      <svg {...common}>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5z" />
        <path d="M16 12h4" />
        <circle cx="16" cy="12" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...common}>
        <path d="M5 19V9" />
        <path d="M12 19V5" />
        <path d="M19 19v-7" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" className="shell-icon-button" onClick={toggleTheme} aria-label="Toggle theme">
      <span className="shell-theme-orb" />
      <span>{theme === "light" ? "Dark" : "Light"}</span>
    </button>
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
            const active = item.placeholder
              ? false
              : location.pathname === item.path;

            return (
              <Link
                key={item.label}
                to={item.placeholder ? location.pathname : item.path}
                className={`shell-nav-item${active ? " is-active" : ""}${item.placeholder ? " is-muted" : ""}`}
              >
                <span className="shell-nav-icon">
                  <Icon name={item.icon} />
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
            <ThemeButton />
            <button type="button" className="shell-icon-button" aria-label="Search">
              <Icon name="chart" />
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

        <footer className="shell-footer">
          <span>Welcome back, {firstName}.</span>
          <span>Budget Zen dashboard experience</span>
        </footer>
      </div>
    </div>
  );
}
