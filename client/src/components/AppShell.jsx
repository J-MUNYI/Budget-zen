import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import logo from "../assets/home/budget-zen-logo.png";
import ThemeToggleButton from "./ThemeToggleButton";
import { ShellIcon } from "./ui/AppIcons";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "grid" },
  { label: "Add Expense", path: "/add-expense", icon: "plus" },
  { label: "Wallet", path: "/wallet", icon: "wallet" },
  { label: "Insights", path: "/insights", icon: "chart" },
];

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

        <footer className="shell-footer">
          <span>Welcome back, {firstName}.</span>
          <div className="shell-footer-right">
            <span>Budget Zen Est 2025</span>
            <span className="shell-footer-credit">
              A Muny1verse creation <span className="shell-footer-heart" aria-hidden="true">🤍</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
