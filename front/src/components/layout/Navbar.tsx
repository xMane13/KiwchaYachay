import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Globe, User, LogOut, Heart, FileText } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthenticated = !!user && !!token;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-purple-600">Kichwa Yachay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/materials"
              className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
            >
              {t('nav.materials')}
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-materials"
                className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
              >
                {t('nav.myMaterials')}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />

            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}

            {/* Botón Moodle visible siempre */}
            <a
              href="https://moodle.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 px-4 py-2 border border-purple-600 rounded-md text-purple-600 hover:bg-purple-600 hover:text-white transition-colors duration-200 flex items-center space-x-1"
            >
              <Globe className="w-5 h-5" />
              <span>Moodle</span>
            </a>

            {isAuthenticated && (
              <>
                <Link
                  to="/favorites"
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200">
                    <User className="w-5 h-5" />
                    <span>{user?.first_name || user?.email}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/materials"
                className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.materials')}
              </Link>
              {isAuthenticated && (
                <Link
                  to="/my-materials"
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.myMaterials')}
                </Link>
              )}

              <div className="border-t border-gray-200 pt-4">
                <LanguageSelector />
              </div>

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}

              {/* Botón Moodle móvil visible siempre */}
              <a
                href="https://moodle.example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 px-4 py-2 border border-purple-600 rounded-md text-center transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Globe className="w-5 h-5 inline-block mr-1" />
                Moodle
              </a>

              {isAuthenticated && (
                <>
                  <Link
                    to="/favorites"
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    <span>{t('nav.favorites')}</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{t('nav.profile')}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

