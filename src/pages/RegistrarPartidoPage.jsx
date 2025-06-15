import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Edit3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/App';

const RegistrarPartidoPage = () => {
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    jornada: '',
    equipo1: '',
    golesEquipo1: '',
    equipo2: '',
    golesEquipo2: '',
    goleadores: '',
    incidencias: ''
  });
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    const storedTeams = JSON.parse(localStorage.getItem('clasificacionTeams')) || [];
    setEquipos(storedTeams.map(team => team.name));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || (user.role !== 'participante' && user.role !== 'admin')) {
      toast({ variant: "destructive", title: "Acceso denegado", description: "No tienes permiso para registrar partidos." });
      return;
    }

    if (!formData.jornada || !formData.equipo1 || !formData.equipo2 || formData.golesEquipo1 === '' || formData.golesEquipo2 === '') {
      toast({ variant: "destructive", title: "Error de validación", description: "Por favor, completa todos los campos obligatorios." });
      return;
    }
    if (formData.equipo1 === formData.equipo2) {
      toast({ variant: "destructive", title: "Error de validación", description: "Los equipos local y visitante no pueden ser el mismo." });
      return;
    }
    
    const partidosRegistrados = JSON.parse(localStorage.getItem('partidosRegistrados')) || [];
    partidosRegistrados.push({...formData, registradoPor: user.username, fechaRegistro: new Date().toISOString()});
    localStorage.setItem('partidosRegistrados', JSON.stringify(partidosRegistrados));

    toast({
      title: "¡Partido Registrado!",
      description: `Resultado: ${formData.equipo1} ${formData.golesEquipo1} - ${formData.golesEquipo2} ${formData.equipo2}`,
    });
    
    setFormData({
      jornada: '', equipo1: '', golesEquipo1: '', equipo2: '', golesEquipo2: '', goleadores: '', incidencias: ''
    });
  };

  return (
    <>
      <Link to="/torneo" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft size={18} className="mr-1" /> Volver a Torneo
      </Link>
      <h1 className="text-4xl font-bold mb-2 font-orbitron">Registrar Resultado de Partido</h1>
      <p className="text-lg text-muted-foreground mb-8">Capitanes, ingresen aquí los detalles del encuentro.</p>
      <motion.form 
        onSubmit={handleSubmit} 
        className="glass-card p-8 space-y-6 max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="jornada" className="form-label">Jornada / Fecha *</label>
            <input type="text" name="jornada" id="jornada" value={formData.jornada} onChange={handleChange} className="form-input" placeholder="Ej: Jornada 3 o 2025-07-15" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          <div className="md:col-span-2">
            <label htmlFor="equipo1" className="form-label">Equipo Local *</label>
            <select name="equipo1" id="equipo1" value={formData.equipo1} onChange={handleChange} className="form-input" required>
              <option value="">Seleccionar equipo</option>
              {equipos.map(e => <option key={e + "-local"} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="golesEquipo1" className="form-label">Goles *</label>
            <input type="number" name="golesEquipo1" id="golesEquipo1" value={formData.golesEquipo1} onChange={handleChange} min="0" className="form-input text-center" required />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="equipo2" className="form-label">Equipo Visitante *</label>
            <select name="equipo2" id="equipo2" value={formData.equipo2} onChange={handleChange} className="form-input" required>
              <option value="">Seleccionar equipo</option>
              {equipos.map(e => <option key={e + "-visit"} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="golesEquipo2" className="form-label">Goles *</label>
            <input type="number" name="golesEquipo2" id="golesEquipo2" value={formData.golesEquipo2} onChange={handleChange} min="0" className="form-input text-center" required />
          </div>
        </div>
        <div>
          <label htmlFor="goleadores" className="form-label">Goleadores (Equipo Local - Equipo Visitante)</label>
          <textarea name="goleadores" id="goleadores" value={formData.goleadores} onChange={handleChange} rows="3" className="form-input" placeholder="Ej: Messi (2), Ronaldo (1) - Mbappé (1)"></textarea>
        </div>
        <div>
          <label htmlFor="incidencias" className="form-label">Incidencias Especiales (opcional)</label>
          <textarea name="incidencias" id="incidencias" value={formData.incidencias} onChange={handleChange} rows="2" className="form-input" placeholder="Ej: Tarjeta roja a Jugador X, Lesión de Jugador Y"></textarea>
        </div>
        <Button type="submit" size="lg" className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-3">
          Registrar Partido <Edit3 size={20} className="ml-2"/>
        </Button>
      </motion.form>
    </>
  );
};

export default RegistrarPartidoPage;