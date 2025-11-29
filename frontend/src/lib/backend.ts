export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("backend_token");
};

export const setToken = (t: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("backend_token", t);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("backend_refresh_token");
};

export const setRefreshToken = (t: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("backend_refresh_token", t);
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("backend_token");
  window.localStorage.removeItem("backend_refresh_token");
};

export async function authLogin(email: string, password: string) {
  const r = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!r.ok) throw new Error("login_failed");
  const data = await r.json();
  if (typeof window !== "undefined") {
    if (data.access_token) setToken(data.access_token);
    if (data.refresh_token) setRefreshToken(data.refresh_token);
  }
  return data;
}

async function tryRefresh() {
  const rt = getRefreshToken();
  if (!rt) return false;
  const r = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt })
  });
  if (!r.ok) {
    clearToken();
    return false;
  }
  const data = await r.json();
  if (data.access_token) setToken(data.access_token);
  if (data.refresh_token) setRefreshToken(data.refresh_token);
  return true;
}

export async function apiGet(path: string) {
  const token = getToken();
  let r = await fetch(`${BACKEND_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (r.status === 401 && (await tryRefresh())) {
    const newToken = getToken();
    r = await fetch(`${BACKEND_URL}${path}`, {
      headers: newToken ? { Authorization: `Bearer ${newToken}` } : {}
    });
  }
  if (!r.ok) throw new Error("request_failed");
  return r.json();
}

export async function apiPost(path: string, body: unknown) {
  const token = getToken();
  let r = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  if (r.status === 401 && (await tryRefresh())) {
    const newToken = getToken();
    r = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}) },
      body: JSON.stringify(body)
    });
  }
  if (!r.ok) throw new Error("request_failed");
  return r.json();
}

export async function apiPatch(path: string, body: unknown) {
  const token = getToken();
  let r = await fetch(`${BACKEND_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  if (r.status === 401 && (await tryRefresh())) {
    const newToken = getToken();
    r = await fetch(`${BACKEND_URL}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}) },
      body: JSON.stringify(body)
    });
  }
  if (!r.ok) throw new Error("request_failed");
  return r.json();
}

export async function apiDelete(path: string) {
  const token = getToken();
  let r = await fetch(`${BACKEND_URL}${path}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (r.status === 401 && (await tryRefresh())) {
    const newToken = getToken();
    r = await fetch(`${BACKEND_URL}${path}`, {
      method: "DELETE",
      headers: newToken ? { Authorization: `Bearer ${newToken}` } : {}
    });
  }
  if (!r.ok) throw new Error("request_failed");
  return r.json();
}

export async function apiUpload(path: string, form: FormData) {
  const token = getToken();
  let r = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form
  });
  if (r.status === 401 && (await tryRefresh())) {
    const newToken = getToken();
    r = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: newToken ? { Authorization: `Bearer ${newToken}` } : undefined,
      body: form
    });
  }
  if (!r.ok) throw new Error("upload_failed");
  return r.json();
}