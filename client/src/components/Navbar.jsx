import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
      <Link to="/dashboard" className="font-bold text-lg">Expense Tracker</Link>
      <div className="space-x-4">
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/add-expense" className="hover:underline">Add Expense</Link>
        <Link to="/login" className="hover:underline">Logout</Link>
      </div>
    </nav>
  );
}