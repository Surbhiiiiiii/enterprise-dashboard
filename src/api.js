// API utility with JWT token attachment
// In production, set REACT_APP_API_URL in your .env.production or Vercel env vars
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Retries a fetch call up to `retries` times on network failure (e.g. Render cold start).
 * Waits `delayMs` ms between attempts and calls onRetry(attempt) before each retry.
 * Default: 6 retries × 8s = up to 48s window (covers Render free-tier cold start).
 */
async function fetchWithRetry(url, options = {}, retries = 6, delayMs = 8000, onRetry = null) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      // Catch any network-level TypeError (covers Chrome "Failed to fetch",
      // Firefox "NetworkError when attempting to fetch resource.", CORS failures, etc.)
      const isNetworkError = err instanceof TypeError;
      if (isNetworkError && attempt <= retries) {
        if (onRetry) onRetry(attempt, retries);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        if (isNetworkError) {
          throw new Error(
            "Cannot reach the server after several attempts. The backend may be down — please try again in a minute."
          );
        }
        throw err;
      }
    }
  }
}

export function getToken() {
  return sessionStorage.getItem("token") || "";
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem("token");
}

// ── Auth API ─────────────────────────────────────────────────────────────────
export async function apiRegister(data, onRetry) {
  const res = await fetchWithRetry(
    `${API_BASE}/auth/register`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
    3, 5000, onRetry
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Registration failed");
  return json;
}

export async function apiVerifyOtp(email, otp, onRetry) {
  const res = await fetchWithRetry(
    `${API_BASE}/auth/verify-otp`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }) },
    3, 5000, onRetry
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "OTP verification failed");
  return json;
}

export async function apiResendOtp(email, onRetry) {
  const res = await fetchWithRetry(
    `${API_BASE}/auth/resend-otp`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) },
    3, 5000, onRetry
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Resend failed");
  return json;
}

export async function apiLogin(username, password, onRetry) {
  const res = await fetchWithRetry(
    `${API_BASE}/auth/login`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) },
    3, 5000, onRetry
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Login failed");
  return json;
}

// ── Protected API ─────────────────────────────────────────────────────────────
export async function apiGetDashboard() {
  const res = await fetch(`${API_BASE}/api/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) { clearSession(); window.location.href = "/login"; }
  return res.ok ? res.json() : null;
}

export async function apiGetAlerts() {
  const res = await fetch(`${API_BASE}/api/alerts`, {
    headers: getAuthHeaders(),
  });
  return res.ok ? res.json() : [];
}

export async function apiGetHistory() {
  const res = await fetch(`${API_BASE}/api/history`, {
    headers: getAuthHeaders(),
  });
  return res.ok ? res.json() : [];
}

export async function apiRunAnalysis(formData) {
  const res = await fetch(`${API_BASE}/run`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Analysis failed");
  return json;
}

export async function apiClearAlerts() {
  const res = await fetch(`${API_BASE}/admin/clear-alerts`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Failed to clear alerts");
  return json;
}