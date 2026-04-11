import ExpenseList from "../components/ExpenseList";
import ExpenseChart from "../components/ExpenseChart";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppShell from "../components/AppShell";
import { ContainerScroll } from "../components/ui/ContainerScrollAnimation";
import { useAuth } from "../context/AuthContext";

const dummyExpenses = [
  { _id: "1", amount: 1284.89, category: "Transport", description: "Taxi", date: "2026-03-20" },
  { _id: "2", amount: 752.68, category: "Food", description: "Food", date: "2026-03-20" },
  { _id: "3", amount: 256.16, category: "Shopping", description: "Beauty", date: "2026-03-20" },
  { _id: "4", amount: 952.68, category: "Food", description: "Groceries", date: "2026-03-22" },
  { _id: "5", amount: 1019.68, category: "Shopping", description: "Beauty", date: "2026-03-25" },
  { _id: "6", amount: 1753.92, category: "Shopping", description: "Shopping", date: "2026-03-28" },
];

const trendData = [
  { month: "Mar", income: 5200, spent: 4100 },
  { month: "Apr", income: 7800, spent: 5000 },
  { month: "May", income: 3600, spent: 3100 },
  { month: "Jun", income: 5980.4, spent: 4200 },
  { month: "Jul", income: 7200, spent: 5600 },
  { month: "Aug", income: 2900, spent: 3600 },
];

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

export default function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState(dummyExpenses);

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
  const incomeTotal = trendData.reduce((sum, month) => sum + month.income, 0);
  const savedAmount = incomeTotal - totalSpent;
  const utilization = incomeTotal ? Math.round((totalSpent / incomeTotal) * 100) : 0;
  const firstName = user?.name?.split(" ")[0] || "Kristin";

  const handleEdit = (expense) => alert("Edit: " + expense._id);
  const handleDelete = (id) => setExpenses(expenses.filter((exp) => exp._id !== id));

  const aside = (
    <>
      <div className="dashboard-balance-card">
        <p className="dashboard-balance-label">Balance</p>
        <p className="dashboard-balance-amount">KES {savedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        <div className="dashboard-balance-number-row">
          <span>5894</span>
          <span>6985</span>
          <span>7843</span>
          <span>5624</span>
        </div>
        <p className="dashboard-balance-date">04/26</p>
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
        <div className="dashboard-toolbar">
          <div className="dashboard-toolbar-tabs">
            <button type="button" className="dashboard-toolbar-tab is-active">Income</button>
            <button type="button" className="dashboard-toolbar-tab">Spent</button>
          </div>
          <button type="button" className="dashboard-toolbar-filter">Month</button>
        </div>

        <ContainerScroll
          className="dashboard-hero"
          titleComponent={
            <div className="dashboard-chart-header">
              <div>
                <p className="dashboard-section-eyebrow">Overview</p>
                <h2 className="dashboard-section-title">Income vs spend rhythm</h2>
                <p className="dashboard-hero-caption">
                  A softer, card-driven dashboard inspired by your reference, now adapted to your actual budgeting flow.
                </p>
              </div>
              <div className="dashboard-month-chip is-active">Jun</div>
            </div>
          }
        >
          <div className="dashboard-chart-panel">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--line-start)" stopOpacity={0.26} />
                    <stop offset="100%" stopColor="var(--line-end)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="6 8" vertical={false} />
                <XAxis axisLine={false} dataKey="month" tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 12 }} />
                <YAxis axisLine={false} tickFormatter={(value) => `${value / 1000}k`} tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 12 }} />
                <Tooltip content={<CustomTrendTooltip />} />
                <Area dataKey="income" fill="url(#incomeFill)" stroke="none" />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="var(--line-start)"
                  strokeWidth={4}
                  dot={{ fill: "var(--card-strong)", r: 5, stroke: "var(--line-start)", strokeWidth: 3 }}
                  activeDot={{ r: 7, fill: "var(--card-strong)", stroke: "var(--line-start)", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
              {trendData.map((item) => (
                <span key={item.month} className={`dashboard-month-chip${item.month === "Jun" ? " is-active" : ""}`}>
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </ContainerScroll>

        <div className="dashboard-metric-grid">
          {[
            {
              label: "Monthly income",
              value: `KES ${incomeTotal.toLocaleString()}`,
              copy: "Projected cash-in this cycle",
            },
            {
              label: "Spent so far",
              value: `KES ${totalSpent.toLocaleString()}`,
              copy: `${expenses.length} transactions recorded`,
            },
            {
              label: "Usage rate",
              value: `${utilization}%`,
              copy: `${topCategory?.category || "No"} is leading your spend`,
            },
          ].map((stat, index) => (
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
          <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />

          <div className="dashboard-promo-card">
            <p className="dashboard-section-eyebrow">Transfer money</p>
            <h2 className="dashboard-section-title">Move funds to your bank without losing context.</h2>
            <p className="dashboard-section-copy">
              This space mirrors the illustration-heavy support card from your reference while still fitting a budgeting workflow.
            </p>
            <div className="dashboard-promo-graphic">
              <div className="dashboard-promo-person" />
            </div>
            <div className="dashboard-promo-stats">
              <span>Avg expense: KES {avgExpense}</span>
              <span>Top category: {topCategory?.category || "No data"}</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
