const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, "") : "";

export { API_URL };

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message =
      data.message ||
      (Array.isArray(data.errors) && data.errors.map((e) => e.msg).join(", ")) ||
      res.statusText ||
      "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function fetchExpenses() {
  return apiFetch("/api/expenses");
}

export async function createExpense(payload) {
  return apiFetch("/api/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateExpense(id, payload) {
  return apiFetch(`/api/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteExpense(id) {
  return apiFetch(`/api/expenses/${id}`, { method: "DELETE" });
}

export async function fetchMe() {
  return apiFetch("/api/user/me");
}

export async function patchMe(payload) {
  return apiFetch("/api/user/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function generateInsights(additionalContext) {
  return apiFetch("/api/insights/generate", {
    method: "POST",
    body: JSON.stringify(
      additionalContext ? { additionalContext } : {}
    ),
  });
}

export async function testDarajaConnection() {
  return apiFetch("/api/mpesa/daraja/test");
}

export async function requestMpesaAccountBalance() {
  return apiFetch("/api/mpesa/account-balance", { method: "POST", body: "{}" });
}
