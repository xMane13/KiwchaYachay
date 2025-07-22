// api/ratings.ts

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Obtener ratings de un material
export async function getRatings(materialId: number, token?: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/calificaciones/?material=${materialId}`, { headers });
  if (!res.ok) throw new Error('Error fetching ratings');
  return await res.json();
}

// Calificar un material (crear)
export async function addRating(materialId: number, rating: number, token: string) {
  const res = await fetch(`${API_URL}/calificaciones/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ material: materialId, puntaje: rating }),
  });

  // Si ya existe, debes hacer PUT, entonces puedes manejar aquí un 400/409
  if (res.status === 400 || res.status === 409) {
    const data = await res.json();
    throw new Error(data.detail || data.error || "Ya calificaste este material");
  }

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || data.error || "Error adding rating");
  }
  return await res.json();
}

// Actualizar calificación existente
export async function updateRating(ratingId: number, rating: number, materialId: number, token: string) {
  const res = await fetch(`${API_URL}/calificaciones/${ratingId}/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ puntaje: rating, material: materialId }), // NECESARIO PARA DRF
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || data.error || "Error updating rating");
  }
  return await res.json();
}
