import ExpenseForm from "../components/ExpenseForm";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";

export default function AddExpense() {
  const navigate = useNavigate();

  const handleAddExpense = (data) => {
    console.log("Expense added:", data);
    navigate("/dashboard");
  };

  return (
    <AppShell
      title="Add Expense"
      subtitle="Capture a new transaction without leaving the refreshed logged-in workspace."
    >
      <div className="expense-page">
        <ExpenseForm onSubmit={handleAddExpense} />
      </div>
    </AppShell>
  );
}
