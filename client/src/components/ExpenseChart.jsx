import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#5f4bc8", "#ffb62e", "#ff7d33", "#1f9ce5", "#24b36b", "#e85d9a"];

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
        <p style={{ fontWeight: 700, margin: "0 0 4px", color: "var(--text)" }}>{payload[0].name || payload[0].payload?.category}</p>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>KES {Number(payload[0].value).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ data }) {
  const [view, setView] = useState("donut");
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const highest = [...data].sort((a, b) => b.amount - a.amount)[0];
  const progress = total ? Math.round((highest?.amount / total) * 100) : 0;

  return (
    <div className="expense-chart-card">
      <div className="expense-chart-header">
        <div>
          <p className="dashboard-section-eyebrow">Breakdown</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.1rem", marginTop: "4px" }}>Category focus</h2>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span className="expense-list-pill">{progress}%</span>
          <button
            type="button"
            onClick={() => setView(v => v === "donut" ? "bar" : "donut")}
            style={{
              background: "var(--card-strong)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "4px 10px",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {view === "donut" ? "Bar" : "Donut"}
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem 0" }}>
          No expense data yet
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === "donut" ? (
            <motion.div
              key="donut"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="expense-chart-ring" style={{ position: "relative" }}>
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
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {data.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "var(--text)" }}
                  >
                    {progress}%
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.75rem" }}
                  >
                    {highest?.category || "—"}
                  </motion.p>
                </div>
              </div>

              <div className="dashboard-legend-list">
                {data.map((entry, idx) => (
                  <div key={entry.category} className="dashboard-legend-item">
                    <div className="dashboard-legend-main">
                      <div className="dashboard-legend-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="dashboard-legend-label">{entry.category}</span>
                    </div>
                    <span className="dashboard-legend-value">KES {entry.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="bar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: "12px" }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="6 8" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--text-soft)", fontSize: 10 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--text-soft)", fontSize: 10 }}
                    tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={700}>
                    {data.map((entry, idx) => (
                      <Cell key={`bar-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="dashboard-legend-list" style={{ marginTop: "8px" }}>
                {data.map((entry, idx) => (
                  <div key={entry.category} className="dashboard-legend-item">
                    <div className="dashboard-legend-main">
                      <div className="dashboard-legend-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="dashboard-legend-label">{entry.category}</span>
                    </div>
                    <span className="dashboard-legend-value">KES {entry.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}