import ExpenseItem from "./ExpenseItem";

export default function ExpenseList({ expenses, onEdit, onDelete, loading }) {
  return (
    <div className="expense-list-card">
      <div className="expense-list-header">
        <div>
          <p className="dashboard-section-eyebrow">Recent activities</p>
          <h2 className="dashboard-section-title" style={{ fontSize: "1.2rem", marginTop: "6px" }}>Recent Expenses</h2>
        </div>
        <span className="expense-list-pill">
          {loading ? "…" : `${expenses.length} ${expenses.length === 1 ? "entry" : "entries"}`}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
          <p>Loading your entries…</p>
        </div>
      ) : expenses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>💸</div>
          <p>No expenses recorded yet.</p>
          <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Add your first expense to get started.</p>
        </div>
      ) : (
        <div className="expense-list-body">
          {expenses.map((exp) => (
            <ExpenseItem key={exp._id} expense={exp} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
