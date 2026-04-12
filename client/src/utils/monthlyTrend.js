export function buildMonthlyBuckets(expenses, monthCount, monthlyIncome) {
  const now = new Date();
  const rows = [];
  const trackIncome =
    typeof monthlyIncome === "number" && !Number.isNaN(monthlyIncome) && monthlyIncome >= 0;

  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const labelShort = d.toLocaleString("en-KE", { month: "short" });
    const yearShort = String(y).slice(-2);
    let spent = 0;
    for (const e of expenses) {
      const ed = new Date(e.date);
      if (ed.getFullYear() === y && ed.getMonth() === m) spent += Number(e.amount) || 0;
    }
    rows.push({
      key: `${y}-${m}`,
      month: `${labelShort} '${yearShort}`,
      spent,
      income: trackIncome ? monthlyIncome : null,
    });
  }
  return rows;
}

export function currentMonthSpent(expenses) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return expenses.reduce((s, e) => {
    const ed = new Date(e.date);
    if (ed.getFullYear() === y && ed.getMonth() === m) return s + (Number(e.amount) || 0);
    return s;
  }, 0);
}
