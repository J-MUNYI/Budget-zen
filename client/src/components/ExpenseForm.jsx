import { useState } from "react";

const categories = ["Food", "Transport", "Shopping", "Bills", "Other"];

export default function ExpenseForm({ onSubmit, initialData }) {
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.date || "");

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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-md mx-auto">
      <div>
        <label className="block mb-1 font-medium">Amount</label>
        <input
          type="number"
          className="w-full border px-3 py-2 rounded"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Category</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        >
          <option value="">Select</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Date</label>
        <input
          type="date"
          className="w-full border px-3 py-2 rounded"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        {initialData ? "Update Expense" : "Add Expense"}
      </button>
    </form>
  );
}