// api/comments.ts

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Crear un nuevo comentario
export async function addComment(materialId: number, content: string, token: string) {
  const res = await fetch(`${API_URL}/comentarios/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ material: materialId, texto: content }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || data.error || "Error adding comment");
  }
  return await res.json();
}

// Actualizar un comentario
export async function updateComment(commentId: number, content: string, token: string) {
  const res = await fetch(`${API_URL}/comentarios/${commentId}/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texto: content }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || data.error || "Error updating comment");
  }
  return await res.json();
}

// Eliminar un comentario
export async function deleteComment(commentId: number, token: string) {
  const res = await fetch(`${API_URL}/comentarios/${commentId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || data.error || "Error deleting comment");
  }
}

//Obtener Comentarios
export async function getComments(materialId: number, token?: string) {
  const url = `${API_URL}/comentarios/?material=${materialId}`;
  const headers: any = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error('Error fetching comments');
  }
  return await res.json();
}
