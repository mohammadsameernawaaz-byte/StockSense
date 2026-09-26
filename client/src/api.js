export const API = "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("stocksenseToken");

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    localStorage.removeItem("stocksenseToken");
    localStorage.removeItem("stocksenseUser");
  }

  return { response, data };
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("stocksenseUser") || "null");
  } catch {
    return null;
  }
}
