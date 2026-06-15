import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  API_URL,
  apiFetch,
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchMe,
  patchMe,
  generateInsights,
  testDarajaConnection,
  requestMpesaAccountBalance,
} from "./client";

const u = (path) => `${API_URL}${path}`;

function jsonResponse(body, { ok = true, status = 200, statusText = "OK" } = {}) {
  return {
    ok,
    status,
    statusText,
    text: vi.fn().mockResolvedValue(typeof body === "string" ? body : JSON.stringify(body)),
  };
}

let fetchMock;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("apiFetch", () => {
  it("includes JSON content-type and bearer token when a token is stored", async () => {
    localStorage.setItem("token", "jwt-123");
    fetchMock.mockResolvedValue(jsonResponse({ hello: "world" }));

    const data = await apiFetch("/api/thing");

    expect(data).toEqual({ hello: "world" });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(u("/api/thing"));
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toBe("Bearer jwt-123");
  });

  it("omits the Authorization header when no token is stored", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiFetch("/api/thing");

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("returns an empty object for an empty response body", async () => {
    fetchMock.mockResolvedValue(jsonResponse(""));
    expect(await apiFetch("/api/empty")).toEqual({});
  });

  it("returns an empty object when the body is not valid JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse("<not json>"));
    expect(await apiFetch("/api/bad")).toEqual({});
  });

  it("merges caller-provided headers and passes through method/body", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiFetch("/api/thing", {
      method: "POST",
      body: '{"a":1}',
      headers: { "X-Custom": "yes" },
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.body).toBe('{"a":1}');
    expect(options.headers["X-Custom"]).toBe("yes");
  });

  it("throws using data.message on an error response", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Nope" }, { ok: false, status: 403 })
    );

    await expect(apiFetch("/api/thing")).rejects.toMatchObject({
      message: "Nope",
      status: 403,
      data: { message: "Nope" },
    });
  });

  it("joins an errors array when there is no message", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { errors: [{ msg: "Email required" }, { msg: "Password required" }] },
        { ok: false, status: 400 }
      )
    );

    await expect(apiFetch("/api/thing")).rejects.toThrow("Email required, Password required");
  });

  it("falls back to statusText when no error detail is present", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({}, { ok: false, status: 500, statusText: "Server Error" })
    );

    await expect(apiFetch("/api/thing")).rejects.toThrow("Server Error");
  });
});

describe("api wrappers", () => {
  beforeEach(() => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
  });

  function lastCall() {
    return fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
  }

  it("fetchExpenses GETs the expenses endpoint", async () => {
    await fetchExpenses();
    const [url, options] = lastCall();
    expect(url).toBe(u("/api/expenses"));
    expect(options.method).toBeUndefined();
  });

  it("createExpense POSTs the payload", async () => {
    await createExpense({ amount: 10 });
    const [url, options] = lastCall();
    expect(url).toBe(u("/api/expenses"));
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ amount: 10 }));
  });

  it("updateExpense PUTs to the id-specific endpoint", async () => {
    await updateExpense("abc", { amount: 5 });
    const [url, options] = lastCall();
    expect(url).toBe(u("/api/expenses/abc"));
    expect(options.method).toBe("PUT");
    expect(options.body).toBe(JSON.stringify({ amount: 5 }));
  });

  it("deleteExpense DELETEs the id-specific endpoint", async () => {
    await deleteExpense("abc");
    const [url, options] = lastCall();
    expect(url).toBe(u("/api/expenses/abc"));
    expect(options.method).toBe("DELETE");
  });

  it("fetchMe GETs the current user", async () => {
    await fetchMe();
    expect(lastCall()[0]).toBe(u("/api/user/me"));
  });

  it("patchMe PATCHes the current user", async () => {
    await patchMe({ monthlyIncome: 100 });
    const [url, options] = lastCall();
    expect(url).toBe(u("/api/user/me"));
    expect(options.method).toBe("PATCH");
    expect(options.body).toBe(JSON.stringify({ monthlyIncome: 100 }));
  });

  it("generateInsights sends additionalContext when provided", async () => {
    await generateInsights("save more");
    const [url, options] = lastCall();
    expect(url).toBe(u("/api/insights/generate"));
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ additionalContext: "save more" }));
  });

  it("generateInsights sends an empty object when no context is provided", async () => {
    await generateInsights();
    expect(lastCall()[1].body).toBe(JSON.stringify({}));
  });

  it("testDarajaConnection GETs the daraja test endpoint", async () => {
    await testDarajaConnection();
    expect(lastCall()[0]).toBe(u("/api/mpesa/daraja/test"));
  });

  it("requestMpesaAccountBalance POSTs to the account-balance endpoint", async () => {
    await requestMpesaAccountBalance();
    const [url, options] = lastCall();
    expect(url).toBe(u("/api/mpesa/account-balance"));
    expect(options.method).toBe("POST");
    expect(options.body).toBe("{}");
  });
});

describe("API_URL configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("strips trailing slashes from VITE_API_URL", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "https://api.example.com///");
    const mod = await import("./client");
    expect(mod.API_URL).toBe("https://api.example.com");
  });

  it("defaults to an empty string when VITE_API_URL is unset", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "");
    const mod = await import("./client");
    expect(mod.API_URL).toBe("");
  });
});
