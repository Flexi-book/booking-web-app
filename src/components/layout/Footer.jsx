import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto py-8 w-full">
      <div className="max-w-6xl mx-auto px-5 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src="/flexibook-logo.svg" alt="" className="w-5 h-5 object-contain" />
          <span className="font-bold text-gray-800">Flexibook</span>
        </div>
        <p className="text-xs text-gray-400">
          La plataforma líder para gestionar tus citas de manera flexible y profesional en España.
        </p>
        <p className="text-xs text-gray-300">© 2026 Flexibook. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
