const API_BASE_URL = "";
 
// Decodifica el payload de un JWT (sin verificar firma, solo para leer datos)
function decodeJWT(token: string): Record<string, unknown> {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}
 
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("access_token");
 
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
 
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
 
export async function login(username: string, password: string) {
  const res = await fetch(`/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
 
  if (!res.ok) throw new Error("Credenciales inválidas");
 
  const data = await res.json();
  // data.access y data.refresh son los tokens JWT
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
 
  // El rol viene dentro del payload del JWT
  const payload = decodeJWT(data.access);
  const role = payload["role"] as string ?? "estudiante";
  const user_id = payload["user_id"] as number;
  localStorage.setItem("role", role);
  localStorage.setItem("user_id", String(user_id));
 
  return { ...data, role, user_id };
}
 
export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
}