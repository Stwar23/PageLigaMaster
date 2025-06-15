import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuthContext } from '@/App';
import { useToast } from '@/components/ui/use-toast';

const EconomiaPage = () => {
  const [equiposEconomia, setEquiposEconomia] = useState([]);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      toast({ variant: "destructive", title: "Acceso denegado", description: "Debes iniciar sesión para ver esta sección." });
      return;
    }
    const storedEconomia = JSON.parse(localStorage.getItem('economiaEquipos')) || [
      { id: 1, name: 'Titanes FC', presupuesto: 1500000, ingresos: 50000, multas: 5000, transferencias: -20000, logo: 'titanes-fc.svg' },
      { id: 2, name: 'Gladiadores SV', presupuesto: 1200000, ingresos: 30000, multas: 0, transferencias: 10000, logo: 'gladiadores-sv.svg' },
      { id: 3, name: 'Furia Roja', presupuesto: 1000000, ingresos: 20000, multas: 10000, transferencias: 0, logo: 'furia-roja.svg' },
      { id: 4, name: 'Lobos del Norte', presupuesto: 900000, ingresos: 10000, multas: 2000, transferencias: 5000, logo: 'lobos-norte.svg' },
      { id: 5, name: 'Águilas Doradas', presupuesto: 800000, ingresos: 5000, multas: 0, transferencias: -5000, logo: 'aguilas-doradas.svg' },
    ];
    setEquiposEconomia(storedEconomia);
  }, [user, toast]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-destructive">Debes iniciar sesión para acceder a la economía del torneo.</p>
        <Link to="/login" className="text-primary hover:underline mt-4 inline-block">Iniciar Sesión</Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/mercado-equipos" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft size={18} className="mr-1" /> Volver a Mercado y Equipos
      </Link>
      <h1 className="text-4xl font-bold mb-2 font-orbitron">Economía del Torneo</h1>
      <p className="text-lg text-muted-foreground mb-8">Cada equipo cuenta con un presupuesto inicial y genera ingresos por rendimiento. Aquí se reflejan sus movimientos económicos: fichajes, multas, premios, sueldos, etc.</p>
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Presupuesto Actual</th>
              <th>Ingresos por Rendimiento</th>
              <th>Multas</th>
              <th>Balance Transferencias</th>
            </tr>
          </thead>
          <tbody>
            {equiposEconomia.map((equipo, index) => (
              <motion.tr 
                key={equipo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-primary/10 transition-colors"
              >
                <td className="flex items-center space-x-3 py-3">
                  <img-replace src={`/team-logos/${equipo.logo}`} alt={`${equipo.name} logo`} className="h-8 w-8 object-contain" />
                  <Link to={`/mercado-equipos/equipos/${equipo.id}`} className="font-medium hover:text-primary transition-colors">{equipo.name}</Link>
                </td>
                <td className="font-semibold text-primary">{formatCurrency(equipo.presupuesto + equipo.ingresos - equipo.multas + equipo.transferencias)}</td>
                <td className="text-green-400">{formatCurrency(equipo.ingresos)}</td>
                <td className="text-red-400">{formatCurrency(equipo.multas)}</td>
                <td className={equipo.transferencias >= 0 ? 'text-green-400' : 'text-red-400'}>{formatCurrency(equipo.transferencias)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EconomiaPage;