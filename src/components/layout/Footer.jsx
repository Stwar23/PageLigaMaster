import React from 'react';

const Footer = () => (
  <footer className="bg-background/80 border-t border-primary/30 py-8 mt-16">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
      <div className="flex justify-center items-center space-x-2 mb-2">
        <img-replace src="/zonanorte-logo.svg" alt="Zona Norte Mini Logo" className="h-8 w-8" />
        <p className="font-orbitron text-lg text-primary">Zona Norte</p>
      </div>
      <p className="text-sm italic">"Fortuna favet audacibus"</p>
      <p className="text-xs mt-4">&copy; {new Date().getFullYear()} Zona Norte. Todos los derechos reservados.</p>
      <p className="text-xs mt-1">Diseñado con <span className="text-primary">⚽</span> por Hostinger Horizons</p>
    </div>
  </footer>
);

export default Footer;