import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

import { supabase } from '../lib/supabaseClient'; 

const EquiposPage = () => {
  const { toast } = useToast();
  const [equipos, setEquipos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipos = async () => {
      const { data, error } = await supabase.rpc('fn_obtener_equipos_completos');
      if (error) {
        console.error('Error al obtener equipos:', error);
      } else {
        setEquipos(data);
      }
    };

    fetchEquipos();
  }, []);

  const verInformacionEquipo = async (equipoId) => {
      const { data: sessionData } = await supabase.auth.getSession();
  
      if (!sessionData.session) {
        toast({
          title: "Sesión requerida",
          description: "Debes iniciar sesión para ver la información del equipo seleccionado.",
          variant: "destructive",
        });
  
        // Redirigir después de un pequeño retraso para que el toast se muestre
        setTimeout(() => {
          navigate('/login');
        }, 1000);
  
        return;
      }
  
      navigate(`/equipo/general/informacion/${equipoId}`);
    };

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
            key={equipo.equi_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-card overflow-hidden hover:ring-2 hover:ring-primary cursor-pointer"
            onClick={() => verInformacionEquipo(equipo.equi_id)}
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={equipo.equi_escudourl } // Asegura ruta por si es null
                  alt={`${equipo.equi_nombre} logo`}
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <h2 className="text-2xl font-bold text-primary font-orbitron">{equipo.equi_nombre}</h2>
                  <p className="text-sm text-muted-foreground">DT: {equipo.equi_dt}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-primary" />
                  <span>Presupuesto: {equipo.equi_presupuesto} M</span>
                </div>
              </div>
            </div>
            {/* <div 
              onClick={() => verInformacionEquipo(equipo.equi_id)}
              className="block w-full bg-primary/20 hover:bg-primary/30 text-primary font-semibold p-3 text-center transition-colors"
            >
              Ver Ficha Completa
            </div> */}
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default EquiposPage;
