import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AuthContext } from '@/App';
import { supabase } from '@/lib/supabaseClient';
import { Settings, Edit, DollarSign, Users, ShieldAlert, ToggleLeft, ToggleRight, ArrowLeft, Library, Award, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const { toast } = useToast();
  const { session, loadingAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mercadoActivo, setMercadoActivo] = useState(true);
  const [presupuestoEquipo, setPresupuestoEquipo] = useState({ equipoId: '', monto: '' });
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    if (!loadingAuth && (!session || session.user?.user_metadata?.role !== 'admin')) {
      toast({ variant: "destructive", title: "Acceso Denegado", description: "Esta sección es solo para administradores." });
      navigate('/');
    }

    const fetchAdminData = async () => {
      // Fetch mercado status (simulando una tabla 'configuracion_global')
      try {
        const { data: configData, error: configError } = await supabase
          .from('configuracion_global')
          .select('valor')
          .eq('clave', 'mercado_activo')
          .single();

        if (configError && configError.code !== 'PGRST116') { // PGRST116: no rows found
          console.error("Error fetching mercado status:", configError);
        } else if (configData) {
          setMercadoActivo(configData.valor === 'true');
        } else {
          // Si no existe, crearlo con valor por defecto true
          await supabase.from('configuracion_global').insert([{ clave: 'mercado_activo', valor: 'true' }]);
        }
      } catch (e) { console.error("Error en fetchAdminData config:", e); }


      // Fetch equipos (simulando una tabla 'equipos')
      try {
        const { data: equiposData, error: equiposError } = await supabase
          .from('equipos') // Asumiendo que tienes una tabla 'equipos'
          .select('id, nombre');
        
        if (equiposError) console.error("Error fetching equipos:", equiposError);
        else setEquipos(equiposData || []);
      } catch (e) { console.error("Error en fetchAdminData equipos:", e); }
    };

    if (session && session.user?.user_metadata?.role === 'admin') {
      fetchAdminData();
    }
  }, [session, loadingAuth, toast, navigate]);

  const toggleMercado = async () => {
    const nuevoEstado = !mercadoActivo;
    try {
      const { error } = await supabase
        .from('configuracion_global')
        .update({ valor: nuevoEstado.toString() })
        .eq('clave', 'mercado_activo');

      if (error) throw error;
      setMercadoActivo(nuevoEstado);
      toast({ title: "Estado del Mercado Actualizado", description: `El mercado ahora está ${nuevoEstado ? 'Abierto' : 'Cerrado'}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al actualizar mercado", description: error.message });
    }
  };

  const handlePresupuestoChange = (e) => {
    setPresupuestoEquipo({ ...presupuestoEquipo, [e.target.name]: e.target.value });
  };

  const suministrarDinero = async (e) => {
    e.preventDefault();
    if (!presupuestoEquipo.equipoId || !presupuestoEquipo.monto) {
        toast({ variant: "destructive", title: "Error", description: "Selecciona un equipo e ingresa un monto." });
        return;
    }
    
    try {
      // Obtener presupuesto actual
      const { data: equipoActual, error: fetchError } = await supabase
        .from('economia_equipos') 
        .select('presupuesto')
        .eq('id', presupuestoEquipo.equipoId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
      const presupuestoActualNum = equipoActual?.presupuesto ? parseFloat(equipoActual.presupuesto) : 0;
      const montoNum = parseFloat(presupuestoEquipo.monto);
      const nuevoPresupuesto = presupuestoActualNum + montoNum;

      const equipoSeleccionado = equipos.find(eq => eq.id.toString() === presupuestoEquipo.equipoId);
      const nombreEquipo = equipoSeleccionado ? equipoSeleccionado.nombre : 'Equipo Desconocido';


      const { error: updateError } = await supabase
        .from('economia_equipos')
        .upsert({ id: presupuestoEquipo.equipoId, presupuesto: nuevoPresupuesto, nombre: nombreEquipo }, { onConflict: 'id' });

      if (updateError) throw updateError;
      
      toast({ title: "Presupuesto Actualizado", description: `Se suministró ${montoNum.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'})} a ${nombreEquipo}. Nuevo presupuesto: ${nuevoPresupuesto.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'})}` });
      setPresupuestoEquipo({ equipoId: '', monto: '' });
    } catch (error) {
       toast({ variant: "destructive", title: "Error al suministrar dinero", description: error.message });
    }
  };
  
  if (loadingAuth) {
    return <div className="text-center py-10">Cargando...</div>;
  }
  if (!session || session.user?.user_metadata?.role !== 'admin') {
     return (
      <div className="text-center py-10">
        <ShieldAlert size={64} className="mx-auto text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Acceso Denegado</h1>
        <p className="text-lg text-muted-foreground">No tienes permisos para ver esta página.</p>
        <Button asChild className="mt-6"><Link to="/">Volver al Inicio</Link></Button>
      </div>
    );
  }

  const adminSections = [
    { title: "Gestión de Participantes", path: "/admin/participantes", icon: <Users size={24} />, description: "Administra usuarios, roles y permisos." },
    { title: "Gestión de Equipos", path: "/admin/equipos", icon: <Shield size={24} />, description: "Crea, edita y gestiona los equipos de la liga." },
    { title: "Gestión de Ligas", path: "/admin/ligas", icon: <Library size={24} />, description: "Configura ligas, formatos y fixtures." },
    { title: "Gestión de Copas", path: "/admin/copas", icon: <Award size={24} />, description: "Organiza torneos de copa y llaves eliminatorias." },
  ];


  return (
    <>
      <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
        <ArrowLeft size={18} className="mr-1" /> Volver a Inicio
      </Link>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold font-orbitron flex items-center">
          <Settings size={36} className="mr-3 text-primary" /> Panel de Administración
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {adminSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 flex flex-col justify-between hover:shadow-primary/30 transition-shadow"
          >
            <div>
              <div className="flex items-center text-primary mb-3">
                {section.icon}
                <h2 className="text-2xl font-semibold ml-3 font-orbitron">{section.title}</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{section.description}</p>
            </div>
            <Button onClick={() => navigate(section.path)} className="w-full mt-auto bg-primary hover:bg-accent text-primary-foreground">
              Acceder
            </Button>
          </motion.div>
        ))}
      </div>
      
      <h2 className="text-3xl font-bold font-orbitron mb-6 mt-12">Configuraciones Rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <AdminCard title="Control del Mercado de Fichajes">
          <p className="mb-4 text-muted-foreground">Activa o desactiva el mercado de fichajes para todos los participantes.</p>
          <Button onClick={toggleMercado} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
            {mercadoActivo ? <ToggleRight size={20} className="mr-2 text-green-400" /> : <ToggleLeft size={20} className="mr-2 text-red-400" />}
            {mercadoActivo ? 'Mercado Abierto (Click para Cerrar)' : 'Mercado Cerrado (Click para Abrir)'}
          </Button>
        </AdminCard>

        <AdminCard title="Suministrar Fondos a Equipos">
          <p className="mb-4 text-muted-foreground">Añade presupuesto a un equipo específico.</p>
          <form onSubmit={suministrarDinero} className="space-y-4">
            <div>
              <label htmlFor="equipoIdSuministro" className="form-label">Seleccionar Equipo</label>
              <select name="equipoId" id="equipoIdSuministro" value={presupuestoEquipo.equipoId} onChange={handlePresupuestoChange} className="form-input" required>
                <option value="">-- Elige un equipo --</option>
                {equipos.map(equipo => (
                  <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="montoSuministro" className="form-label">Monto a Suministrar</label>
              <input type="number" name="monto" id="montoSuministro" value={presupuestoEquipo.monto} onChange={handlePresupuestoChange} className="form-input" placeholder="Ej: 500000" required />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-accent text-primary-foreground">
              <DollarSign size={18} className="mr-2" /> Suministrar Dinero
            </Button>
          </form>
        </AdminCard>
      </div>
      <p className="text-xs text-muted-foreground mt-12 text-center">
        Para que estas configuraciones funcionen correctamente, asegúrate de que las tablas 'configuracion_global', 'equipos' y 'economia_equipos' (o equivalentes) existan en tu base de datos Supabase.
      </p>
    </>
  );
};

const AdminCard = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6"
  >
    <h2 className="text-2xl font-semibold text-primary mb-4 font-orbitron">{title}</h2>
    {children}
  </motion.div>
);

export default AdminPage;