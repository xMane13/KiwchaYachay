import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';
import MaterialCard from '../components/MaterialCard';
import Pagination from '../components/Pagination';
import { getMaterialDetail } from '../api/materials';

const Favorites: React.FC = () => {
  const { t } = useTranslation();
  const { favoritos } = useFavorites(); // [{id, material (id), ...}]
  const { token } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (!token || favoritos.length === 0) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    Promise.all(
      favoritos.map(fav =>
        getMaterialDetail(fav.material, token).catch(() => null)
      )
    ).then(results => {
      if (!isMounted) return;
setMaterials(
  results.filter(Boolean).map((mat: any) => ({
    id: mat.id,
    title: mat.titulo || mat.title || '',
    description: mat.descripcion || mat.description || '',
    type: mat.tipo || mat.type || 'worksheet',
    author: mat.usuario_nombre || mat.author || "",
    createdAt: mat.fecha_creacion || mat.createdAt || '',
    downloadUrl: mat.tipo !== 'video' ? (mat.archivo_url || mat.downloadUrl || '') : '',
    thumbnail_url: mat.thumbnail_url || '',
    rating: mat.calificacion_promedio || 0,
    ratingsCount: mat.total_calificaciones || 0,
    video_url: mat.video_url || '',
  }))
);
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [favoritos, token]);

  // Paginación
  const itemsPerPage = 8;
  const totalPages = Math.ceil(materials.length / itemsPerPage);
  const paginatedMaterials = materials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            {t('favorites.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('favorites.subtitle') || 'Tus materiales favoritos guardados'}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('favorites.noFavorites')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('favorites.startBrowsing')}
              </p>
              <a
                href="/materials"
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors duration-200 inline-block"
              >
                {t('home.viewAll')}
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={materials.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
