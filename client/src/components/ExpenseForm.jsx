import { useState } from "react";

const categories = ["Food", "Transport", "Shopping", "Bills", "Other"];

const categoryIcons = {
  Food: "🍽",
  Transport: "🚗",
  Shopping: "🛍",
  Bills: "⚡",
  Other: "📦",
};

export default function ExpenseForm({ onSubmit, initialData }) {
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [focused, setFocused] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    onSubmit({ amount, category, description, date });
    setAmount("");
    setCategory("");
    setDescription("");
    setDate("");
  };

  return (
    <div className="expense-form-grid">
      <div className="expense-form-card">
        <p className="expense-form-eyebrow">New entry</p>
        <h2 className="expense-form-title">{initialData ? "Update this expense" : "Record a new expense"}</h2>
        <p className="expense-form-copy">
          Add the amount, tag the category, and choose a date so it drops straight into your refreshed dashboard.
        </p>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="expense-form-row">
            <label className="expense-input-label">Amount (KES)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setFocused("amount")}
              onBlur={() => setFocused("")}
              required
              className="expense-input"
              style={focused === "amount" ? { borderColor: "var(--accent)" } : undefined}
            />
          </div>

          <div className="expense-form-row">
            <label className="expense-input-label">Category</label>
            <div className="expense-category-grid">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`expense-category-pill${category === cat ? " is-active" : ""}`}
                >
                  <span>{categoryIcons[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }}
            >
              <option value="">Select</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="expense-form-row">
            <label className="expense-input-label">Description</label>
            <input
              type="text"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setFocused("description")}
              onBlur={() => setFocused("")}
              className="expense-input"
              style={focused === "description" ? { borderColor: "var(--accent)" } : undefined}
            />
          </div>

          <div className="expense-form-row">
            <label className="expense-input-label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onFocus={() => setFocused("date")}
              onBlur={() => setFocused("")}
              required
              className="expense-input"
              style={focused === "date" ? { borderColor: "var(--accent)" } : undefined}
            />
          </div>

          <button type="submit" className="expense-submit">
            {initialData ? "Update Expense" : "Save Expense"}
          </button>
        </form>
      </div>

      <div className="expense-spotlight-card">
        <div>
          <p className="dashboard-section-eyebrow">Live summary</p>
          <h3 className="expense-aside-title">Review the details before posting.</h3>
          <p className="expense-aside-copy">This summary card helps the add flow feel as deliberate and polished as the new dashboard.</p>
        </div>

        <div className="expense-summary-card">
          <div className="expense-summary-row">
            <div>
              <p className="expense-summary-label">Amount</p>
              <p className="expense-summary-value">KES {amount || "0.00"}</p>
            </div>
            <div>
              <p className="expense-summary-label">Category</p>
              <p className="expense-summary-value" style={{ fontSize: "1.2rem" }}>
                {category || "Choose one"}
              </p>
            </div>
          </div>
        </div>

        <div className="expense-tip-list">
          <p className="expense-tip-item">{description || "Descriptions help you recognize similar purchases later."}</p>
          <p className="expense-tip-item">{date || "Pick a date to place this expense accurately in the monthly trend view."}</p>
        </div>
      </div>
    </div>
  );
}
