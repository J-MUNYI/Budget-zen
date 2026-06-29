import ExpenseList from "../components/ExpenseList";
import ExpenseChart from "../components/ExpenseChart";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/useAuth";
import { fetchExpenses, deleteExpense } from "../api/client";
import { buildMonthlyBuckets, currentMonthSpent } from "../utils/monthlyTrend";

const cardPalette = ["#5f4bc8", "#1f9ce5", "#ffb62e"];

// ─── Flywheel ───────────────────────────────────────────────────────────────
const FLYWHEEL_SEGMENTS = [
  { label: "Food",          icon: "🍽", color: "#5f4bc8", pct: 0.22 },
  { label: "Transport",     icon: "🚗", color: "#1f9ce5", pct: 0.18 },
  { label: "Housing",       icon: "🏠", color: "#ffb62e", pct: 0.28 },
  { label: "Fuel",          icon: "⛽", color: "#24b36b", pct: 0.10 },
  { label: "Shopping",      icon: "🛍", color: "#f3659a", pct: 0.14 },
  { label: "Entertainment", icon: "🎬", color: "#e07d3a", pct: 0.08 },
];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

function InsightsFlywheel() {
  const [hovered, setHovered] = useState(null);
  const cx = 110, cy = 110, r = 88, innerR = 44;
  let cursor = 0;

  const segments = FLYWHEEL_SEGMENTS.map((seg) => {
    const startAngle = cursor * 360;
    const endAngle = (cursor + seg.pct) * 360;
    cursor += seg.pct;

    // mid-angle for label placement
    const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
    const labelR = r * 0.68;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    // outer label
    const outerR = r + 22;
    const ox = cx + outerR * Math.cos(midAngle);
    const oy = cy + outerR * Math.sin(midAngle);

    return { ...seg, startAngle, endAngle, lx, ly, ox, oy };
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        marginTop: 18,
        marginBottom: 8,
      }}
    >
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        style={{ overflow: "visible" }}
        aria-label="Spending categories flywheel"
        role="img"
      >
        <defs>
          {segments.map((seg) => (
            <filter key={`glow-${seg.label}`} id={`glow-${seg.label}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Outer ring track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* Segments */}
        {segments.map((seg) => {
          const isHov = hovered === seg.label;
          const gap = 1.8;
          return (
            <g key={seg.label}>
              <path
                d={describeArc(cx, cy, r, seg.startAngle + gap, seg.endAngle - gap)}
                fill={seg.color}
                opacity={isHov ? 1 : 0.82}
                style={{
                  transition: "opacity 0.2s, transform 0.2s",
                  transform: isHov ? `scale(1.04)` : "scale(1)",
                  transformOrigin: `${cx}px ${cy}px`,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(seg.label)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* Segment icon */}
              <text
                x={seg.lx}
                y={seg.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {seg.icon}
              </text>
            </g>
          );
        })}

        {/* Centre hole */}
        <circle cx={cx} cy={cy} r={innerR} fill="var(--card-bg)" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="var(--border)" strokeWidth="1" />

        {/* Centre label */}
        <text
          x={cx} y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="800"
          fontFamily="var(--font-secondary)"
          fill="var(--text)"
        >
          Insights
        </text>
        <text
          x={cx} y={cy + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fontFamily="var(--font-primary)"
          fill="var(--text-muted)"
        >
          by category
        </text>
      </svg>

      {/* Legend grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 16px",
          width: "100%",
        }}
      >
        {segments.map((seg) => (
          <div
            key={seg.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              opacity: hovered && hovered !== seg.label ? 0.45 : 1,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={() => setHovered(seg.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: seg.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-primary)",
              }}
            >
              {seg.label}
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--text)",
                fontFamily: "var(--font-primary)",
              }}
            >
              {Math.round(seg.pct * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function CustomTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--card-strong)",
        border: "1px solid var(--border-strong)",
        borderRadius: 16,
        padding: "12px 16px",
        boxShadow: "var(--shadow)",
        fontFamily: "var(--font-primary)",
      }}
    >
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.76rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
          <p style={{ margin: 0, fontWeight: 800, color: "var(--text)", fontSize: "0.95rem" }}>
            {entry.name}: KES {Number(entry.value).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── M-Pesa mask ─────────────────────────────────────────────────────────────
function MpesaMaskRow({ last4 }) {
  const tail = String(last4 || "").replace(/\D/g, "").slice(-4);
  const lastGroup = tail.length === 4 ? tail : "••••";
  const groups = ["••••", "••••", "••••", lastGroup];
  return (
    <div className="dashboard-balance-number-row">
      {groups.map((g, i) => <span key={`${i}-${g}`}>{g}</span>)}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [chartMode, setChartMode] = useState("both");
  const [monthCount, setMonthCount] = useState(12);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadError(null);
    (async () => {
      try {
        const data = await fetchExpenses();
        if (!cancelled) setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Could not load expenses.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const monthlyIncome = user?.monthlyIncome;
  const hasIncome = typeof monthlyIncome === "number" && !Number.isNaN(monthlyIncome) && monthlyIncome >= 0;

  const trendRows = useMemo(
    () => buildMonthlyBuckets(expenses, monthCount, hasIncome ? monthlyIncome : null),
    [expenses, monthCount, monthlyIncome, hasIncome]
  );

  const chartRows = useMemo(() =>
    trendRows.map((r) => ({
      ...r,
      incomeLine: r.income != null ? r.income : 0,
      spentLine: r.spent,
    })),
    [trendRows]
  );

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const cmSpent = currentMonthSpent(expenses);
  const utilization =
    hasIncome && monthlyIncome > 0 ? Math.min(100, Math.round((cmSpent / monthlyIncome) * 100)) : null;

  const firstName = user?.name?.split(" ")[0] || "friend";
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
  const currentMonthRow = trendRows.find((r) => r.key === currentKey);
  const headerMonthLabel = currentMonthRow?.month || trendRows[trendRows.length - 1]?.month || "";

  const handleEdit = useCallback((expense) => navigate(`/add-expense/${expense._id}`), [navigate]);
  const handleDelete = useCallback(async (expense) => {
    const label = expense.description || expense.category || "this expense";
    if (!window.confirm(`Delete "${label}"? This action cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteExpense(expense._id);
      setExpenses((prev) => prev.filter((exp) => exp._id !== expense._id));
    } catch (err) {
      setActionError(err.message || "Could not delete expense.");
    }
  }, []);

  const mpesaBalance = Number(user?.mpesaBalance ?? 0);
  const showIncomeSeries = hasIncome && chartMode !== "spent";
  const showSpentSeries = chartMode !== "income";

  const statCards = [
    hasIncome
      ? { label: "Monthly Income", value: `KES ${monthlyIncome.toLocaleString()}`, copy: "Income baseline from Wallet" }
      : { label: "Monthly Income", value: "Not set", copy: <><Link to="/wallet" style={{ color: "var(--accent)" }}>Add in Wallet</Link> to track income vs spend.</> },
    { label: "Total Spent", value: `KES ${totalSpent.toLocaleString()}`, copy: `${expenses.length} transactions recorded` },
    utilization != null
      ? { label: "Budget Used", value: `${utilization}%`, copy: "Spend this month vs income" }
      : { label: "Spent This Month", value: `KES ${cmSpent.toLocaleString()}`, copy: "Month-to-date outflows" },
  ];

  const aside = (
    <>
      {/* M-Pesa balance card */}
      <div className="dashboard-balance-card">
        <p className="dashboard-balance-label">M-Pesa Balance</p>
        <p className="dashboard-balance-amount">
          KES {mpesaBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <MpesaMaskRow last4={user?.mpesaPhoneLast4} />
        <p className="dashboard-balance-date" style={{ marginTop: 10 }}>
          <Link to="/wallet" style={{ color: "inherit", textDecoration: "underline", opacity: 0.85, fontFamily: "var(--font-primary)" }}>
            Update in Wallet →
          </Link>
        </p>
      </div>

      {/* Donut chart */}
      <ExpenseChart data={
        Object.values(
          expenses.reduce((acc, exp) => {
            acc[exp.category] = acc[exp.category] || { category: exp.category, amount: 0 };
            acc[exp.category].amount += Number(exp.amount);
            return acc;
          }, {})
        )
      } />
    </>
  );

  return (
    <AppShell
      title={`Hello, ${firstName}!`}
      subtitle="Here's a calm view of your money flow."
      aside={aside}
    >
      <div className="dashboard-main">
        {loadError && <p style={{ color: "#ff6157", marginBottom: 12, fontFamily: "var(--font-primary)" }}>{loadError}</p>}
        {actionError && <p style={{ color: "#ff6157", marginBottom: 12, fontFamily: "var(--font-primary)" }}>{actionError}</p>}

        {/* ── Toolbar ── */}
        <div className="dashboard-toolbar">
          <div className="dashboard-toolbar-tabs">
            {["income", "spent", "both"].map((mode) => (
              <button
                key={mode}
                type="button"
                className={`dashboard-toolbar-tab${chartMode === mode ? " is-active" : ""}`}
                onClick={() => setChartMode(mode)}
                style={{ fontFamily: "var(--font-primary)" }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-primary)" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Range</span>
            <select
              value={monthCount}
              onChange={(e) => setMonthCount(Number(e.target.value))}
              style={{
                background: "var(--card-strong)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "8px 12px",
                color: "var(--text)",
                fontWeight: 600,
                fontFamily: "var(--font-primary)",
                outline: "none",
              }}
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
            </select>
          </label>
        </div>

        {/* ── Chart panel — clean, no ContainerScroll wrapper ── */}
        <div className="dashboard-chart-panel">
          <div className="dashboard-chart-header">
            <div>
              <p className="dashboard-section-eyebrow">Overview</p>
              <h2 className="dashboard-section-title">Income vs spend rhythm</h2>
              <p className="dashboard-hero-caption">
                Toggle Income, Spent, or Both — change range to explore your data.
              </p>
            </div>
            <div className="dashboard-month-chip is-active" style={{ fontFamily: "var(--font-primary)" }}>
              {headerMonthLabel || "This month"}
            </div>
          </div>

          {chartMode === "income" && !hasIncome ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-primary)" }}>
              <p style={{ marginBottom: "0.75rem" }}>No monthly income set yet.</p>
              <p style={{ fontSize: "0.9rem" }}>
                <Link to="/wallet" style={{ color: "var(--accent)" }}>Open Wallet</Link>{" "}
                to add a baseline, or switch to <strong>Spent</strong> to see outflows.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartRows} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--line-start)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--line-start)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#24b36b" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#24b36b" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* Horizontal rules only — no vertical, no border box */}
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  stroke="var(--chart-grid)"
                  strokeDasharray="4 6"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--text-soft)",
                    fontSize: 11,
                    fontFamily: "var(--font-primary)",
                  }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : `${v}`}
                  tick={{
                    fill: "var(--text-soft)",
                    fontSize: 11,
                    fontFamily: "var(--font-primary)",
                  }}
                  width={44}
                />
                <Tooltip content={<CustomTrendTooltip />} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />

                {showIncomeSeries && (
                  <Area
                    type="monotone"
                    dataKey="incomeLine"
                    name="Income"
                    stroke="var(--line-start)"
                    strokeWidth={2.5}
                    fill="url(#gradIncome)"
                    dot={false}
                    activeDot={{ r: 5, fill: "var(--card-strong)", stroke: "var(--line-start)", strokeWidth: 2 }}
                  />
                )}
                {showSpentSeries && (
                  <Area
                    type="monotone"
                    dataKey="spentLine"
                    name="Spent"
                    stroke="#24b36b"
                    strokeWidth={2.5}
                    fill="url(#gradSpent)"
                    dot={false}
                    activeDot={{ r: 5, fill: "var(--card-strong)", stroke: "#24b36b", strokeWidth: 2 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Month chips row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            {trendRows.map((item) => (
              <span
                key={item.key}
                className={`dashboard-month-chip${item.key === currentKey ? " is-active" : ""}`}
                style={{ fontFamily: "var(--font-primary)" }}
              >
                {item.month}
              </span>
            ))}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="dashboard-metric-grid">
          {statCards.map((stat, index) => (
            <div key={stat.label} className="dashboard-stat-card">
              <p className="dashboard-stat-label" style={{ fontFamily: "var(--font-primary)" }}>{stat.label}</p>
              <p className="dashboard-stat-value" style={{ color: cardPalette[index], fontFamily: "var(--font-secondary)" }}>
                {stat.value}
              </p>
              <p className="dashboard-stat-copy" style={{ fontFamily: "var(--font-primary)" }}>{stat.copy}</p>
            </div>
          ))}
        </div>

        {/* ── Lower grid: transactions + insights flywheel ── */}
        <div className="dashboard-lower-grid">
          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />

          <div className="dashboard-promo-card">
            <p className="dashboard-section-eyebrow" style={{ fontFamily: "var(--font-primary)" }}>Insights</p>
            <h2 className="dashboard-section-title" style={{ fontFamily: "var(--font-secondary)" }}>
              AI summary &amp; coaching
            </h2>
            <p className="dashboard-section-copy" style={{ fontFamily: "var(--font-primary)" }}>
              Tap any category to explore spending patterns. Generate analysis and practical advice from your recorded expenses.
            </p>

            {/* Flywheel replaces the old illustration */}
            <InsightsFlywheel />

            <Link
              to="/insights"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 4,
                padding: "13px 20px",
                borderRadius: 18,
                background: "linear-gradient(135deg, var(--accent), var(--accent-warm))",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.9rem",
                textDecoration: "none",
                fontFamily: "var(--font-primary)",
                transition: "opacity 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Generate AI Insights →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}