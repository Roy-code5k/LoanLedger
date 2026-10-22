import { API_CONFIG } from "../config/api";
import { AuthResponse, Loan, Summary } from "../types/api";

let authToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const timeoutMs = options.timeoutMs || API_CONFIG.TIMEOUT_MS;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      const message =
        data?.error?.message ||
        data?.message ||
        `Request failed with status ${response.status}`;
      const code = data?.error?.code || "REQUEST_FAILED";
      const error: any = new Error(message);
      error.code = code;
      error.status = response.status;
      throw error;
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === "AbortError") {
      const error: any = new Error("Network request timed out. Please check your connection.");
      error.code = "TIMEOUT";
      throw error;
    }
    throw err;
  }
};

export const api = {
  // Auth endpoints
  requestOtp: (phone: string) =>
    request<{ message: string }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    request<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),

  // Loan endpoints
  getLoans: (status?: string) => {
    const query = status && status !== "ALL" ? `?status=${status}` : "";
    return request<Loan[]>(`/loans${query}`, { method: "GET" });
  },

  createLoan: (data: { friendName: string; amount: string; dueDate: string }) =>
    request<Loan>("/loans", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  repayLoan: (loanId: string) =>
    request<Loan>(`/loans/${loanId}/repay`, {
      method: "PATCH",
    }),

  // Summary endpoint
  getSummary: () => request<Summary>("/summary", { method: "GET" }),
};
