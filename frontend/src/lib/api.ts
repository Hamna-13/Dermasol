const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const msg = contentType.includes("application/json")
      ? (await res.json())?.detail || "Request failed"
      : await res.text();
    throw new Error(msg);
  }

  return contentType.includes("application/json") ? res.json() : res.text();
}
