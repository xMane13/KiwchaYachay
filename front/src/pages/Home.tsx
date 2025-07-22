import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import MaterialCard from '../components/MaterialCard';
import { getAllMaterials } from '../api/materials';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Trae SOLO los 3 materiales más recientes del backend
  useEffect(() => {
    setLoading(true);
    getAllMaterials('', '', 'newest', '', '')
      .then(data => {
const topThree = data.slice(0, 3).map((mat: any) => ({
  id: mat.id,
  title: mat.titulo,
  description: mat.descripcion,
  type: mat.tipo,
  author: mat.usuario_nombre || mat.usuario || 'Desconocido',
  createdAt: mat.fecha_creacion,
  downloadUrl: mat.tipo !== 'video' ? (mat.archivo_url || '') : '',
  thumbnail_url: mat.thumbnail_url || '',
  rating: mat.calificacion_promedio || 0,
  ratingsCount: mat.total_calificaciones || 0,
  video_url: mat.video_url || '',
}));

        setRecentMaterials(topThree);
      })
      .catch(() => setRecentMaterials([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/materials?search=${encodeURIComponent(searchTerm)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.description')}
          </p>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center bg-white rounded-full shadow-lg p-2">
              <Search className="w-6 h-6 text-gray-400 ml-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="flex-1 px-4 py-3 text-lg border-none focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-colors duration-200"
              >
                {t('home.searchButton')}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Recent Materials - SOLO 3 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {t('home.recentlyAdded')}
            </h2>
            <Link 
              to="/materials"
              className="flex items-center text-purple-600 hover:text-purple-700 transition-colors duration-200"
            >
              <span className="mr-2">{t('home.viewAll')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
