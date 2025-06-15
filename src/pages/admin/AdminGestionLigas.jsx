import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { AuthContext } from '@/App';
import { Library, PlusCircle, Edit2, Trash2, CalendarDays, ArrowLeft, Download, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminGestionLigas = () => {
  const { toast } = useToast();
  const { session } = useContext(AuthContext);
  const [ligas, setLigas] = useState([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLiga, setEditingLiga] = useState(null);
  const [newLiga, setNewLiga] = useState({
    nombre: '',
    descripcion: '',
    formato: 'todosContraTodos', // todosContraTodos, idaYVuelta
    equipos_participantes_ids: [], // Array de IDs de equipos
    fixture_generado: null, // JSON para el fixture
    temporada: new Date().getFullYear().toString(), // Año actual como temporada por defecto
  });
  const [viewingFixture, setViewingFixture] = useState(null);

  const fetchLigas = async () => {
    const { data, error } = await supabase.from('ligas').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las ligas." });
    } else {
      setLigas(data);
    }
  };

  const fetchEquipos = async () => {
    const { data, error } = await supabase.from('equipos').select('id, nombre');
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los equipos." });
    } else {
      setEquiposDisponibles(data.map(e => ({ id: e.id.toString(), name: e.nombre })));
    }
  };

  useEffect(() => {
    if (session) {
      fetchLigas();
      fetchEquipos();
    }
  }, [session, toast]);

  const handleInputChange = (e, isNew = false) => {
    const { name, value } = e.target;
    const targetState = isNew ? setNewLiga : setEditingLiga;
    targetState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value, fieldName, isNew = false) => {
    const targetState = isNew ? setNewLiga : setEditingLiga;
    targetState(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCheckboxChange = (equipoId, isNew = false) => {
    const targetState = isNew ? setNewLiga : setEditingLiga;
    targetState(prev => {
      const currentEquipos = prev.equipos_participantes_ids || [];
      const newEquipos = currentEquipos.includes(equipoId)
        ? currentEquipos.filter(id => id !== equipoId)
        : [...currentEquipos, equipoId];
      return { ...prev, equipos_participantes_ids: newEquipos };
    });
  };

  const generarFixtureSimple = (equiposIds, todosLosEquipos) => {
    const equiposEnLiga = todosLosEquipos.filter(e => equiposIds.includes(e.id));
    if (equiposEnLiga.length < 2) return { jornadas: [] };

    let fixture = { jornadas: [] };
    let equipos = [...equiposEnLiga];
    if (equipos.length % 2 !== 0) {
        equipos.push({ id: "BYE", name: "DESCANSA" });
    }
    const numJornadas = equipos.length - 1;
    const numPartidosPorJornada = equipos.length / 2;

    for (let i = 0; i < numJornadas; i++) {
        let jornada = { numero: i + 1, partidos: [] };
        for (let j = 0; j < numPartidosPorJornada; j++) {
            const local = equipos[j];
            const visitante = equipos[equipos.length - 1 - j];
            if (local.id !== "BYE" && visitante.id !== "BYE") {
                jornada.partidos.push({ 
                    local: local.name, 
                    visitante: visitante.name, 
                    local_id: local.id, 
                    visitante_id: visitante.id, 
                    goles_local: null,
                    goles_visitante: null,
                    estado: 'pendiente' 
                });
            } else if (local.id !== "BYE") {
                 jornada.partidos.push({ local: local.name, visitante: "DESCANSA", local_id: local.id, visitante_id: "BYE", estado: "bye" });
            } else if (visitante.id !== "BYE") {
                 jornada.partidos.push({ local: "DESCANSA", visitante: visitante.name, local_id: "BYE", visitante_id: visitante.id, estado: "bye" });
            }
        }
        fixture.jornadas.push(jornada);
        const primerEquipo = equipos.shift();
        const ultimo = equipos.pop();
        equipos.unshift(ultimo);
        equipos.unshift(primerEquipo);
    }
    return fixture;
  };

  const handleAddLiga = async (e) => {
    e.preventDefault();
    if (!newLiga.nombre || newLiga.equipos_participantes_ids.length < 2) {
      toast({ variant: "destructive", title: "Error", description: "Nombre de liga y al menos 2 equipos son obligatorios." });
      return;
    }
    const fixture = generarFixtureSimple(newLiga.equipos_participantes_ids, equiposDisponibles);
    const ligaData = { ...newLiga, fixture_generado: fixture };
    
    const { error } = await supabase.from('ligas').insert(ligaData);

    if (error) {
      toast({ variant: "destructive", title: "Error al crear liga", description: error.message });
    } else {
      setShowAddForm(false);
      setNewLiga({ nombre: '', descripcion: '', formato: 'todosContraTodos', equipos_participantes_ids: [], fixture_generado: null, temporada: new Date().getFullYear().toString() });
      fetchLigas();
      toast({ title: "Liga Creada", description: `La liga ${ligaData.nombre} ha sido creada.` });
    }
  };

  const handleEditLiga = (liga) => {
    setEditingLiga({ ...liga });
    setShowAddForm(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingLiga.nombre || editingLiga.equipos_participantes_ids.length < 2) {
      toast({ variant: "destructive", title: "Error", description: "Nombre de liga y al menos 2 equipos son obligatorios." });
      return;
    }
    const fixture = generarFixtureSimple(editingLiga.equipos_participantes_ids, equiposDisponibles);
    const ligaData = { ...editingLiga, fixture_generado: fixture };
    // No se debe enviar el ID en el objeto de actualización si es la PK
    const { id, ...updateData } = ligaData;

    const { error } = await supabase.from('ligas').update(updateData).eq('id', id);

    if (error) {
      toast({ variant: "destructive", title: "Error al actualizar liga", description: error.message });
    } else {
      setEditingLiga(null);
      setShowAddForm(false);
      fetchLigas();
      toast({ title: "Liga Actualizada", description: `La liga ${ligaData.nombre} ha sido actualizada.` });
    }
  };
  
  const handleDeleteLiga = async (ligaId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta liga?")) {
      const { error } = await supabase.from('ligas').delete().eq('id', ligaId);
      if (error) {
        toast({ variant: "destructive", title: "Error al eliminar liga", description: error.message });
      } else {
        fetchLigas();
        toast({ title: "Liga Eliminada" });
      }
    }
  };

  const handleViewFixture = (liga) => setViewingFixture(liga);
  const handleCloseFixture = () => setViewingFixture(null);

  const renderFixture = () => {
    if (!viewingFixture || !viewingFixture.fixture_generado || !viewingFixture.fixture_generado.jornadas || viewingFixture.fixture_generado.jornadas.length === 0) {
      return <p className="text-muted-foreground">No hay fixture generado o equipos insuficientes.</p>;
    }
    return (
      <div className="mt-4 space-y-6">
        {viewingFixture.fixture_generado.jornadas.map(jornada => (
          <div key={jornada.numero} className="glass-card p-4">
            <h4 className="text-lg font-semibold text-primary mb-2">Jornada {jornada.numero}</h4>
            <ul className="space-y-1 text-sm">
              {jornada.partidos.map((partido, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{partido.local} vs {partido.visitante}</span>
                  <span>{partido.goles_local !== null ? `${partido.goles_local} - ${partido.goles_visitante}` : partido.estado}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const formTitle = editingLiga ? "Editar Liga" : "Crear Nueva Liga";
  const currentData = editingLiga || newLiga;
  const handleSubmitForm = editingLiga ? handleSaveEdit : handleAddLiga;

  return (
    <>
      <Link to="/admin" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
        <ArrowLeft size={18} className="mr-1" /> Volver al Panel de Admin
      </Link>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-orbitron flex items-center"><Library size={36} className="mr-3 text-primary" /> Gestión de Ligas</h1>
        <Button onClick={() => { setShowAddForm(!showAddForm); setEditingLiga(null); if(showAddForm) setNewLiga({ nombre: '', descripcion: '', formato: 'todosContraTodos', equipos_participantes_ids: [], fixture_generado: null, temporada: new Date().getFullYear().toString() }); }} className="bg-primary hover:bg-accent text-primary-foreground">
          <PlusCircle size={18} className="mr-2" /> {showAddForm && !editingLiga ? 'Cancelar' : (editingLiga ? 'Cancelar Edición' : 'Crear Liga')}
        </Button>
      </div>

      {showAddForm && (
        <motion.form 
          onSubmit={handleSubmitForm}
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold text-primary">{formTitle}</h2>
          <Input name="nombre" value={currentData.nombre} onChange={(e) => handleInputChange(e, !editingLiga)} placeholder="Nombre de la Liga" required />
          <Input name="descripcion" value={currentData.descripcion} onChange={(e) => handleInputChange(e, !editingLiga)} placeholder="Descripción (Opcional)" />
          <Input name="temporada" value={currentData.temporada} onChange={(e) => handleInputChange(e, !editingLiga)} placeholder="Temporada (ej: 2025)" />
          <Select name="formato" value={currentData.formato} onValueChange={(value) => handleSelectChange(value, 'formato', !editingLiga)}>
            <SelectTrigger><SelectValue placeholder="Formato de Liga" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todosContraTodos">Todos contra todos (1 vuelta)</SelectItem>
              <SelectItem value="idaYVuelta">Ida y Vuelta</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium text-primary mb-2">Seleccionar Equipos Participantes:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {equiposDisponibles.map(equipo => (
                <label key={equipo.id} className="flex items-center space-x-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer">
                  <Checkbox
                    checked={currentData.equipos_participantes_ids.includes(equipo.id)}
                    onCheckedChange={() => handleCheckboxChange(equipo.id, !editingLiga)}
                    id={`equipo-${equipo.id}-${editingLiga ? editingLiga.id : 'new'}`}
                  />
                  <span className="text-sm">{equipo.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingLiga(null); setNewLiga({ nombre: '', descripcion: '', formato: 'todosContraTodos', equipos_participantes_ids: [], fixture_generado: null, temporada: new Date().getFullYear().toString() }); }}>Cancelar</Button>
            <Button type="submit">{editingLiga ? 'Guardar Cambios' : 'Crear Liga y Generar Fixture'}</Button>
          </div>
        </motion.form>
      )}

      <div className="space-y-4">
        {ligas.length > 0 ? ligas.map(liga => (
          <motion.div key={liga.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-primary">{liga.nombre} ({liga.temporada})</h3>
                <p className="text-sm text-muted-foreground">{liga.descripcion || 'Sin descripción'}</p>
                <p className="text-xs text-muted-foreground">Formato: {liga.formato} - Equipos: {liga.equipos_participantes_ids.length}</p>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleViewFixture(liga)} className="text-blue-400 hover:text-blue-300 h-8 w-8" title="Ver Fixture"><CalendarDays size={16}/></Button>
                <Button variant="ghost" size="icon" onClick={() => handleEditLiga(liga)} className="text-primary hover:text-accent h-8 w-8" title="Editar Liga"><Edit2 size={16}/></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteLiga(liga.id)} className="text-destructive hover:text-red-400 h-8 w-8" title="Eliminar Liga"><Trash2 size={16}/></Button>
              </div>
            </div>
            {viewingFixture && viewingFixture.id === liga.id && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-primary">Fixture de {viewingFixture.nombre}</h4>
                    <Button variant="outline" size="sm" onClick={handleCloseFixture}>Cerrar Fixture</Button>
                </div>
                {renderFixture()}
              </div>
            )}
          </motion.div>
        )) : <p className="text-center text-muted-foreground py-4">No hay ligas creadas.</p>}
      </div>
      <p className="text-xs text-muted-foreground mt-4">Nota: Para la gestión completa de ligas, asegúrate de tener una tabla 'ligas' y 'equipos' en Supabase con las columnas adecuadas.</p>
    </>
  );
};

export default AdminGestionLigas;