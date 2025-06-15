import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { AuthContext } from '@/App';
import { Users, Edit2, Trash2, UserPlus, Search, UserCheck, UserX, ArrowLeft, Save, XCircle, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminGestionParticipantes = () => {
  const { toast } = useToast();
  const { session } = useContext(AuthContext);
  const [participantes, setParticipantes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ username: '', email: '', password: '', role: 'participante', teamId: '', status: 'active' });

  const fetchParticipantes = async () => {
    const { data, error } = await supabase
      .from('users_view') 
      .select('*');

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los participantes. Asegúrate de que la vista 'users_view' existe y tiene permisos." });
      console.error("Error fetching participantes:", error);
    } else {
      setParticipantes(data.map(p => ({
        id: p.id,
        username: p.raw_user_meta_data?.username || p.email?.split('@')[0] || 'N/A',
        email: p.email || 'N/A',
        role: p.raw_user_meta_data?.role || 'participante',
        teamId: p.raw_user_meta_data?.team_id || '',
        status: p.raw_user_meta_data?.status || 'active',
      })));
    }
  };

  const fetchEquipos = async () => {
    const { data, error } = await supabase.from('equipos').select('id, nombre');
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los equipos." });
    } else {
      setEquipos(data.map(t => ({ id: t.id.toString(), name: t.nombre })));
    }
  };

  const assignAdminRoleToUser = async (userIdToMakeAdmin) => {
    if (!session || session.user?.user_metadata?.role !== 'admin') {
      console.warn("Intento de asignación de rol admin sin ser admin.");
      return;
    }

    const { data: targetUser, error: fetchUserError } = await supabase.auth.admin.getUserById(userIdToMakeAdmin);

    if (fetchUserError) {
        toast({ variant: "destructive", title: "Error al buscar usuario", description: `No se pudo encontrar el usuario ${userIdToMakeAdmin}: ${fetchUserError.message}` });
        return;
    }
    
    const currentMetadata = targetUser.user.user_metadata || {};

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userIdToMakeAdmin,
      { 
        user_metadata: { 
          ...currentMetadata,
          role: 'admin',
        }
      }
    );

    if (updateError) {
      toast({ variant: "destructive", title: "Error al asignar rol admin", description: `Supabase: ${updateError.message}` });
    } else {
      toast({ title: "Rol Admin Asignado", description: `El usuario con ID ${userIdToMakeAdmin} ahora es administrador.` });
      fetchParticipantes(); // Refrescar la lista para ver el cambio
    }
  };


  useEffect(() => {
    if (session) {
      fetchParticipantes();
      fetchEquipos();
      
      const targetAdminId = "0a18c0b2-80c3-4edb-a574-d0742a07d405";
      // Verificar si el usuario ya es admin para no reasignar innecesariamente
      const isAlreadyAdmin = participantes.find(p => p.id === targetAdminId && p.role === 'admin');
      if (session.user?.user_metadata?.role === 'admin' && !isAlreadyAdmin) {
        // Solo llamamos a la función si el usuario actual es admin y el target no lo es ya
        // y si el targetAdminId no es el mismo que el usuario actual (para evitar auto-asignación redundante)
        if (session.user.id !== targetAdminId) {
            // Se podría poner una bandera para que solo se ejecute una vez si se quiere.
            // assignAdminRoleToUser(targetAdminId); 
            // Comentado por ahora para evitar ejecuciones repetitivas en cada carga si no se maneja estado de ejecución.
            // Si quieres que se ejecute automáticamente al cargar, descomenta y considera añadir un flag.
        }
      }
    }
  }, [session, toast]);
  
  // Si necesitas ejecutarlo una sola vez, podrías hacerlo con un botón o una lógica más específica
  // Por ejemplo, un botón en la UI o una comprobación de si ya se hizo.
  // Para hacerlo como solicitaste "al leer usuarios", la lógica en useEffect es la correcta,
  // pero hay que tener cuidado con ejecuciones múltiples.

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const filteredParticipantes = participantes.filter(p => 
    p.username.toLowerCase().includes(searchTerm) || 
    p.email.toLowerCase().includes(searchTerm)
  );

  const handleEdit = (participant) => setEditingParticipant({ ...participant });

  const handleSaveEdit = async () => {
    if (!editingParticipant || !editingParticipant.id) {
        toast({ variant: "destructive", title: "Error", description: "No hay participante seleccionado para editar." });
        return;
    }
    if (!editingParticipant.username || !editingParticipant.email) {
      toast({ variant: "destructive", title: "Error", description: "Nombre de usuario y correo son obligatorios." });
      return;
    }
    
    const currentMetadata = participantes.find(p => p.id === editingParticipant.id) || {};
    const existingMetadata = {
        username: currentMetadata.username,
        role: currentMetadata.role,
        team_id: currentMetadata.teamId,
        status: currentMetadata.status,
    };

    const { data: updatedUser, error } = await supabase.auth.admin.updateUserById(
      editingParticipant.id,
      { 
        email: editingParticipant.email,
        user_metadata: { 
          ...existingMetadata, // Preservar metadatos existentes
          username: editingParticipant.username,
          role: editingParticipant.role,
          team_id: editingParticipant.teamId || null,
          status: editingParticipant.status,
        }
      }
    );

    if (error) {
      toast({ variant: "destructive", title: "Error al actualizar", description: `Supabase: ${error.message}. Asegúrate que tu API key tiene permisos de admin o usa una Edge Function.` });
      console.error("Supabase admin update error:", error);
    } else {
      setEditingParticipant(null);
      fetchParticipantes(); 
      toast({ title: "Participante Actualizado", description: `Datos de ${updatedUser.user.user_metadata.username || updatedUser.user.email} guardados.` });
    }
  };

  const handleCancelEdit = () => setEditingParticipant(null);

  const handleInputChange = (e, isNew = false) => {
    const { name, value } = e.target;
    if (isNew) {
      setNewParticipant(prev => ({ ...prev, [name]: value }));
    } else if (editingParticipant) {
      setEditingParticipant(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (value, fieldName, isNew = false) => {
     if (isNew) {
      setNewParticipant(prev => ({ ...prev, [fieldName]: value }));
    } else if (editingParticipant) {
      setEditingParticipant(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipant.username || !newParticipant.email || !newParticipant.password) {
      toast({ variant: "destructive", title: "Error", description: "Nombre, correo y contraseña son obligatorios." });
      return;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: newParticipant.email,
      password: newParticipant.password,
      email_confirm: true, 
      user_metadata: {
        username: newParticipant.username,
        role: newParticipant.role,
        team_id: newParticipant.teamId || null,
        status: newParticipant.status,
      }
    });

    if (error) {
      toast({ variant: "destructive", title: "Error al añadir", description: error.message });
    } else {
      setShowAddForm(false);
      setNewParticipant({ username: '', email: '', password: '', role: 'participante', teamId: '', status: 'active' });
      fetchParticipantes(); 
      toast({ title: "Participante Añadido", description: `${newParticipant.username} ha sido registrado. Revisa el correo para confirmación si está activado.` });
    }
  };

  const toggleStatus = async (participant) => {
    if (!participant || !participant.id) return;

    const currentPData = participantes.find(p => p.id === participant.id);
    if (!currentPData) return;

    const newStatus = currentPData.status === 'active' ? 'suspended' : 'active';
    const { error } = await supabase.auth.admin.updateUserById(
      participant.id,
      { user_metadata: { 
          username: currentPData.username, 
          role: currentPData.role, 
          team_id: currentPData.teamId, 
          status: newStatus 
        } 
      }
    );
    if (error) {
      toast({ variant: "destructive", title: "Error al cambiar estado", description: error.message });
    } else {
      fetchParticipantes();
      toast({ title: "Estado Actualizado", description: `El participante ${currentPData.username} ha sido ${newStatus === 'active' ? 'reactivado' : 'suspendido'}.` });
    }
  };
  
  const handleDelete = async (participantId) => {
    if (!participantId) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar este participante? Esta acción no se puede deshacer.")) {
      const { error } = await supabase.auth.admin.deleteUser(participantId);
      if (error) {
        toast({ variant: "destructive", title: "Error al eliminar", description: error.message });
      } else {
        fetchParticipantes();
        toast({ title: "Participante Eliminado" });
      }
    }
  };

  const makeUserAdminManually = () => {
    const userId = "0a18c0b2-80c3-4edb-a574-d0742a07d405";
    const user = participantes.find(p => p.id === userId);
    if (user && user.role === 'admin') {
        toast({ title: "Información", description: `El usuario ${user.username} ya es administrador.` });
        return;
    }
    assignAdminRoleToUser(userId);
  }


  return (
    <>
      <Link to="/admin" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
        <ArrowLeft size={18} className="mr-1" /> Volver al Panel de Admin
      </Link>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-orbitron flex items-center"><Users size={36} className="mr-3 text-primary" /> Gestión de Participantes</h1>
        <div className="flex space-x-2">
          <Button onClick={makeUserAdminManually} variant="outline" className="border-accent text-accent hover:bg-accent/10">
            Convertir Usuario Específico a Admin
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-accent text-primary-foreground">
            <UserPlus size={18} className="mr-2" /> {showAddForm ? 'Cancelar' : 'Añadir Participante'}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <motion.form 
          onSubmit={handleAddParticipant}
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold text-primary">Nuevo Participante</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="username" value={newParticipant.username} onChange={(e) => handleInputChange(e, true)} placeholder="Nombre de Usuario" required />
            <Input name="email" type="email" value={newParticipant.email} onChange={(e) => handleInputChange(e, true)} placeholder="Correo Electrónico" required />
            <Input name="password" type="password" value={newParticipant.password} onChange={(e) => handleInputChange(e, true)} placeholder="Contraseña" required />
            <Select name="role" value={newParticipant.role} onValueChange={(value) => handleSelectChange(value, 'role', true)}>
              <SelectTrigger><SelectValue placeholder="Rol" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="participante">Participante</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <Select name="teamId" value={newParticipant.teamId} onValueChange={(value) => handleSelectChange(value, 'teamId', true)}>
              <SelectTrigger><SelectValue placeholder="Asignar Equipo (Opcional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin equipo</SelectItem>
                {equipos.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
              </SelectContent>
            </Select>
             <Select name="status" value={newParticipant.status} onValueChange={(value) => handleSelectChange(value, 'status', true)}>
              <SelectTrigger><SelectValue placeholder="Estado Inicial" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            <Button type="submit">Guardar Participante</Button>
          </div>
        </motion.form>
      )}

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Buscar por nombre o correo..."
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
              <TableHead className="flex items-center"><UserPlus className="mr-2 h-4 w-4 text-primary"/>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-primary"/>Rol</TableHead>
              <TableHead>Equipo Asignado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipantes.map(p => (
              editingParticipant && editingParticipant.id === p.id ? (
                <TableRow key={p.id} className="bg-primary/5">
                  <TableCell><Input value={editingParticipant.username} name="username" onChange={handleInputChange} className="form-input-sm" /></TableCell>
                  <TableCell><Input type="email" value={editingParticipant.email} name="email" onChange={handleInputChange} className="form-input-sm" /></TableCell>
                  <TableCell>
                    <Select value={editingParticipant.role} name="role" onValueChange={(value) => handleSelectChange(value, 'role')}>
                      <SelectTrigger className="form-input-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="participante">Participante</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={editingParticipant.teamId || ''} name="teamId" onValueChange={(value) => handleSelectChange(value, 'teamId')}>
                      <SelectTrigger className="form-input-sm"><SelectValue placeholder="Sin equipo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin equipo</SelectItem>
                        {equipos.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                     <Select value={editingParticipant.status} name="status" onValueChange={(value) => handleSelectChange(value, 'status')}>
                      <SelectTrigger className="form-input-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="suspended">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={handleSaveEdit} className="text-green-400 hover:text-green-300 h-8 w-8"><Save size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="text-muted-foreground hover:text-white h-8 w-8"><XCircle size={16} /></Button>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.username}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.role}</TableCell>
                  <TableCell>{equipos.find(t => t.id === p.teamId)?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${p.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {p.status === 'active' ? 'Activo' : 'Suspendido'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="text-primary hover:text-accent h-8 w-8"><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleStatus(p)} className={`${p.status === 'active' ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'} h-8 w-8`}>
                      {p.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                    </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-red-400 h-8 w-8" disabled={p.email === session?.user?.email || p.id === "0a18c0b2-80c3-4edb-a574-d0742a07d405"} title={p.email === session?.user?.email ? 'No te puedes eliminar a ti mismo' : (p.id === "0a18c0b2-80c3-4edb-a574-d0742a07d405" ? 'Este usuario no se puede eliminar' : 'Eliminar')}>
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            ))}
          </TableBody>
        </Table>
        {filteredParticipantes.length === 0 && <p className="text-center py-4 text-muted-foreground">No se encontraron participantes.</p>}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        <strong>Importante:</strong> La edición de roles y otros metadatos de usuario directamente desde el frontend con <code>supabase.auth.admin</code> es poderosa pero requiere que la clave anónima tenga permisos elevados, o que utilices una Edge Function con la <code>service_role_key</code> para mayor seguridad en producción.
        <br/>
        Asegúrate que la vista 'users_view' existe en tu base de datos y tiene los permisos de selección adecuados para los roles 'anon' y 'authenticated'.
      </p>
    </>
  );
};

export default AdminGestionParticipantes;