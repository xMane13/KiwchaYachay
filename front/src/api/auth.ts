const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// ------- Login -------
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await res.json();
}

// ------- Register -------
export async function register(data: any) {
  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// ------- Forgot Password -------
export async function forgotPassword(email: string) {
  const res = await fetch(`${API_URL}/password-reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Network error");
  return await res.json();
}

// ------- Reset Password -------
export async function resetPassword(uid: string, token: string, password: string) {
  const res = await fetch(`${API_URL}/reset-password/${uid}/${token}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Error");
  }
  return await res.json();
}

// ------- Obtener perfil -------
export async function getProfile(token: string) {
  const res = await fetch(`${API_URL}/profile/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener el perfil");
  return await res.json();
}

