const categoryConfig = {
  Food: { icon: "🍽", bg: "rgba(255, 142, 74, 0.12)", text: "#ff7d33" },
  Transport: { icon: "🚕", bg: "rgba(31, 156, 229, 0.12)", text: "#1f9ce5" },
  Shopping: { icon: "🛍", bg: "rgba(95, 75, 200, 0.12)", text: "#5f4bc8" },
  Bills: { icon: "⚡", bg: "rgba(81, 214, 138, 0.12)", text: "#24b36b" },
  Other: { icon: "📦", bg: "rgba(255, 182, 46, 0.14)", text: "#ffb62e" },
};

export default function ExpenseItem({ expense, onEdit, onDelete }) {
  const config = categoryConfig[expense.category] || categoryConfig.Other;

  const formattedDate = new Date(expense.date).toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="activity-item">
      <div className="activity-item-main">
        <div className="activity-item-icon" style={{ background: config.bg, color: config.text }}>
          {config.icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="activity-item-title">{expense.description || expense.category}</p>
          <p className="activity-item-copy">{expense.category} • {formattedDate}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <span className="activity-item-amount">
          KES {Number(expense.amount).toLocaleString()}
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => onEdit(expense)}
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "8px 12px",
              borderRadius: "12px",
              cursor: "pointer",
              backgroundColor: "var(--card-strong)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(expense._id)}
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "8px 12px",
              borderRadius: "12px",
              cursor: "pointer",
              backgroundColor: "rgba(255, 97, 87, 0.12)",
              color: "#ff6157",
              border: "1px solid rgba(255, 97, 87, 0.18)",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
