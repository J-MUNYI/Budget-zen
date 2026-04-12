import ExpenseList from "../components/ExpenseList";
import ExpenseChart from "../components/ExpenseChart";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LineChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppShell from "../components/AppShell";
import { ContainerScroll } from "../components/ui/ContainerScrollAnimation";
import { useAuth } from "../context/AuthContext";
import { fetchExpenses, deleteExpense } from "../api/client";
import { buildMonthlyBuckets, currentMonthSpent } from "../utils/monthlyTrend";

const cardPalette = ["#5f4bc8", "#1f9ce5", "#ffb62e"];

function CustomTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      style={{
        background: "var(--card-strong)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        padding: "14px 16px",
        boxShadow: "var(--shadow)",
      }}
    >
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8rem" }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ margin: "6px 0 0", fontWeight: 800, color: "var(--text)" }}>
          {entry.name}: KES {Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function MpesaMaskRow({ last4 }) {
  const tail = String(last4 || "").replace(/\D/g, "").slice(-4);
  const lastGroup = tail.length === 4 ? tail : "••••";
  const groups = ["••••", "••••", "••••", lastGroup];
  return (
    <div className="dashboard-balance-number-row">
      {groups.map((g, i) => (
        <span key={`${i}-${g}`}>{g}</span>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [chartMode, setChartMode] = useState("both");
  const [monthCount, setMonthCount] = useState(12);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
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
    return () => {
      cancelled = true;
    };
  }, []);

  const monthlyIncome = user?.monthlyIncome;
  const hasIncome =
    typeof monthlyIncome === "number" && !Number.isNaN(monthlyIncome) && monthlyIncome >= 0;

  const trendRows = useMemo(
    () => buildMonthlyBuckets(expenses, monthCount, hasIncome ? monthlyIncome : null),
    [expenses, monthCount, monthlyIncome, hasIncome]
  );

  const chartRows = useMemo(
    () =>
      trendRows.map((r) => ({
        ...r,
        incomeLine: r.income != null ? r.income : 0,
        spentLine: r.spent,
      })),
    [trendRows]
  );

  const chartData = Object.values(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = acc[exp.category] || { category: exp.category, amount: 0 };
      acc[exp.category].amount += Number(exp.amount);
      return acc;
    }, {})
  );

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const avgExpense = expenses.length ? (totalSpent / expenses.length).toFixed(2) : 0;
  const topCategory = [...chartData].sort((a, b) => b.amount - a.amount)[0];
  const cmSpent = currentMonthSpent(expenses);
  const utilization =
    hasIncome && monthlyIncome > 0 ? Math.min(100, Math.round((cmSpent / monthlyIncome) * 100)) : null;

  const firstName = user?.name?.split(" ")[0] || "friend";
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
  const currentMonthRow = trendRows.find((r) => r.key === currentKey);
  const headerMonthLabel = currentMonthRow?.month || trendRows[trendRows.length - 1]?.month || "";

  const handleEdit = useCallback(
    (expense) => navigate(`/add-expense/${expense._id}`),
    [navigate]
  );

  const handleDelete = useCallback(async (expense) => {
    const label = expense.description || expense.category || "this expense";
    const confirmed = window.confirm(`Delete "${label}"? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

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
      ? {
          label: "Monthly income",
          value: `KES ${monthlyIncome.toLocaleString()}`,
          copy: "Baseline from Wallet (optional for everyone)",
        }
      : {
          label: "Monthly income",
          value: "Not set",
          copy: (
            <>
              Optional.{" "}
              <Link to="/wallet" style={{ color: "var(--accent)" }}>
                Add in Wallet
              </Link>{" "}
              if you want income on the chart.
            </>
          ),
        },
    {
      label: "Total spent",
      value: `KES ${totalSpent.toLocaleString()}`,
      copy: `${expenses.length} transactions recorded`,
    },
    utilization != null
      ? {
          label: "Usage (this month)",
          value: `${utilization}%`,
          copy: "Spend this month vs your income baseline",
        }
      : {
          label: "Spent this month",
          value: `KES ${cmSpent.toLocaleString()}`,
          copy: hasIncome
            ? "Income is set; usage rate appears when the month compares cleanly."
            : "Without income tracking, pair this with your M-Pesa balance in Wallet.",
        },
  ];

  const aside = (
    <>
      <div className="dashboard-balance-card">
        <p className="dashboard-balance-label">M-Pesa</p>
        <p className="dashboard-balance-amount">
          KES {mpesaBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <MpesaMaskRow last4={user?.mpesaPhoneLast4} />
        <p className="dashboard-balance-date" style={{ marginTop: "8px" }}>
          <Link to="/wallet" style={{ color: "inherit", textDecoration: "underline", opacity: 0.85 }}>
            Update balance in Wallet
          </Link>
        </p>
        <div className="dashboard-balance-toggle" />
      </div>
      <ExpenseChart data={chartData} />
    </>
  );

  return (
    <AppShell
      title={`Hello, ${firstName}!`}
      subtitle="Welcome back! Here's a calmer view of your money flow today."
      aside={aside}
    >
      <div className="dashboard-main">
        {loadError ? (
          <p style={{ color: "#ff6157", marginBottom: "12px" }}>{loadError}</p>
        ) : null}
        {actionError ? (
          <p style={{ color: "#ff6157", marginBottom: "12px" }}>{actionError}</p>
        ) : null}
        <div className="dashboard-toolbar">
          <div className="dashboard-toolbar-tabs">
            <button
              type="button"
              className={`dashboard-toolbar-tab${chartMode === "income" ? " is-active" : ""}`}
              onClick={() => setChartMode("income")}
            >
              Income
            </button>
            <button
              type="button"
              className={`dashboard-toolbar-tab${chartMode === "spent" ? " is-active" : ""}`}
              onClick={() => setChartMode("spent")}
            >
              Spent
            </button>
            <button
              type="button"
              className={`dashboard-toolbar-tab${chartMode === "both" ? " is-active" : ""}`}
              onClick={() => setChartMode("both")}
            >
              Both
            </button>
          </div>
          <label className="dashboard-toolbar-filter" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              }}
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
            </select>
          </label>
        </div>

        <ContainerScroll
          className="dashboard-hero"
          titleComponent={
            <div className="dashboard-chart-header">
              <div>
                <p className="dashboard-section-eyebrow">Overview</p>
                <h2 className="dashboard-section-title">Income vs spend rhythm</h2>
                <p className="dashboard-hero-caption">
                  Toggle Income, Spent, or Both; change the range to fill in missing months from your data.
                </p>
              </div>
              <div className="dashboard-month-chip is-active">{headerMonthLabel || "This month"}</div>
            </div>
          }
        >
          <div className="dashboard-chart-panel">
            {chartMode === "income" && !hasIncome ? (
              <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                <p style={{ marginBottom: "0.75rem" }}>You have not set a monthly income yet.</p>
                <p style={{ fontSize: "0.9rem" }}>
                  <Link to="/wallet" style={{ color: "var(--accent)" }}>
                    Open Wallet
                  </Link>{" "}
                  to add an optional baseline, or switch to <strong>Spent</strong> to see outflows only.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartRows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="6 8" vertical={false} />
                  <XAxis axisLine={false} dataKey="month" tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 11 }} />
                  <YAxis
                    axisLine={false}
                    tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : `${value}`)}
                    tickLine={false}
                    tick={{ fill: "var(--text-soft)", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  {showIncomeSeries ? (
                    <Line
                      type="monotone"
                      dataKey="incomeLine"
                      name="Income"
                      stroke="var(--line-start)"
                      strokeWidth={3}
                      dot={{ fill: "var(--card-strong)", r: 4, stroke: "var(--line-start)", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "var(--card-strong)", stroke: "var(--line-start)", strokeWidth: 2 }}
                    />
                  ) : null}
                  {showSpentSeries ? (
                    <Line
                      type="monotone"
                      dataKey="spentLine"
                      name="Spent"
                      stroke="#24b36b"
                      strokeWidth={3}
                      dot={{ fill: "var(--card-strong)", r: 4, stroke: "#24b36b", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "var(--card-strong)", stroke: "#24b36b", strokeWidth: 2 }}
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
              {trendRows.map((item) => (
                <span
                  key={item.key}
                  className={`dashboard-month-chip${item.key === currentKey ? " is-active" : ""}`}
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </ContainerScroll>

        <div className="dashboard-metric-grid">
          {statCards.map((stat, index) => (
            <div key={stat.label} className="dashboard-stat-card">
              <p className="dashboard-stat-label">{stat.label}</p>
              <p className="dashboard-stat-value" style={{ color: cardPalette[index] }}>
                {stat.value}
              </p>
              <p className="dashboard-stat-copy">{stat.copy}</p>
            </div>
          ))}
        </div>

        <div className="dashboard-lower-grid">
          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />

          <div className="dashboard-promo-card">
            <p className="dashboard-section-eyebrow">Insights</p>
            <h2 className="dashboard-section-title">AI summary and coaching</h2>
            <p className="dashboard-section-copy">
              Generate analysis, a proper written summary, and practical advice from your recorded expenses — with
              optional context you control.
            </p>
            <div className="dashboard-promo-graphic">
              <div className="dashboard-promo-person" />
            </div>
            <div className="dashboard-promo-stats">
              <Link to="/insights" style={{ color: "var(--accent)", fontWeight: 700 }}>
                Open Insights →
              </Link>
              <span style={{ marginLeft: "12px" }}>
                Avg expense: KES {avgExpense} · Top: {topCategory?.category || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
