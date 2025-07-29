import Navbar from "../components/Navbar";
import ExpenseList from "../components/ExpenseList";
import ExpenseChart from "../components/ExpenseChart";
import { useState } from "react";

// Dummy data for now
const dummyExpenses = [
  { _id: "1", amount: 20, category: "Food", description: "Lunch", date: "2024-06-01" },
  { _id: "2", amount: 50, category: "Transport", description: "Taxi", date: "2024-06-02" },
  { _id: "3", amount: 100, category: "Shopping", description: "Clothes", date: "2024-06-03" },
];

export default function Dashboard() {
  const [expenses, setExpenses] = useState(dummyExpenses);

  // For chart
  const chartData = Object.values(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = acc[exp.category] || { category: exp.category, amount: 0 };
      acc[exp.category].amount += Number(exp.amount);
      return acc;
    }, {})
  );

  const handleEdit = (expense) => {
    // To be implemented
    alert("Edit: " + expense._id);
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(exp => exp._id !== id));
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <ExpenseChart data={chartData} />
        <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}