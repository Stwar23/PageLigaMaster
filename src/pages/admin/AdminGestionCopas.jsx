import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { AuthContext } from '@/App';
import { Award, PlusCircle, Edit2, Trash2, ArrowLeft, ListTree, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminGestionCopas = () => {
  const { toast } = useToast();
  const { session } = useContext(AuthContext);
  const [copas, setCopas] = useState([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCopa, setEditingCopa] = useState(null);
  const [newCopa, setNewCopa] = useState({
    nombre: '',
    descripcion: '',
    formato: 'eliminacionDirecta', // eliminacionDirecta, gruposMasEliminacion
    equipos_participantes_ids: [],
    bracket_generado: null,
    temporada: new Date().getFullYear().toString(),
  });
  const [viewingBracket, setViewingBracket] = useState(null);

  const fetchCopas = async () => {
    const { data, error } = await supabase.from('copas').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las copas." });
    } else {
      setCopas(data);
    }
  };

  const fetchEquipos = async () => {
    const { data, error } = await supabase.from('equipos').select('id, nombre, logo_url');
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los equipos." });
    } else {
      setEquiposDisponibles(data.map(e => ({ id: e.id.toString(), name: e.nombre, logo: e.logo_url })));
    }
  };

  useEffect(() => {
    if (session) {
      fetchCopas();
      fetchEquipos();
    }
  }, [session, toast]);

  const handleInputChange = (e, isNew = false) => {
    const { name, value } = e.target;
    const targetState = isNew ? setNewCopa : setEditingCopa;
    targetState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value, fieldName, isNew = false) => {
    const targetState = isNew ? setNewCopa : setEditingCopa;
    targetState(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCheckboxChange = (equipoId, isNew = false) => {
    const targetState = isNew ? setNewCopa : setEditingCopa;
    targetState(prev => {
      const currentEquipos = prev.equipos_participantes_ids || [];
      const newEquipos = currentEquipos.includes(equipoId)
        ? currentEquipos.filter(id => id !== equipoId)
        : [...currentEquipos, equipoId];
      return { ...prev, equipos_participantes_ids: newEquipos };
    });
  };

  const generarBracketEliminacionDirecta = (equiposIds) => {
    const equiposSeleccionados = equiposDisponibles.filter(e => equiposIds.includes(e.id));
    if (equiposSeleccionados.length < 2) return { rondas: [], campeon: null };

    let equipos = [...equiposSeleccionados];
    equipos.sort(() => 0.5 - Math.random()); 

    const rondas = [];
    let rondaActualEquipos = equipos.map(e => ({ ...e, resultado: null, avanza: false }));

    let rondaNum = 1;
    while(rondaActualEquipos.length > 1 || (rondaActualEquipos.length === 1 && rondas.length === 0) ){
        if (rondaActualEquipos.length === 1 && rondas.length > 0) break; // Campeón definido

        const partidosRonda = [];
        const proximaRondaEquipos = [];

        for (let i = 0; i < rondaActualEquipos.length; i += 2) {
            const equipo1 = rondaActualEquipos[i];
            const equipo2 = (i + 1 < rondaActualEquipos.length) ? rondaActualEquipos[i+1] : { id: 'BYE', name: 'Descansa', logo: null };
            
            partidosRonda.push({
                equipo1_id: equipo1.id,
                equipo1_nombre: equipo1.name,
                equipo1_logo: equipo1.logo,
                equipo2_id: equipo2.id,
                equipo2_nombre: equipo2.name,
                equipo2_logo: equipo2.logo,
                goles_equipo1: null,
                goles_equipo2: null,
                ganador_id: equipo2.id === 'BYE' ? equipo1.id : null, // Si hay BYE, equipo1 avanza
            });
            if(equipo2.id === 'BYE') proximaRondaEquipos.push(equipo1);
        }
        rondas.push({ nombre: `Ronda ${rondaNum++}`, partidos: partidosRonda });
        
        // Para la siguiente ronda, se necesitaría lógica para determinar ganadores y avanzarlos
        // Esta es una simplificación para la generación inicial.
        if (proximaRondaEquipos.length > 0 && proximaRondaEquipos.length * 2 <= rondaActualEquipos.length) {
             rondaActualEquipos = proximaRondaEquipos;
        } else {
            // Si no hay byes, la próxima ronda se llenará con placeholders o se detiene
            if (rondaActualEquipos.length <= 1) break;
            const numGanadoresEsperados = Math.ceil(rondaActualEquipos.length / 2);
            rondaActualEquipos = Array(numGanadoresEsperados).fill(null).map(() => ({id: 'TBD', name: 'Por Definir', logo: null}));

        }
        if (rondas.length > Math.log2(equiposSeleccionados.length) + 2) break; // Safety break
    }
    return { rondas, campeon: rondaActualEquipos.length === 1 ? rondaActualEquipos[0].id : null };
  };

  const handleAddCopa = async (e) => {
    e.preventDefault();
    if (!newCopa.nombre || newCopa.equipos_participantes_ids.length < 2) {
      toast({ variant: "destructive", title: "Error", description: "Nombre de copa y al menos 2 equipos son obligatorios." });
      return;
    }
    const bracket = generarBracketEliminacionDirecta(newCopa.equipos_participantes_ids);
    const copaData = { ...newCopa, bracket_generado: bracket };
    
    const { error } = await supabase.from('copas').insert(copaData);
    if (error) {
      toast({ variant: "destructive", title: "Error al crear copa", description: error.message });
    } else {
      setShowAddForm(false);
      setNewCopa({ nombre: '', descripcion: '', formato: 'eliminacionDirecta', equipos_participantes_ids: [], bracket_generado: null, temporada: new Date().getFullYear().toString() });
      fetchCopas();
      toast({ title: "Copa Creada", description: `La copa ${copaData.nombre} ha sido creada.` });
    }
  };

  const handleEditCopa = (copa) => {
    setEditingCopa({ ...copa });
    setShowAddForm(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCopa.nombre || editingCopa.equipos_participantes_ids.length < 2) {
      toast({ variant: "destructive", title: "Error", description: "Nombre de copa y al menos 2 equipos son obligatorios." });
      return;
    }
    // Solo regenerar bracket si los equipos cambiaron significativamente (o añadir opción para ello)
    // Por ahora, asumimos que si se editan equipos, se regenera.
    const bracket = generarBracketEliminacionDirecta(editingCopa.equipos_participantes_ids);
    const copaData = { ...editingCopa, bracket_generado: bracket };
    const { id, ...updateData } = copaData;

    const { error } = await supabase.from('copas').update(updateData).eq('id', id);
    if (error) {
      toast({ variant: "destructive", title: "Error al actualizar copa", description: error.message });
    } else {
      setEditingCopa(null);
      setShowAddForm(false);
      fetchCopas();
      toast({ title: "Copa Actualizada", description: `La copa ${copaData.nombre} ha sido actualizada.` });
    }
  };

  const handleDeleteCopa = async (copaId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta copa?")) {
      const { error } = await supabase.from('copas').delete().eq('id', copaId);
      if (error) {
        toast({ variant: "destructive", title: "Error al eliminar copa", description: error.message });
      } else {
        fetchCopas();
        toast({ title: "Copa Eliminada" });
      }
    }
  };

  const handleViewBracket = (copa) => setViewingBracket(copa);
  const handleCloseBracket = () => setViewingBracket(null);
  
  const updateResultadoPartidoCopa = async (rondaIndex, partidoIndex, campo, valor) => {
    const copaActualizada = JSON.parse(JSON.stringify(viewingBracket)); // Deep copy
    const partido = copaActualizada.bracket_generado.rondas[rondaIndex].partidos[partidoIndex];
    const valorNum = valor === '' ? null : parseInt(valor, 10);
    
    if (campo === 'goles_equipo1') partido.goles_equipo1 = valorNum;
    if (campo === 'goles_equipo2') partido.goles_equipo2 = valorNum;

    if (partido.goles_equipo1 !== null && partido.goles_equipo2 !== null) {
      if (partido.goles_equipo1 > partido.goles_equipo2) partido.ganador_id = partido.equipo1_id;
      else if (partido.goles_equipo2 > partido.goles_equipo1) partido.ganador_id = partido.equipo2_id;
      else partido.ganador_id = 'EMPATE'; // Necesita desempate
    } else {
      partido.ganador_id = null;
    }
    
    // Aquí iría lógica para avanzar ganador a siguiente ronda y actualizar campeón
    // Esta parte es compleja y requiere recalcular el bracket o tener una estructura más dinámica.
    // Por ahora, solo guardamos el resultado del partido.

    const { error } = await supabase.from('copas').update({ bracket_generado: copaActualizada.bracket_generado }).eq('id', viewingBracket.id);
    if (error) {
      toast({ variant: "destructive", title: "Error al guardar resultado", description: error.message });
    } else {
      setViewingBracket(copaActualizada); // Actualizar vista local
      fetchCopas(); // Recargar todas las copas para consistencia
      toast({ title: "Resultado Guardado" });
    }
  };

  const renderBracketVisual = () => {
    if (!viewingBracket || !viewingBracket.bracket_generado || !viewingBracket.bracket_generado.rondas) {
      return <p className="text-muted-foreground mt-4">No hay llave generada para esta copa.</p>;
    }
  
    return (
      <div className="mt-6 p-4 glass-card overflow-x-auto">
        <h3 className="text-xl font-semibold text-primary mb-4">Llave de {viewingBracket.nombre}</h3>
        <div className="flex space-x-8">
          {viewingBracket.bracket_generado.rondas.map((ronda, rondaIndex) => (
            <div key={rondaIndex} className="flex flex-col space-y-12 min-w-[250px]">
              <h4 className="text-lg font-medium text-center text-primary/80">{ronda.nombre}</h4>
              {ronda.partidos.map((partido, partidoIndex) => (
                <div key={partidoIndex} className="border border-primary/30 p-3 rounded-md bg-card/50 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm flex items-center truncate max-w-[120px]">
                      {partido.equipo1_logo && <img-replace src={partido.equipo1_logo.startsWith('http') ? partido.equipo1_logo : `/team-logos/${partido.equipo1_logo}`} alt={partido.equipo1_nombre} className="h-5 w-5 mr-2 object-contain"/>}
                      {partido.equipo1_nombre}
                    </span>
                    <Input type="number" className="w-12 h-7 text-xs p-1 text-center form-input-sm" placeholder="G" 
                           value={partido.goles_equipo1 === null ? '' : partido.goles_equipo1} 
                           onChange={(e) => updateResultadoPartidoCopa(rondaIndex, partidoIndex, 'goles_equipo1', e.target.value)} 
                           disabled={partido.equipo1_id === 'BYE' || partido.equipo2_id === 'BYE'}/>
                  </div>
                  <div className="text-center text-xs text-muted-foreground my-1">VS</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center truncate max-w-[120px]">
                      {partido.equipo2_logo && <img-replace src={partido.equipo2_logo.startsWith('http') ? partido.equipo2_logo : `/team-logos/${partido.equipo2_logo}`} alt={partido.equipo2_nombre} className="h-5 w-5 mr-2 object-contain"/>}
                      {partido.equipo2_nombre}
                    </span>
                     <Input type="number" className="w-12 h-7 text-xs p-1 text-center form-input-sm" placeholder="G"
                           value={partido.goles_equipo2 === null ? '' : partido.goles_equipo2}
                           onChange={(e) => updateResultadoPartidoCopa(rondaIndex, partidoIndex, 'goles_equipo2', e.target.value)} 
                           disabled={partido.equipo1_id === 'BYE' || partido.equipo2_id === 'BYE'}/>
                  </div>
                  {partido.ganador_id && partido.ganador_id !== 'EMPATE' && partido.ganador_id !== 'BYE' && <p className="text-xs text-green-400 mt-1">Ganador: {equiposDisponibles.find(e => e.id === partido.ganador_id)?.name}</p>}
                  {partido.ganador_id === 'EMPATE' && <p className="text-xs text-yellow-400 mt-1">Empate (Definir)</p>}
                  {partido.equipo2_id === 'BYE' && partido.ganador_id === partido.equipo1_id && <p className="text-xs text-blue-400 mt-1">{partido.equipo1_nombre} avanza (BYE)</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
        {viewingBracket.bracket_generado.campeon && (
          <div className="mt-6 text-center">
            <h4 className="text-2xl font-bold text-yellow-400">🏆 Campeón: {equiposDisponibles.find(e => e.id === viewingBracket.bracket_generado.campeon)?.name || 'Por definir'} 🏆</h4>
          </div>
        )}
      </div>
    );
  };

  const formTitle = editingCopa ? "Editar Copa" : "Crear Nueva Copa";
  const currentData = editingCopa || newCopa;
  const handleSubmitForm = editingCopa ? handleSaveEdit : handleAddCopa;

  return (
    <>
      <Link to="/admin" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
        <ArrowLeft size={18} className="mr-1" /> Volver al Panel de Admin
      </Link>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-orbitron flex items-center"><Award size={36} className="mr-3 text-primary" /> Gestión de Copas</h1>
        <Button onClick={() => { setShowAddForm(!showAddForm); setEditingCopa(null); if(showAddForm) setNewCopa({ nombre: '', descripcion: '', formato: 'eliminacionDirecta', equipos_participantes_ids: [], bracket_generado: null, temporada: new Date().getFullYear().toString() }); }} className="bg-primary hover:bg-accent text-primary-foreground">
          <PlusCircle size={18} className="mr-2" /> {showAddForm && !editingCopa ? 'Cancelar' : (editingCopa ? 'Cancelar Edición' : 'Crear Copa')}
        </Button>
      </div>

      {showAddForm && (
        <motion.form 
          onSubmit={handleSubmitForm}
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold text-primary">{formTitle}</h2>
          <Input name="nombre" value={currentData.nombre} onChange={(e) => handleInputChange(e, !editingCopa)} placeholder="Nombre de la Copa" required />
          <Input name="descripcion" value={currentData.descripcion} onChange={(e) => handleInputChange(e, !editingCopa)} placeholder="Descripción (Opcional)" />
          <Input name="temporada" value={currentData.temporada} onChange={(e) => handleInputChange(e, !editingCopa)} placeholder="Temporada (ej: 2025)" />
          <Select name="formato" value={currentData.formato} onValueChange={(value) => handleSelectChange(value, 'formato', !editingCopa)}>
            <SelectTrigger><SelectValue placeholder="Formato de Copa" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="eliminacionDirecta">Eliminación Directa</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium text-primary mb-2">Seleccionar Equipos Participantes:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {equiposDisponibles.map(equipo => (
                <label key={equipo.id} className="flex items-center space-x-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer">
                  <Checkbox
                    checked={currentData.equipos_participantes_ids.includes(equipo.id)}
                    onCheckedChange={() => handleCheckboxChange(equipo.id, !editingCopa)}
                    id={`equipo-copa-${equipo.id}-${editingCopa ? editingCopa.id : 'new'}`}
                  />
                  <span className="text-sm">{equipo.name}</span>
                </label>
              ))}
            </div>
             <p className="text-xs text-muted-foreground mt-1">Se recomienda un número par de equipos (4, 8, 16...) para eliminación directa.</p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingCopa(null); setNewCopa({ nombre: '', descripcion: '', formato: 'eliminacionDirecta', equipos_participantes_ids: [], bracket_generado: null, temporada: new Date().getFullYear().toString() }); }}>Cancelar</Button>
            <Button type="submit">{editingCopa ? 'Guardar Cambios' : 'Crear Copa y Generar Llave'}</Button>
          </div>
        </motion.form>
      )}

      <div className="space-y-4">
        {copas.length > 0 ? copas.map(copa => (
          <motion.div key={copa.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-primary">{copa.nombre} ({copa.temporada})</h3>
                <p className="text-sm text-muted-foreground">{copa.descripcion || 'Sin descripción'}</p>
                <p className="text-xs text-muted-foreground">Formato: {copa.formato} - Equipos: {copa.equipos_participantes_ids.length}</p>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleViewBracket(copa)} className="text-blue-400 hover:text-blue-300 h-8 w-8" title="Ver/Editar Llave"><ListTree size={16}/></Button>
                <Button variant="ghost" size="icon" onClick={() => handleEditCopa(copa)} className="text-primary hover:text-accent h-8 w-8" title="Editar Copa"><Edit2 size={16}/></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteCopa(copa.id)} className="text-destructive hover:text-red-400 h-8 w-8" title="Eliminar Copa"><Trash2 size={16}/></Button>
              </div>
            </div>
            {viewingBracket && viewingBracket.id === copa.id && (
              <>
                {renderBracketVisual()}
                <Button variant="outline" size="sm" onClick={handleCloseBracket} className="mt-4">Cerrar Llave</Button>
              </>
            )}
          </motion.div>
        )) : <p className="text-center text-muted-foreground py-4">No hay copas creadas.</p>}
      </div>
      <p className="text-xs text-muted-foreground mt-4">Nota: Para la gestión completa de copas, asegúrate de tener una tabla 'copas' y 'equipos' en Supabase. La lógica de avance automático en el bracket es compleja y se simplifica aquí.</p>
    </>
  );
};

export default AdminGestionCopas;