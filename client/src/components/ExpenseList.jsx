import ExpenseItem from "./ExpenseItem";

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (!expenses.length) return <div className="text-center text-gray-500">No expenses found.</div>;
  return (
    <div className="bg-white p-4 rounded shadow max-w-2xl mx-auto mt-4">
      {expenses.map(exp => (
        <ExpenseItem key={exp._id} expense={exp} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}