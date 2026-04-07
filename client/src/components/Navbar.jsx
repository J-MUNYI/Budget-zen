import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#020617",
        borderBottom: "1px solid rgba(250, 204, 21, 0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "50%",
              backgroundColor: "#facc15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              fontWeight: 800,
              fontSize: "14px",
              letterSpacing: "0.05em",
            }}
          >
            BZ
          </div>
          <span
            style={{
              color: "#facc15",
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.05em",
            }}
          >
            Budget Zen
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* User greeting */}
          {user && (
            <span style={{ fontSize: "0.8rem", color: "#6b7280", marginRight: "8px" }}>
              Hey,{" "}
              <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                {user.name?.split(" ")[0] || "there"}
              </span>
            </span>
          )}

          <Link
            to="/dashboard"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s",
              backgroundColor: isActive("/dashboard")
                ? "rgba(250, 204, 21, 0.15)"
                : "transparent",
              color: isActive("/dashboard") ? "#facc15" : "#9ca3af",
              border: isActive("/dashboard")
                ? "1px solid rgba(250, 204, 21, 0.3)"
                : "1px solid transparent",
            }}
          >
            Dashboard
          </Link>

          <Link
            to="/add-expense"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s",
              backgroundColor: isActive("/add-expense")
                ? "rgba(250, 204, 21, 0.15)"
                : "transparent",
              color: isActive("/add-expense") ? "#facc15" : "#9ca3af",
              border: isActive("/add-expense")
                ? "1px solid rgba(250, 204, 21, 0.3)"
                : "1px solid transparent",
            }}
          >
            + Add Expense
          </Link>

          <button
            onClick={handleLogout}
            style={{
              marginLeft: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: "transparent",
              color: "#6b7280",
              border: "1px solid rgba(107, 114, 128, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.borderColor = "rgba(107, 114, 128, 0.3)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}