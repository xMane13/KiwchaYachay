import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import MaterialCard from '../components/MaterialCard';
import Pagination from '../components/Pagination';
import { getAllMaterials } from '../api/materials';

const Materials: React.FC = () => {
  const { t } = useTranslation(); // Hook para traducir
  const [searchParams, setSearchParams] = useSearchParams();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedType, setSelectedType] = useState<string>(''); // Predeterminado vacío
  const [sortBy, setSortBy] = useState<string>('newest'); // Predeterminado 'newest'
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const materialTypes = [
    { value: "", label: t("materials.allTypes") },
    { value: "ficha", label: t("materials.worksheet") },
    { value: "presentacion", label: t("materials.presentation") },
    { value: "video", label: t("materials.video") },
  ];

  const sortOptions = [
    { value: "newest", label: t("materials.filterByNewest") }, 
    { value: "oldest", label: t("materials.filterByOldest") }, 
    { value: "rating", label: t("materials.filterByRating") }, 
    { value: "title", label: t("materials.filterByTitle") }, 
  ];

  function extractYouTubeVideoId(url?: string): string | null {
    if (!url) return null;
    try {
      const u = new URL(url);
      const v = u.searchParams.get("v");
      if (v && v.length === 11) return v;
      const paths = u.pathname.split('/');
      for (let i = 0; i < paths.length; i++) {
        if (
          ["embed", "v", "shorts"].includes(paths[i]) &&
          paths[i + 1] &&
          paths[i + 1].length === 11
        ) {
          return paths[i + 1];
        }
      }
      if (u.hostname === "youtu.be" && paths[1] && paths[1].length === 11) {
        return paths[1];
      }
    } catch {
      const regex = /(?:youtube\.com\/.*(?:v=|\/embed\/|\/v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
      const match = url.match(regex);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  // Actualiza los parámetros de búsqueda en la URL
  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedType) params.set("tipo", selectedType);
    if (sortBy !== "newest") params.set("sort", sortBy);
    setSearchParams(params);  // Actualiza los parámetros en la URL
    setCurrentPage(1);  // Resetear la página cuando se actualizan los filtros
  };

  // Fetch materials when filters change
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const data = await getAllMaterials(
          selectedType,
          "", // autor no es necesario
          sortBy,
          "", // No estamos usando fechas
          "",
          "" // No necesitamos el token aquí
        );

        // Map the materials returned to a usable format
        const mappedMaterials = data.map((item: any) => {
          let thumbnail = '';

          // Si es un video, usamos la miniatura de YouTube
          if (item.tipo === 'video' && item.video_url) {
            thumbnail = `https://img.youtube.com/vi/${extractYouTubeVideoId(item.video_url)}/mqdefault.jpg`;
          } 
          // Si no es video, usamos la miniatura proporcionada por el backend (para fichas, presentaciones, etc.)
          else if (item.thumbnail_url) {
            thumbnail = item.thumbnail_url;
          }

          return {
            id: item.id,
            title: item.titulo,
            description: item.descripcion,
            type: item.tipo,
            author: item.usuario_nombre || item.usuario || t("material.unknown"),
            createdAt: item.fecha_creacion,
            downloadUrl: item.tipo !== 'video' ? (item.archivo_url || '') : '', 
            thumbnail_url: thumbnail || '', 
            rating: typeof item.calificacion_promedio === "number" ? item.calificacion_promedio : 0,
            ratingsCount: item.total_calificaciones || 0, 
            video_url: item.video_url || ''
          };
        });

        setMaterials(mappedMaterials);
      } catch (error) {
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    // Solo ejecutamos si alguno de los filtros ha cambiado
    if (selectedType || sortBy) {
      fetchMaterials();
    }
  }, [selectedType, sortBy]);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || material.type === selectedType;

    return matchesSearch && matchesType;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "rating":
        return b.rating - a.rating;
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedMaterials.length / itemsPerPage);
  const paginatedMaterials = sortedMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("materials.title")}</h1>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <form onSubmit={e => { e.preventDefault(); updateSearchParams(); }} className="mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("materials.searchPlaceholder")}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                >
                  {t("common.search")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <Filter className="w-5 h-5" />
                  <span>{t("common.filter")}</span>
                </button>
              </div>
            </form>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("materials.filterByType")}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {materialTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("materials.filterByDate")}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : sortedMaterials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t("materials.noResults")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedMaterials.map((material) => (
                <div key={material.id} className="relative group">
                  <MaterialCard material={material} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedMaterials.length}
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

export default Materials;
