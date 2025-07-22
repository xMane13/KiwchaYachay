import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, BarChart3, FileText, Heart, MessageCircle, Star } from 'lucide-react';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center pt-10">{t('auth.profile.noUser')}</div>;
  }

  const stats = [
    {
      label: t('auth.profile.materialsUploaded'),
      value: user.statistics?.materialsUploaded ?? 0,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: t('auth.profile.favorites'),
      value: user.statistics?.favorites ?? 0,
      icon: Heart,
      color: 'bg-red-100 text-red-600'
    },
    {
      label: t('auth.profile.comments'),
      value: user.statistics?.comments ?? 0,
      icon: MessageCircle,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: t('auth.profile.ratings'),
      value: user.statistics?.ratings ?? 0,
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  // Aquí asumo que recentMaterials viene dentro de user.recent_activity.materials
  const recentMaterials = user.recent_activity?.materials || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-600">{t('auth.profile.title', 'User profile')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('auth.profile.personalInfo')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{t('auth.profile.email')}</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{t('auth.profile.name')}</p>
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{t('auth.profile.joinedOn')}</p>
                    <p className="font-medium">{new Date(user.date_joined).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics and Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                {t('auth.profile.statistics')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Materials */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('auth.profile.recentMaterials', 'Materiales recientes')}
              </h2>
              <div className="space-y-3">
                {recentMaterials.length === 0 ? (
                  <div className="text-gray-400 text-sm">
                    {t('auth.profile.noRecentActivity', 'Sin actividad reciente.')}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-2">
                    {recentMaterials.map((mat: any) => (
                      <li key={mat.id}>
                        <strong>{mat.titulo || mat.title}</strong> -{' '}
                        {mat.fecha_creacion ? new Date(mat.fecha_creacion).toLocaleDateString() : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
