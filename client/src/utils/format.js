// Formats a number as a KES currency string (e.g. 1500 -> "KES 1,500").
// Pass Intl.NumberFormat options to customize (e.g. { maximumFractionDigits: 2 }).
export function formatKES(amount, options) {
  const value = Number(amount);
  return `KES ${options ? value.toLocaleString(undefined, options) : value.toLocaleString()}`;
}
