const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Modelo favorito igual al de tu backend
export interface FavoritoObj {
  id: number;
  material: number;
  fecha_agregado: string;
}

// Obtener todos los favoritos del usuario autenticado
export async function getMyFavorites(token: string): Promise<FavoritoObj[]> {
  const res = await fetch(`${API_URL}/favoritos/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error loading favorites");
  const data = await res.json();
  // Si usas paginación DRF, devuelve data.results
  return data.results ?? data;
}

// Añadir un favorito (por ID de material)
export async function addFavorite(materialId: number, token: string): Promise<FavoritoObj> {
  const res = await fetch(`${API_URL}/favoritos/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ material: materialId }),
  });
  if (!res.ok) {
    // DRF suele devolver error en JSON
    const err = await res.json();
    throw new Error(err.detail || err.error || "Error adding favorite");
  }
  return await res.json();
}

// Eliminar un favorito (por ID del favorito, ¡no del material!)
export async function deleteFavorite(favoritoId: number, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/favoritos/${favoritoId}/`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error deleting favorite");
  // DRF responde 204 (sin contenido)
}
