import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ShieldX } from 'lucide-react';

const Error403: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldX className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h1 className="mt-6 text-6xl font-extrabold text-gray-900">403</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {t('errors.403.title')}
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {t('errors.403.message')}
          </p>
        </div>
        
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            {t('errors.403.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error403;