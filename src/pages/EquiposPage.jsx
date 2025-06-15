import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Users, BarChart2, ArrowLeft } from 'lucide-react';

const EquiposPage = () => {
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    const storedTeams = JSON.parse(localStorage.getItem('clasificacionTeams')) || [
      { id: 1, name: 'Titanes FC', dt: 'Carlos Bianchi', estadio: 'La Bombonera Virtual', logo: 'titanes-fc.svg', plantillaSize: 22, mediaEquipo: 85 },
      { id: 2, name: 'Gladiadores SV', dt: 'Pep Guardiola', estadio: 'Camp Nou Virtual', logo: 'gladiadores-sv.svg', plantillaSize: 24, mediaEquipo: 88 },
      { id: 3, name: 'Furia Roja', dt: 'Diego Simeone', estadio: 'Wanda Virtual', logo: 'furia-roja.svg', plantillaSize: 20, mediaEquipo: 82 },
      { id: 4, name: 'Lobos del Norte', dt: 'Marcelo Gallardo', estadio: 'Monumental Virtual', logo: 'lobos-norte.svg', plantillaSize: 25, mediaEquipo: 86 },
      { id: 5, name: 'Águilas Doradas', dt: 'Jurgen Klopp', estadio: 'Anfield Virtual', logo: 'aguilas-doradas.svg', plantillaSize: 23, mediaEquipo: 87 },
    ];
    setEquipos(storedTeams);
  }, []);

  return (
    <>
      <Link to="/mercado-equipos" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft size={18} className="mr-1" /> Volver a Mercado y Equipos
      </Link>
      <h1 className="text-4xl font-bold mb-2 font-orbitron">Nuestros Equipos</h1>
      <p className="text-lg text-muted-foreground mb-8">Conoce a los protagonistas de la Liga Master Zona Norte.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {equipos.map((equipo, index) => (
          <motion.div
            key={equipo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img-replace src={`/team-logos/${equipo.logo}`} alt={`${equipo.name} logo`} className="h-16 w-16 object-contain" />
                <div>
                  <h2 className="text-2xl font-bold text-primary font-orbitron">{equipo.name}</h2>
                  <p className="text-sm text-muted-foreground">DT: {equipo.dt}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Users size={16} className="mr-2 text-primary" />
                  <span>Plantilla: {equipo.plantillaSize} jugadores</span>
                </div>
                <div className="flex items-center">
                  <BarChart2 size={16} className="mr-2 text-primary" />
                  <span>Media del Equipo: <span className="font-semibold text-yellow-400">{equipo.mediaEquipo}</span></span>
                </div>
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-primary" />
                  <span>Estadio: {equipo.estadio}</span>
                </div>
              </div>
            </div>
            <Link 
              to={`/mercado-equipos/equipos/${equipo.id}`} 
              className="block w-full bg-primary/20 hover:bg-primary/30 text-primary font-semibold p-3 text-center transition-colors"
            >
              Ver Ficha Completa
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default EquiposPage;