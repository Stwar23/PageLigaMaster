import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { AuthContext } from '@/App';
import { Shield, Edit2, Trash2, PlusCircle, Search, ArrowLeft, Save, XCircle, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminGestionEquipos = () => {
  const { toast } = useToast();
  const { session } = useContext(AuthContext);
  const [equipos, setEquipos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEquipo, setNewEquipo] = useState({ 
    nombre: '', 
    dt: '', 
    estadio: '', 
    presupuesto_inicial: '', 
    propietario_id: '', 
    logo_url: null, 
    // camiseta_url: null // Si se implementa
  });

  const fetchEquipos = async () => {
    const { data, error } = await supabase.from('equipos').select('*').order('nombre', { ascending: true });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los equipos." });
      console.error("Error fetching equipos:", error);
    } else {
      setEquipos(data.map(e => ({...e, id: e.id.toString() })));
    }
  };

  const fetchParticipantes = async () => {
    // Asumiendo que los participantes tienen un campo 'role' en user_metadata
    const { data, error } = await supabase
      .from('users_view') // O tu tabla/vista de usuarios
      .select('id, raw_user_meta_data')
      // .eq('raw_user_meta_data->>role', 'participante'); // Filtrar por rol si es necesario
    
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los participantes." });
    } else {
      setParticipantes(data.map(u => ({ id: u.id, username: u.raw_user_meta_data?.username || u.id })));
    }
  };

  useEffect(() => {
    if (session) {
      fetchEquipos();
      fetchParticipantes();
    }
  }, [session, toast]);

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const filteredEquipos = equipos.filter(e => 
    e.nombre.toLowerCase().includes(searchTerm) || 
    (e.dt && e.dt.toLowerCase().includes(searchTerm))
  );

  const handleEdit = (equipo) => setEditingEquipo({ ...equipo, presupuesto_inicial: equipo.presupuesto_inicial?.toString() || '0' });

  const handleSaveEdit = async () => {
    if (!editingEquipo.nombre) {
      toast({ variant: "destructive", title: "Error", description: "El nombre del equipo es obligatorio." });
      return;
    }
    
    const equipoData = {
      nombre: editingEquipo.nombre,
      dt: editingEquipo.dt,
      estadio: editingEquipo.estadio,
      presupuesto_inicial: parseFloat(editingEquipo.presupuesto_inicial) || 0,
      propietario_id: editingEquipo.propietario_id || null,
      logo_url: editingEquipo.logo_url,
    };

    const { error } = await supabase.from('equipos').update(equipoData).eq('id', editingEquipo.id);

    if (error) {
      toast({ variant: "destructive", title: "Error al actualizar", description: error.message });
    } else {
      // Actualizar economía también
      await supabase.from('economia_equipos').upsert({
        id: editingEquipo.id.toString(),
        nombre: equipoData.nombre,
        presupuesto: equipoData.presupuesto_inicial
      }, { onConflict: 'id' });

      setEditingEquipo(null);
      fetchEquipos();
      toast({ title: "Equipo Actualizado", description: `Datos de ${editingEquipo.nombre} guardados.` });
    }
  };
  
  const handleCancelEdit = () => setEditingEquipo(null);

  const handleInputChange = (e, isNew = false) => {
    const { name, value, type, files } = e.target;
    // Para archivos, por ahora solo guardaremos el nombre o una URL simulada
    // La subida real a Supabase Storage es más compleja
    const val = type === 'file' ? (files[0] ? `logos/${files[0].name}` : null) : value;
    if (isNew) {
      setNewEquipo(prev => ({ ...prev, [name]: val }));
    } else if (editingEquipo) {
      setEditingEquipo(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSelectChange = (value, fieldName, isNew = false) => {
     if (isNew) {
      setNewEquipo(prev => ({ ...prev, [fieldName]: value }));
    } else if (editingEquipo) {
      setEditingEquipo(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleAddEquipo = async (e) => {
    e.preventDefault();
    if (!newEquipo.nombre) {
      toast({ variant: "destructive", title: "Error", description: "El nombre del equipo es obligatorio." });
      return;
    }

    const equipoData = { 
      nombre: newEquipo.nombre,
      dt: newEquipo.dt,
      estadio: newEquipo.estadio,
      presupuesto_inicial: parseFloat(newEquipo.presupuesto_inicial) || 0,
      propietario_id: newEquipo.propietario_id || null,
      logo_url: newEquipo.logo_url || 'default-logo.svg', // Usar un default si no se sube
      // Stats iniciales para la tabla de clasificación
      pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0,
    };
    
    const { data: insertedEquipo, error } = await supabase.from('equipos').insert(equipoData).select().single();

    if (error) {
      toast({ variant: "destructive", title: "Error al añadir", description: error.message });
    } else if (insertedEquipo) {
      // Añadir a economía_equipos
      await supabase.from('economia_equipos').insert({
        id: insertedEquipo.id.toString(),
        nombre: insertedEquipo.nombre,
        presupuesto: insertedEquipo.presupuesto_inicial
      });

      setShowAddForm(false);
      setNewEquipo({ nombre: '', dt: '', estadio: '', presupuesto_inicial: '', propietario_id: '', logo_url: null });
      fetchEquipos();
      toast({ title: "Equipo Añadido", description: `${insertedEquipo.nombre} ha sido creado.` });
    }
  };
  
  const handleDelete = async (equipoId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este equipo? Esta acción también eliminará datos relacionados (economía, partidos, etc. si hay cascada).")) {
      // Primero eliminar de economia_equipos para evitar problemas de FK si no hay cascada
      await supabase.from('economia_equipos').delete().eq('id', equipoId.toString());
      // Luego eliminar de equipos
      const { error } = await supabase.from('equipos').delete().eq('id', equipoId);
      
      if (error) {
        toast({ variant: "destructive", title: "Error al eliminar", description: error.message });
      } else {
        fetchEquipos();
        toast({ title: "Equipo Eliminado" });
      }
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value || 0);

  return (
    <>
      <Link to="/admin" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
        <ArrowLeft size={18} className="mr-1" /> Volver al Panel de Admin
      </Link>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-orbitron flex items-center"><Shield size={36} className="mr-3 text-primary" /> Gestión de Equipos</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-accent text-primary-foreground">
          <PlusCircle size={18} className="mr-2" /> {showAddForm ? 'Cancelar' : 'Crear Equipo'}
        </Button>
      </div>

      {showAddForm && (
        <motion.form 
          onSubmit={handleAddEquipo}
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold text-primary">Nuevo Equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="nombre" value={newEquipo.nombre} onChange={(e) => handleInputChange(e, true)} placeholder="Nombre del Equipo" required />
            <Input name="dt" value={newEquipo.dt} onChange={(e) => handleInputChange(e, true)} placeholder="Director Técnico" />
            <Input name="estadio" value={newEquipo.estadio} onChange={(e) => handleInputChange(e, true)} placeholder="Estadio" />
            <Input name="presupuesto_inicial" type="number" value={newEquipo.presupuesto_inicial} onChange={(e) => handleInputChange(e, true)} placeholder="Presupuesto Inicial (ARS)" />
            <Select name="propietario_id" value={newEquipo.propietario_id} onValueChange={(value) => handleSelectChange(value, 'propietario_id', true)}>
              <SelectTrigger><SelectValue placeholder="Asignar Propietario (Opcional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin propietario</SelectItem>
                {participantes.map(p => <SelectItem key={p.id} value={p.id}>{p.username}</SelectItem>)}
              </SelectContent>
            </Select>
            <div>
              <label className="form-label flex items-center"><UploadCloud size={16} className="mr-1"/> Logo del Equipo (URL o nombre de archivo)</label>
              <Input name="logo_url" type="text" value={newEquipo.logo_url || ''} onChange={(e) => handleInputChange(e, true)} placeholder="URL del logo o ej: mi-logo.png" className="form-input"/>
              <p className="text-xs text-muted-foreground mt-1">Por ahora, ingresa una URL o nombre de archivo. La subida real se implementará después.</p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            <Button type="submit">Guardar Equipo</Button>
          </div>
        </motion.form>
      )}

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Buscar por nombre o DT..."
          value={searchTerm}
          onChange={handleSearch}
          className="form-input max-w-sm"
          icon={<Search size={18} className="text-muted-foreground" />}
        />
      </div>

      <div className="table-container glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>DT</TableHead>
              <TableHead>Presupuesto</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipos.map(e => (
              editingEquipo && editingEquipo.id === e.id ? (
                <TableRow key={e.id} className="bg-primary/5">
                  <TableCell><img-replace src={e.logo_url && e.logo_url.startsWith('http') ? e.logo_url : `/team-logos/${e.logo_url || 'default-logo.svg'}`} alt={e.nombre} className="h-8 w-8 object-contain" /></TableCell>
                  <TableCell><Input value={editingEquipo.nombre} name="nombre" onChange={handleInputChange} className="form-input-sm" /></TableCell>
                  <TableCell><Input value={editingEquipo.dt || ''} name="dt" onChange={handleInputChange} className="form-input-sm" /></TableCell>
                  <TableCell><Input type="number" value={editingEquipo.presupuesto_inicial} name="presupuesto_inicial" onChange={handleInputChange} className="form-input-sm" /></TableCell>
                  <TableCell>
                    <Select value={editingEquipo.propietario_id || ''} name="propietario_id" onValueChange={(value) => handleSelectChange(value, 'propietario_id')}>
                      <SelectTrigger className="form-input-sm"><SelectValue placeholder="Sin propietario" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin propietario</SelectItem>
                        {participantes.map(p => <SelectItem key={p.id} value={p.id}>{p.username}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={handleSaveEdit} className="text-green-400 hover:text-green-300 h-8 w-8"><Save size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="text-muted-foreground hover:text-white h-8 w-8"><XCircle size={16} /></Button>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={e.id}>
                  <TableCell><img-replace src={e.logo_url && e.logo_url.startsWith('http') ? e.logo_url : `/team-logos/${e.logo_url || 'default-logo.svg'}`} alt={e.nombre} className="h-10 w-10 object-contain" /></TableCell>
                  <TableCell className="font-medium">{e.nombre}</TableCell>
                  <TableCell>{e.dt || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(e.presupuesto_inicial)}</TableCell>
                  <TableCell>{participantes.find(p => p.id === e.propietario_id)?.username || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(e)} className="text-primary hover:text-accent h-8 w-8"><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="text-destructive hover:text-red-400 h-8 w-8"><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              )
            ))}
          </TableBody>
        </Table>
        {filteredEquipos.length === 0 && <p className="text-center py-4 text-muted-foreground">No se encontraron equipos.</p>}
      </div>
      <p className="text-xs text-muted-foreground mt-4">Nota: La gestión de logos y escudos requiere implementar la subida de archivos a Supabase Storage. Por ahora, se manejan como URLs o nombres de archivo.</p>
    </>
  );
};

export default AdminGestionEquipos;