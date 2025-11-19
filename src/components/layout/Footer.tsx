import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-6 mt-auto border-t border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full">
              {t('app_title')}
            </div>
            <span className="text-sm">
              © {currentYear} All Rights Reserved
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400">Powered by</span>
            <a
              href="https://www.doganconsult.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 transition-all"
            >
              DoganConsult
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
