import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#5f4bc8", "#ffb62e", "#ff7d33", "#1f9ce5", "#24b36b"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: "var(--card-strong)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        padding: "12px 14px",
        fontSize: "0.8rem",
      }}>
        <p style={{ fontWeight: 700, margin: "0 0 4px", color: "var(--text)" }}>{payload[0].name}</p>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>KES {payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const highest = [...data].sort((a, b) => b.amount - a.amount)[0];
  const progress = total ? Math.round((highest?.amount / total) * 100) : 0;

  return (
    <div className="expense-chart-card">
      <div className="expense-chart-header">
        <div>
          <p className="dashboard-section-eyebrow">Breakdown</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.2rem", marginTop: "6px" }}>Category focus</h2>
        </div>
        <span className="expense-list-pill">{progress}%</span>
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem 0" }}>
          No expense data yet
        </div>
      ) : (
        <>
          <div className="expense-chart-ring">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={92}
                paddingAngle={5}
                stroke="none"
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: "-146px", textAlign: "center", pointerEvents: "none" }}>
            <p style={{ margin: 0, fontSize: "2.3rem", fontWeight: 800 }}>{progress}%</p>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>
              {highest?.category || "No data"}
            </p>
          </div>

          <div className="dashboard-legend-list">
            {data.map((entry, idx) => {
              return (
                <div key={entry.category} className="dashboard-legend-item">
                  <div className="dashboard-legend-main">
                    <div className="dashboard-legend-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="dashboard-legend-label">{entry.category}</span>
                  </div>
                  <span className="dashboard-legend-value">KES {entry.amount.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
