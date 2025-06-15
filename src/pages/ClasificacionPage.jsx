import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ClasificacionPage = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const storedTeamsData = localStorage.getItem('clasificacionTeams');
    let initialTeams = [];
    if (storedTeamsData) {
      initialTeams = JSON.parse(storedTeamsData);
    } else {
      initialTeams = [
        { id: 1, name: 'Titanes FC', pj: 5, pg: 4, pe: 1, pp: 0, gf: 12, gc: 3, pts: 13, logo: 'titanes-fc.svg' },
        { id: 2, name: 'Gladiadores SV', pj: 5, pg: 3, pe: 1, pp: 1, gf: 10, gc: 5, pts: 10, logo: 'gladiadores-sv.svg' },
        { id: 3, name: 'Furia Roja', pj: 5, pg: 2, pe: 2, pp: 1, gf: 8, gc: 7, pts: 8, logo: 'furia-roja.svg' },
        { id: 4, name: 'Lobos del Norte', pj: 5, pg: 1, pe: 1, pp: 3, gf: 5, gc: 10, pts: 4, logo: 'lobos-norte.svg' },
        { id: 5, name: 'Águilas Doradas', pj: 5, pg: 0, pe: 1, pp: 4, gf: 3, gc: 13, pts: 1, logo: 'aguilas-doradas.svg' },
      ];
      localStorage.setItem('clasificacionTeams', JSON.stringify(initialTeams));
    }
    setTeams(initialTeams.sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc)));
  }, []);

  return (
    <>
      <Link to="/torneo" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft size={18} className="mr-1" /> Volver a Torneo
      </Link>
      <h1 className="text-4xl font-bold mb-2 font-orbitron">Tabla de Clasificación</h1>
      <p className="text-lg text-muted-foreground mb-8">Sigue de cerca el rendimiento de cada equipo. La tabla refleja el esfuerzo y desempeño de cada jornada.</p>
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th className="w-1/12">Pos</th>
              <th className="w-4/12">Equipo</th>
              <th className="w-1/12">Pts</th>
              <th className="w-1/12">PJ</th>
              <th className="w-1/12">PG</th>
              <th className="w-1/12">PE</th>
              <th className="w-1/12">PP</th>
              <th className="w-1/12">GF</th>
              <th className="w-1/12">GC</th>
              <th className="w-1/12">DG</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <motion.tr 
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-primary/10 transition-colors"
              >
                <td className="font-semibold">{index + 1}</td>
                <td className="flex items-center space-x-3 py-3">
                  <img-replace src={`/team-logos/${team.logo}`} alt={`${team.name} logo`} className="h-8 w-8 object-contain" />
                  <Link to={`/mercado-equipos/equipos/${team.id}`} className="font-medium hover:text-primary transition-colors">{team.name}</Link>
                </td>
                <td className="font-bold text-primary">{team.pts}</td>
                <td>{team.pj}</td>
                <td>{team.pg}</td>
                <td>{team.pe}</td>
                <td>{team.pp}</td>
                <td>{team.gf}</td>
                <td>{team.gc}</td>
                <td className={team.gf - team.gc >= 0 ? 'text-green-400' : 'text-red-400'}>{team.gf - team.gc}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ClasificacionPage;