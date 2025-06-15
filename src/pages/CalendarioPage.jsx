import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CalendarioPage = () => {
  const [jornadaActual, setJornadaActual] = useState(1);
  const [partidosData, setPartidosData] = useState({});
  const totalJornadas = 5; 

  useEffect(() => {
    const storedPartidos = localStorage.getItem('calendarioPartidos');
    if (storedPartidos) {
      setPartidosData(JSON.parse(storedPartidos));
    } else {
      const initialPartidos = {
        1: [
          { id: 1, local: 'Titanes FC', visitante: 'Gladiadores SV', fecha: '2025-06-10', hora: '19:00', resultado: '2-1', localId: 1, visitanteId: 2 },
          { id: 2, local: 'Furia Roja', visitante: 'Lobos del Norte', fecha: '2025-06-10', hora: '21:00', resultado: '1-1', localId: 3, visitanteId: 4 },
        ],
        2: [
          { id: 3, local: 'Águilas Doradas', visitante: 'Titanes FC', fecha: '2025-06-17', hora: '19:00', resultado: null, localId: 5, visitanteId: 1 },
          { id: 4, local: 'Gladiadores SV', visitante: 'Furia Roja', fecha: '2025-06-17', hora: '21:00', resultado: null, localId: 2, visitanteId: 3 },
        ],
        3: [
          { id: 5, local: 'Lobos del Norte', visitante: 'Águilas Doradas', fecha: '2025-06-24', hora: '19:00', resultado: null, localId: 4, visitanteId: 5 },
          { id: 6, local: 'Titanes FC', visitante: 'Furia Roja', fecha: '2025-06-24', hora: '21:00', resultado: null, localId: 1, visitanteId: 3 },
        ],
        4: [
          { id: 7, local: 'Gladiadores SV', visitante: 'Lobos del Norte', fecha: '2025-07-01', hora: '19:00', resultado: null, localId: 2, visitanteId: 4 },
          { id: 8, local: 'Furia Roja', visitante: 'Águilas Doradas', fecha: '2025-07-01', hora: '21:00', resultado: null, localId: 3, visitanteId: 5 },
        ],
        5: [
          { id: 9, local: 'Titanes FC', visitante: 'Lobos del Norte', fecha: '2025-07-08', hora: '19:00', resultado: null, localId: 1, visitanteId: 4 },
          { id: 10, local: 'Águilas Doradas', visitante: 'Gladiadores SV', fecha: '2025-07-08', hora: '21:00', resultado: null, localId: 5, visitanteId: 2 },
        ],
      };
      setPartidosData(initialPartidos);
      localStorage.setItem('calendarioPartidos', JSON.stringify(initialPartidos));
    }
  }, []);


  const partidosVisibles = partidosData[jornadaActual] || [];

  return (
    <>
      <Link to="/torneo" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft size={18} className="mr-1" /> Volver a Torneo
      </Link>
      <h1 className="text-4xl font-bold mb-2 font-orbitron">Calendario de Partidos</h1>
      <p className="text-lg text-muted-foreground mb-6">Consulta los enfrentamientos programados y resultados.</p>
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-primary">Jornada {jornadaActual}</h2>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setJornadaActual(prev => Math.max(1, prev - 1))}
            disabled={jornadaActual === 1}
            className="border-primary text-primary hover:bg-primary/10"
          >
            Anterior
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setJornadaActual(prev => Math.min(totalJornadas, prev + 1))}
            disabled={jornadaActual === totalJornadas}
            className="border-primary text-primary hover:bg-primary/10"
          >
            Siguiente
          </Button>
        </div>
      </div>

      {partidosVisibles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partidosVisibles.map((partido, index) => (
            <motion.div 
              key={partido.id} 
              className="glass-card p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted-foreground">{new Date(partido.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="text-sm text-muted-foreground">{partido.hora}</span>
              </div>
              <div className="flex items-center justify-around text-center mb-3">
                <Link to={`/mercado-equipos/equipos/${partido.localId}`} className="w-2/5 hover:opacity-80 transition-opacity">
                  <img-replace src={`/team-logos/${partido.local.toLowerCase().replace(/\s+/g, '-')}.svg`} alt={`${partido.local} logo`} className="h-12 w-12 mx-auto mb-1 object-contain" />
                  <p className="font-semibold text-lg">{partido.local}</p>
                </Link>
                <div className="w-1/5">
                  {partido.resultado ? (
                    <p className="text-3xl font-bold text-primary">{partido.resultado}</p>
                  ) : (
                    <p className="text-2xl font-bold text-muted-foreground">VS</p>
                  )}
                </div>
                <Link to={`/mercado-equipos/equipos/${partido.visitanteId}`} className="w-2/5 hover:opacity-80 transition-opacity">
                  <img-replace src={`/team-logos/${partido.visitante.toLowerCase().replace(/\s+/g, '-')}.svg`} alt={`${partido.visitante} logo`} className="h-12 w-12 mx-auto mb-1 object-contain" />
                  <p className="font-semibold text-lg">{partido.visitante}</p>
                </Link>
              </div>
              {partido.resultado && (
                <p className="text-center text-xs text-muted-foreground">Partido finalizado</p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No hay partidos programados para esta jornada.</p>
      )}
    </>
  );
};

export default CalendarioPage;