import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMyFavorites, addFavorite, deleteFavorite } from '../api/favorites';
import { useAuth } from './AuthContext';

interface FavoritoObj {
  id: number;
  material: number;
  fecha_agregado: string;
}

interface FavoritesContextType {
  favoritos: FavoritoObj[];
  isFavorite: (materialId: number) => boolean;
  addToFavorites: (materialId: number) => Promise<void>;
  removeFromFavorites: (materialId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [favoritos, setFavoritos] = useState<FavoritoObj[]>([]);
  const [loading, setLoading] = useState(false);

  // Al cargar o cambiar usuario, actualiza favoritos
  useEffect(() => {
    if (!token) {
      setFavoritos([]);
      return;
    }
    setLoading(true);
    getMyFavorites(token)
      .then(setFavoritos)
      .catch(() => setFavoritos([]))
      .finally(() => setLoading(false));
  }, [token]);

  const isFavorite = (materialId: number) => {
    return favoritos.some(fav => fav.material === materialId);
  };

  const addToFavorites = async (materialId: number) => {
    if (!token) return;
    const nuevo = await addFavorite(materialId, token);
    setFavoritos(prev => [...prev, nuevo]);
  };

  const removeFromFavorites = async (materialId: number) => {
    if (!token) return;
    const favorito = favoritos.find(fav => fav.material === materialId);
    if (!favorito) return;
    await deleteFavorite(favorito.id, token);
    setFavoritos(prev => prev.filter(fav => fav.id !== favorito.id));
  };

  return (
    <FavoritesContext.Provider value={{ favoritos, isFavorite, addToFavorites, removeFromFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
