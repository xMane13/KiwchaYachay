import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../contexts/FavoritesContext';
import {
  Heart, Download, User, Calendar,
  FileText, Video, Presentation, File,
} from 'lucide-react';

interface Material {
  id: number;
  title: string;
  description: string;
  type: 'worksheet' | 'presentation' | 'video' | string;
  author: string;
  createdAt: string;
  downloadUrl?: string;
  video_url?: string;
  thumbnail_url?: string;  // <--- este es el campo importante
  rating: number;
  ratingsCount: number;
}

interface MaterialCardProps { material: Material; }

// Util para videos de YouTube
function extractYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v && v.length === 11) return v;
    const paths = u.pathname.split('/');
    for (let i = 0; i < paths.length; i++) {
      if (["embed", "v", "shorts"].includes(paths[i]) && paths[i + 1] && paths[i + 1].length === 11)
        return paths[i + 1];
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

function getYoutubeThumbnail(url?: string): string | null {
  const id = extractYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
  const { t } = useTranslation();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [favLoading, setFavLoading] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'worksheet': return <FileText className="w-5 h-5" />;
      case 'presentation': return <Presentation className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite(material.id)) await removeFromFavorites(material.id);
      else await addToFavorites(material.id);
    } finally { setFavLoading(false); }
  };

  let displayImage: string | null = null;

  // 1. Si es video, usa miniatura de YouTube
  if (material.type === 'video' && material.video_url) {
    displayImage = getYoutubeThumbnail(material.video_url);
  } 
  // 2. Si hay miniatura generada en el backend (para PDFs/fichas/presentaciones)
  else if (material.thumbnail_url) {
    displayImage = material.thumbnail_url;
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="relative">
        {displayImage ? (
          <img
            src={displayImage}
            alt={material.title}
            className="w-full h-48 object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <div className="text-gray-400">{getTypeIcon(material.type)}</div>
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {getTypeIcon(material.type)}
            <span className="ml-1">{t(`materials.${material.type}`)}</span>
          </span>
        </div>

        <button
          onClick={handleFavoriteToggle}
          disabled={favLoading}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 z-20"
          aria-label={isFavorite(material.id) ? t('material.removeFromFavorites') : t('material.addToFavorites')}
        >
          <Heart
            className={`w-5 h-5 ${isFavorite(material.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} ${favLoading ? 'animate-pulse' : ''}`}
          />
        </button>

        <Link to={`/materials/${material.id}`} className="absolute inset-0 z-10" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">{material.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{material.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{material.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{material.createdAt ? new Date(material.createdAt).toLocaleDateString() : ""}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < Math.round(material.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                >★</span>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {material.ratingsCount > 0 ? `(${material.rating.toFixed(2)})` : '(0)'}
            </span>
          </div>
          {material.downloadUrl && material.type !== 'video' && (
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.open(material.downloadUrl, '_blank');
              }}
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">{t('material.downloadFile')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
