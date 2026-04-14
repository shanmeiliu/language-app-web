const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function apiUrl(path: string) {
  if (!API_BASE) {
    throw new Error("VITE_API_BASE_URL is not defined");
  }

  return `${API_BASE}${path}`;
}