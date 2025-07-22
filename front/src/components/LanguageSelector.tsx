import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'kw', name: 'Kichwa', flag: '🌱', disabled: true }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode !== 'kw') {
      i18n.changeLanguage(languageCode);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
          {languages.map((language) => (
            <div key={language.code} className="relative">
              <button
                onClick={() => handleLanguageChange(language.code)}
                disabled={language.disabled}
                className={`w-full flex items-center space-x-2 px-4 py-2 text-sm transition-colors duration-200 ${
                  language.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                } ${i18n.language === language.code ? 'bg-purple-50 text-purple-600' : ''}`}
              >
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </button>
              {language.disabled && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                    {t('nav.comingSoon')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;