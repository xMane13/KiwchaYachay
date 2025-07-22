import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Kichwa Yachay</span>
            </div>
            <p className="text-gray-300 max-w-md">
              {t('home.description')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.about')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/materials" className="text-gray-300 hover:text-white transition-colors duration-200">
                  {t('nav.materials')}
                </Link>
              </li>
              <li>
                <button className="text-gray-300 hover:text-white transition-colors duration-200">
                  {t('footer.contact')}
                </button>
              </li>
              <li>
                <button className="text-gray-300 hover:text-white transition-colors duration-200">
                  {t('footer.help')}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.terms')}</h3>
            <ul className="space-y-2">
              <li>
                <button className="text-gray-300 hover:text-white transition-colors duration-200">
                  {t('footer.terms')}
                </button>
              </li>
              <li>
                <button className="text-gray-300 hover:text-white transition-colors duration-200">
                  {t('footer.privacy')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Kichwa Yachay. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;