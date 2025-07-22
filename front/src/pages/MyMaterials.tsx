import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard';
import Pagination from '../components/Pagination';
import { getMyMaterials, deleteMaterial } from '../api/materials';
import ModalConfirm from '../components/ModalConfirm'; 

const MyMaterials: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, id: string | null }>({ open: false, id: null }); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Token no disponible");
        setLoading(false);
        return;
      }

      try {
        const apiMaterials = await getMyMaterials(
          '', '', 'newest', '', '', token
        );

        const mapped = apiMaterials.map((mat: any) => ({
          id: mat.id,
          title: mat.titulo,
          description: mat.descripcion,
          type: mat.tipo,
          author: mat.usuario_nombre || "", // usa nombre real
          createdAt: mat.fecha_creacion,
          downloadUrl: mat.tipo !== 'video' ? (mat.archivo_url || '') : '',
          thumbnail_url: mat.thumbnail_url || "",
          rating: mat.calificacion_promedio || 0,
          ratingsCount: mat.total_calificaciones || 0,
          video_url: mat.video_url || "",
        }));
        setMaterials(mapped);
      } catch (err: any) {
        setError(err.message || "Error cargando materiales");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [token]);

  const openDeleteModal = (id: string) => setDeleteModal({ open: true, id });
  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteMaterial(deleteModal.id, token!);
      setMaterials(materials.filter(material => material.id !== deleteModal.id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar material");
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };
  const cancelDelete = () => setDeleteModal({ open: false, id: null });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(materials.length / itemsPerPage);
  const paginatedMaterials = materials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de confirmación */}
      <ModalConfirm
        open={deleteModal.open}
        title={t('myMaterials.deleteTitle')}
        message={t('myMaterials.deleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('myMaterials.title')}</h1>
            <p className="text-gray-600 mt-2">{t('myMaterials.subtitle')}</p>
          </div>
          <button
            className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
            onClick={() => navigate("/material-upload")}
          >
            <Plus className="w-5 h-5" />
            <span>{t('myMaterials.addNew')}</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3 text-center">
            {error}
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('myMaterials.noMaterials')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('myMaterials.uploadFirst')}
              </p>
              <button
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                onClick={() => navigate("/material-upload")}
              >
                <Plus className="w-5 h-5" />
                <span>{t('myMaterials.addNew')}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedMaterials.map((material) => (
                <div key={material.id} className="relative">
                  <MaterialCard material={material} />
                  <div className="flex space-x-2 mt-4">
                    <Link
                      to={`/materials/${material.id}`}
                      className="bg-white text-gray-700 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => openDeleteModal(material.id)}
                      className="bg-white text-red-600 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
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

export default MyMaterials;
