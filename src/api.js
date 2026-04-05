// API utility with JWT token attachment
const API_BASE = "http://localhost:8000";

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
export async function apiRegister(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Registration failed");
  return json;
}

export async function apiVerifyOtp(email, otp) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "OTP verification failed");
  return json;
}

export async function apiResendOtp(email) {
  const res = await fetch(`${API_BASE}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Resend failed");
  return json;
}

export async function apiLogin(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
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