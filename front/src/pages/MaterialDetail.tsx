import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getMaterialDetail } from '../api/materials';
import { getComments, addComment, deleteComment } from '../api/comments';
import { getRatings, addRating, updateRating } from '../api/rating';
import StarRating from '../components/Rating';
import CommentsSection from '../components/CommentsSection';

const MaterialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user, token } = useAuth();

  const [material, setMaterial] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Ratings
  const [averageRating, setAverageRating] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [userRatingId, setUserRatingId] = useState<number | null>(null);

  // Comentarios
  interface Comment {
    id: number;
    author: string;
    authorEmail?: string;
    content: string;
    createdAt?: string;
  }
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getMaterialDetail(id)
        .then((data) => {
          setMaterial({
            ...data,
            archivo_url: data.archivo_url || '',
            thumbnail_url: data.thumbnail_url || '',
            usuario_nombre: data.usuario_nombre || data.usuario || '',
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const fetchComments = () => {
    if (id) {
      setCommentsLoading(true);
      getComments(Number(id), token || undefined)
        .then((data) => {
          setComments(data.map((c: any) => ({
            id: c.id,
            author: c.nombre_usuario,
            authorEmail: c.usuario_email,
            content: c.texto,
            createdAt: c.fecha,
          })));
          setCommentsLoading(false);
        })
        .catch(() => {
          setComments([]);
          setCommentsLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [id, token]);

  const fetchRatings = () => {
    if (id) {
      getRatings(Number(id), user && token ? token : undefined)
        .then((data) => {
          if (!data || data.length === 0) {
            setAverageRating(0);
            setUserRating(0);
            setUserRatingId(null);
          } else {
            const sum = data.reduce((acc: number, r: any) => acc + r.puntaje, 0);
            setAverageRating(sum / data.length);

            // Rating del usuario actual
            const userCalificacion = user
              ? data.find((r: any) => r.usuario === user.email)
              : null;
            if (userCalificacion) {
              setUserRating(userCalificacion.puntaje);
              setUserRatingId(userCalificacion.id);
            } else {
              setUserRating(0);
              setUserRatingId(null);
            }
          }
        })
        .catch(() => {
          setAverageRating(0);
          setUserRating(0);
          setUserRatingId(null);
        });
    }
  };

  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line
  }, [id, token, user]);

  const handleSendComment = async (comment: string) => {
    if (!user || !token || !id) return;
    try {
      await addComment(Number(id), comment, token);
      fetchComments();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token || !id) return;
    try {
      await deleteComment(commentId, token);
      fetchComments();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRating = async (value: number) => {
    if (!user || !token || !id) return;
    try {
      if (userRatingId) {
        await updateRating(userRatingId, value, Number(id), token);
      } else {
        await addRating(Number(id), value, token);
      }
      fetchRatings();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const isFicha = material?.tipo === 'ficha';
  const isVideo = material?.tipo === 'video';
  const pdfUrl = material?.archivo_url || '';         
  const thumbnailUrl = material?.thumbnail_url || '';
  const videoUrl = material?.video_url || '';

  function getEmbeddedVideoUrl(url: string) {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(youtu\.be\/|v=)([a-zA-Z0-9_-]+)/);
      const code = match ? match[2] : '';
      return code ? `https://www.youtube.com/embed/${code}` : url;
    }
    if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      const code = match ? match[1] : '';
      return code ? `https://player.vimeo.com/video/${code}` : url;
    }
    return url;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("material.not_found")}
          </h1>
          <Link to="/materials" className="text-purple-600 hover:text-purple-700">
            {t("material.back_to_materials")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-0 md:px-10 py-8">
      <div className="max-w-6xl mx-auto w-full">
        <Link to="/materials" className="text-purple-600 hover:text-purple-700 mb-8 block text-base">
          &larr; {t("material.back")}
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12 items-start">
          {/* Columna principal */}
          <div className="flex flex-col items-start w-full max-w-4xl">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-2 mt-4">{material.titulo}</h1>
            <p className="text-gray-700 mb-6 text-lg">{material.descripcion}</p>

            {/* Miniatura PDF */}
            {isFicha && thumbnailUrl && (
              <div className="w-full flex flex-col items-start mb-6">
                <img
                  src={thumbnailUrl}
                  alt={t("material.thumbnail_alt")}
                  className="rounded shadow border bg-gray-100"
                  style={{
                    width: "100%",
                    maxWidth: "800px",
                    height: "auto",
                    maxHeight: "800px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {/* Video grande + Tu calificación */}
            {isVideo && videoUrl && (
              <div className="w-full flex flex-col items-start mb-4">
                <div
                  className="w-full"
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    maxWidth: "100%",
                  }}
                >
                  {videoUrl.endsWith('.mp4') ? (
                    <video
                      controls
                      style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "100%",
                        height: "100%",
                        borderRadius: 8,
                        background: "#000"
                      }}
                      src={videoUrl}
                    />
                  ) : (
                    <iframe
                      src={getEmbeddedVideoUrl(videoUrl)}
                      title={material.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                        borderRadius: 8,
                        background: "#000"
                      }}
                    />
                  )}
                </div>
                {/* Aquí abajo tu calificación */}
                <div className="flex flex-col items-center mt-6 mb-2">
                  <div className="text-xs text-gray-500 mb-1">{t("material.your_rating")}</div>
                  {user ? (
                    <StarRating
                      rating={userRating}
                      onRatingChange={handleRating}
                      readonly={false}
                      size="lg"
                    />
                  ) : (
                    <Link to="/login" className="text-sm italic text-purple-700 hover:underline">
                      {t("material.login_to_rate")}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Si no hay miniatura ni video */}
            {!isVideo && !isFicha && (
              <div className="text-gray-500 italic mb-4">{t("material.no_preview")}</div>
            )}

            {/* Descarga + tu calificación para PDFs */}
            {(pdfUrl && isFicha) && (
              <div className="flex flex-col sm:flex-row items-center gap-8 w-full mt-2 mb-4">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-3 bg-purple-600 text-white text-xl font-semibold rounded hover:bg-purple-700 transition-colors duration-200"
                  download
                >
                  {t("material.download_pdf")}
                </a>
                <div className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{t("material.your_rating")}</div>
                  {user ? (
                    <StarRating
                      rating={userRating}
                      onRatingChange={handleRating}
                      readonly={false}
                      size="lg"
                    />
                  ) : (
                    <Link to="/login" className="text-sm italic text-purple-700 hover:underline">
                      {t("material.login_to_rate")}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Sección comentarios */}
            <div className="w-full">
              {commentsLoading ? (
                <div className="text-center py-6 text-gray-400">
                  {t("comments.loading")}
                </div>
              ) : (
                <CommentsSection
                  comments={comments}
                  onSend={handleSendComment}
                  onDelete={handleDeleteComment}
                  isAuthenticated={!!user}
                  currentUserEmail={user?.email}
                />
              )}
            </div>
          </div>
          {/* Caja derecha info (usuario, fecha, promedio) */}
          <div className="w-full md:w-80 bg-white rounded-xl shadow border border-gray-200 p-7 flex flex-col gap-6 h-fit self-start mt-4">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1 tracking-wider">
                {t("material.uploaded_by")}
              </div>
              <div className="text-base font-bold text-gray-800">
                {material.usuario_nombre || t("material.unknown")}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1 tracking-wider">
                {t("material.date")}
              </div>
              <div className="text-base font-bold text-gray-800">
                {material.fecha_creacion ? new Date(material.fecha_creacion).toLocaleDateString() : ""}
              </div>
            </div>
            <div className="flex flex-col items-center border-t pt-5">
              <div className="text-xs text-gray-500 mb-1">{t("material.average")}</div>
              <StarRating rating={averageRating} readonly size="lg" />
              <span className="text-sm text-gray-600">
                {averageRating > 0 ? averageRating.toFixed(2) : "-"} / 5
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
