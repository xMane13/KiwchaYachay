// src/api/materials.ts

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Helper para convertir File a base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Quita el prefijo data:...;base64,
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Función para subir material (como JSON con archivo en base64)
export async function uploadMaterial(
  fields: {
    titulo: string,
    descripcion?: string,
    tipo: string,
    archivo?: File,
    video_url?: string,
  },
  token: string
) {
  let archivo_blob, archivo_nombre, archivo_tipo;

  if (fields.archivo) {
    archivo_blob = await fileToBase64(fields.archivo);
    archivo_nombre = fields.archivo.name;
    archivo_tipo = fields.archivo.type;
  }

  const payload = {
    titulo: fields.titulo,
    descripcion: fields.descripcion || "",
    tipo: fields.tipo,
    archivo_blob,
    archivo_nombre,
    archivo_tipo,
    video_url: fields.video_url || null,
  };

  const res = await fetch(`${API_URL}/materiales/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.detail ||
        data.non_field_errors?.[0] ||
        data.error ||
        "Upload failed"
      );
    }
    return data;
  } else {
    const text = await res.text();
    throw new Error(text || "Unexpected error");
  }
}

// Obtener todos los materiales (sin filtro por usuario)
export async function getAllMaterials(
  type: string = '',
  author: string = '',
  sort: string = 'newest',
  startDate: string = '',
  endDate: string = '',
  token: string = '' // Si no hay token, se puede dejar vacío
) {
  const url = new URL(`${API_URL}/materiales/`);

  if (type) url.searchParams.append('tipo', type);
  if (author) url.searchParams.append('usuario', author);
  if (sort && sort !== 'newest') url.searchParams.append('ordering', sort);
  if (startDate) url.searchParams.append('fecha_creacion__gte', startDate);
  if (endDate) url.searchParams.append('fecha_creacion__lte', endDate);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!res.ok) throw new Error('Error loading materials');

  return await res.json();
}

// Obtener materiales del usuario autenticado
export async function getMyMaterials(
  type: string = '',
  author: string = '',
  sort: string = 'newest',
  startDate: string = '',
  endDate: string = '',
  token: string
) {
  const url = new URL(`${API_URL}/materiales/`);

  if (type) url.searchParams.append('tipo', type);
  if (author) url.searchParams.append('usuario', author);
  if (sort && sort !== 'newest') url.searchParams.append('ordering', sort);
  if (startDate) url.searchParams.append('fecha_creacion__gte', startDate);
  if (endDate) url.searchParams.append('fecha_creacion__lte', endDate);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Error loading materials');

  return await res.json();
}

// Eliminar un material por ID
export async function deleteMaterial(id: number | string, token: string) {
  const res = await fetch(`${API_URL}/materiales/${id}/`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error deleting material");
  // DRF responde 204 sin contenido si todo bien
}

// Obtener detalle de un material por ID
export async function getMaterialDetail(id: number | string, token?: string) {
  const headers: { [key: string]: string } = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/materiales/${id}/`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) throw new Error("Error loading material detail");
  return await res.json();
}
