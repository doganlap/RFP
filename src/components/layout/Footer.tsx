import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          Powered by{' '}
          <a
            href="https://www.doganconsult.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            DoganConsult
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
