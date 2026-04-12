import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm";
import AppShell from "../components/AppShell";
import { createExpense, fetchExpenses, updateExpense } from "../api/client";

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AddExpense() {
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const [existing, setExisting] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loadingExpense, setLoadingExpense] = useState(Boolean(expenseId));

  useEffect(() => {
    if (!expenseId) {
      setExisting(null);
      setLoadError(null);
      setLoadingExpense(false);
      return;
    }

    let cancelled = false;
    setLoadingExpense(true);
    setLoadError(null);

    (async () => {
      try {
        const list = await fetchExpenses();
        if (cancelled) return;
        const found = list.find((e) => e._id === expenseId);
        if (!found) {
          setLoadError("That expense could not be found.");
          setExisting(null);
        } else {
          setExisting(found);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Failed to load expense.");
      } finally {
        if (!cancelled) setLoadingExpense(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [expenseId]);

  const initialData = useMemo(() => {
    if (!existing) return undefined;
    return {
      amount: existing.amount,
      category: existing.category,
      description: existing.description || "",
      date: toInputDate(existing.date),
    };
  }, [existing]);

  const handleSubmit = useCallback(
    async (data) => {
      setSubmitError(null);
      const payload = {
        amount: Number(data.amount),
        category: data.category,
        description: data.description || "",
        date: data.date,
      };

      try {
        if (expenseId) {
          await updateExpense(expenseId, payload);
        } else {
          await createExpense(payload);
        }
        navigate("/dashboard");
      } catch (err) {
        setSubmitError(err.message || "Could not save expense.");
      }
    },
    [expenseId, navigate]
  );

  return (
    <AppShell
      title={expenseId ? "Edit expense" : "Add Expense"}
      subtitle={
        expenseId
          ? "Update the entry and your dashboard totals will follow."
          : "Capture a new transaction without leaving the refreshed logged-in workspace."
      }
    >
      <div className="expense-page">
        {loadError ? (
          <p style={{ color: "#ff6157", marginBottom: "1rem" }}>{loadError}</p>
        ) : null}
        {loadingExpense ? (
          <p style={{ color: "var(--text-muted)" }}>Loading expense…</p>
        ) : expenseId && loadError ? null : (
          <>
            {submitError ? (
              <p style={{ color: "#ff6157", marginBottom: "1rem" }}>{submitError}</p>
            ) : null}
            <ExpenseForm key={expenseId || "new"} onSubmit={handleSubmit} initialData={initialData} />
          </>
        )}
      </div>
    </AppShell>
  );
}
