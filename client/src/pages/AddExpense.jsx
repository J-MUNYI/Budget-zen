import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";

export default function AddExpense() {
  const handleAddExpense = (data) => {
    // To be implemented: send to backend
    alert("Expense added: " + JSON.stringify(data));
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Add Expense</h1>
        <ExpenseForm onSubmit={handleAddExpense} />
      </div>
    </div>
  );
}