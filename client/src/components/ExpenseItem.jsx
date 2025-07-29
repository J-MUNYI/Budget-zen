export default function ExpenseItem({ expense, onEdit, onDelete }) {
  return (
    <div className="flex justify-between items-center border-b py-2">
      <div>
        <div className="font-semibold">{expense.category}</div>
        <div className="text-sm text-gray-500">{expense.description}</div>
        <div className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString()}</div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="font-bold text-blue-600">${expense.amount}</span>
        <button onClick={() => onEdit(expense)} className="text-xs text-green-600 hover:underline">Edit</button>
        <button onClick={() => onDelete(expense._id)} className="text-xs text-red-600 hover:underline">Delete</button>
      </div>
    </div>
  );
}