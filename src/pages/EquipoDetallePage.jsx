import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Users, BarChart2, UserCircle, CalendarDays, TrendingUp } from 'lucide-react';

const mockPlantillas = {
  1: [
    { id: 101, nombre: 'Juan Pérez', posicion: 'DEL', media: 88, edad: 28, pais: 'Argentina' },
    { id: 102, nombre: 'Pedro Gómez', posicion: 'MED', media: 85, edad: 25, pais: 'Uruguay' },
  ],
  2: [
    { id: 201, nombre: 'Luis García', posicion: 'DEF', media: 86, edad: 30, pais: 'España' },
    { id: 202, nombre: 'Mario Rodríguez', posicion: 'POR', media: 84, edad: 27, pais: 'Colombia' },
  ],
  // ... más plantillas
};


const EquipoDetallePage = () => {
  const { id } = useParams();
  const [equipo, setEquipo] = useState(null);
  const [plantilla, setPlantilla] = useState([]);

  useEffect(() => {
    const storedTeams = JSON.parse(localStorage.getItem('clasificacionTeams')) || [];
    const equipoEncontrado = storedTeams.find(t => t.id.toString() === id);
    
    if (equipoEncontrado) {
      // Simular datos adicionales que no están en clasificacionTeams
      const datosAdicionales = {
        dt: equipoEncontrado.name.includes("Titanes") ? 'Carlos Bianchi' : 'Pep Guardiola',
        estadio: `Estadio Virtual de ${equipoEncontrado.name}`,
        fundacion: 2020,
        colores: 'Azul y Oro',
        titulos: Math.floor(Math.random() * 5),
        descripcion: `El ${equipoEncontrado.name} es un equipo con una rica historia en Zona Norte, conocido por su juego aguerrido y su fiel afición.`,
        mediaEquipo: Math.floor(Math.random() * 10) + 80, 
      };
      setEquipo({...equipoEncontrado, ...datosAdicionales});
      setPlantilla(mockPlantillas[id] || []);
    } else {
      // Manejar equipo no encontrado, quizás redirigir o mostrar error
    }
  }, [id]);

  if (!equipo) {
    return <div className="text-center py-10 text-xl">Cargando datos del equipo...</div>;
  }

  return (
    <>
      <Link to="/mercado-equipos/equipos" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
        <ArrowLeft size={18} className="mr-1" /> Volver a Equipos
      </Link>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <img-replace src={`/team-logos/${equipo.logo}`} alt={`${equipo.name} logo`} className="h-32 w-32 md:h-40 md:w-40 object-contain rounded-lg shadow-lg bg-background/50 p-2" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-orbitron mb-2">{equipo.name}</h1>
            <p className="text-lg text-muted-foreground mb-1">Director Técnico: <span className="font-semibold text-foreground">{equipo.dt}</span></p>
            <p className="text-lg text-muted-foreground">Estadio: <span className="font-semibold text-foreground">{equipo.estadio}</span></p>
            <p className="text-md text-foreground mt-4">{equipo.descripcion}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <InfoCard icon={<CalendarDays size={24} />} title="Fundación" value={equipo.fundacion} />
          <InfoCard icon={<Shield size={24} />} title="Colores" value={equipo.colores} />
          <InfoCard icon={<TrendingUp size={24} />} title="Títulos" value={equipo.titulos} />
          <InfoCard icon={<BarChart2 size={24} />} title="Media del Equipo" value={equipo.mediaEquipo} className="text-yellow-400" />
          <InfoCard icon={<Users size={24} />} title="Partidos Jugados" value={equipo.pj} />
          <InfoCard icon={<Users size={24} />} title="Puntos Totales" value={equipo.pts} className="text-primary" />
        </div>
        
        <div>
          <h2 className="text-3xl font-semibold text-primary mb-6 font-orbitron">Plantilla Actual</h2>
          {plantilla.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plantilla.map(jugador => (
                <Link key={jugador.id} to={`/mercado-equipos/mercado/jugador/${jugador.id}`} className="block glass-card p-4 hover:shadow-primary/50 transition-shadow duration-300">
                  <div className="flex items-center space-x-3">
                    <UserCircle size={36} className="text-primary" />
                    <div>
                      <p className="font-semibold text-lg text-foreground">{jugador.nombre}</p>
                      <p className="text-sm text-muted-foreground">{jugador.posicion} - {jugador.pais}</p>
                    </div>
                    <span className={`ml-auto font-bold text-xl ${jugador.media >= 85 ? 'text-yellow-400' : 'text-green-400'}`}>{jugador.media}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay datos de plantilla disponibles para este equipo.</p>
          )}
        </div>
      </motion.div>
    </>
  );
};

const InfoCard = ({ icon, title, value, className = 'text-foreground' }) => (
  <div className="bg-card/50 p-4 rounded-lg flex items-center space-x-3 border border-primary/20">
    <div className="text-primary p-2 bg-primary/10 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-xl font-semibold ${className}`}>{value}</p>
    </div>
  </div>
);

export default EquipoDetallePage;