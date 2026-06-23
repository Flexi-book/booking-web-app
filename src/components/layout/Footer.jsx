import React from 'react';
import LogoMark from '../ui/LogoMark';

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto py-8 w-full dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-5 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-1">
          <LogoMark className="w-5 h-5" />
          <span className="font-bold text-gray-800 dark:text-slate-100">Flexibook</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-400">
          La plataforma líder para gestionar tus citas de manera flexible y profesional en España.
        </p>
        <p className="text-xs text-gray-300 dark:text-slate-500">© 2026 Flexibook. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
