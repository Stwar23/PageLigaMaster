import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Search, Filter, Download, Eye } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';

const initialJugadores = [
  { id: 117047, nombre: "Vinicius Junior", media: 94, valor: 86800000, pais: "Brasil", posicion: "DEL", edad: 23, equipoActual: "Real Madrid", estadisticas: { velocidad: 95, regate: 93, fuerza: 70, pase: 84, disparo: 88 } },
  { id: 1, nombre: 'Lionel Messi', posicion: 'DEL', edad: 37, valor: 50000000, media: 93, pais: 'Argentina', equipoActual: 'Inter Miami', estadisticas: { velocidad: 85, regate: 95, fuerza: 68, pase: 92, disparo: 90 } },
  { id: 2, nombre: 'Cristiano Ronaldo', posicion: 'DEL', edad: 39, valor: 45000000, media: 91, pais: 'Portugal', equipoActual: 'Al Nassr', estadisticas: { velocidad: 88, regate: 85, fuerza: 80, pase: 80, disparo: 92 } },
  { id: 3, nombre: 'Kylian Mbappé', posicion: 'DEL', edad: 25, valor: 180000000, media: 92, pais: 'Francia', equipoActual: 'Real Madrid', estadisticas: { velocidad: 97, regate: 91, fuerza: 75, pase: 82, disparo: 89 } },
  { id: 4, nombre: 'Erling Haaland', posicion: 'DEL', edad: 24, valor: 170000000, media: 91, pais: 'Noruega', equipoActual: 'Manchester City', estadisticas: { velocidad: 90, regate: 78, fuerza: 90, pase: 70, disparo: 93 } },
  { id: 5, nombre: 'Kevin De Bruyne', posicion: 'MED', edad: 33, valor: 90000000, media: 90, pais: 'Bélgica', equipoActual: 'Manchester City', estadisticas: { velocidad: 75, regate: 85, fuerza: 72, pase: 94, disparo: 86 } },
  { id: 6, nombre: 'Luka Modric', posicion: 'MED', edad: 38, valor: 20000000, media: 88, pais: 'Croacia', equipoActual: 'Real Madrid', estadisticas: { velocidad: 70, regate: 89, fuerza: 65, pase: 91, disparo: 78 } },
  { id: 7, nombre: 'Virgil van Dijk', posicion: 'DEF', edad: 33, valor: 60000000, media: 89, pais: 'Países Bajos', equipoActual: 'Liverpool', estadisticas: { velocidad: 78, regate: 70, fuerza: 92, pase: 75, disparo: 60 } },
  { id: 8, nombre: 'Alisson Becker', posicion: 'POR', edad: 31, valor: 55000000, media: 89, pais: 'Brasil', equipoActual: 'Liverpool', estadisticas: { velocidad: 60, regate: 30, fuerza: 78, pase: 50, disparo: 25 } },
  { id: 9, nombre: 'Julián Álvarez', posicion: 'DEL', edad: 24, valor: 70000000, media: 85, pais: 'Argentina', equipoActual: 'Manchester City', estadisticas: { velocidad: 86, regate: 84, fuerza: 70, pase: 78, disparo: 85 } },
  { id: 10, nombre: 'Lautaro Martínez', posicion: 'DEL', edad: 26, valor: 85000000, media: 87, pais: 'Argentina', equipoActual: 'Inter Milan', estadisticas: { velocidad: 84, regate: 82, fuerza: 78, pase: 75, disparo: 88 } },
];

const MercadoPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jugadores, setJugadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroPosicion, setFiltroPosicion] = useState('ALL_POSITIONS');
  const [filtroPais, setFiltroPais] = useState('ALL_COUNTRIES');
  const [filtroMediaMin, setFiltroMediaMin] = useState('');
  const [filtroMediaMax, setFiltroMediaMax] = useState('');

  const [mercadoActivo, setMercadoActivo] = useState(true); 

  useEffect(() => {
    const storedJugadores = JSON.parse(localStorage.getItem('jugadoresZonaNorte')) || initialJugadores;
    setJugadores(storedJugadores);
    if (!localStorage.getItem('jugadoresZonaNorte')) {
        localStorage.setItem('jugadoresZonaNorte', JSON.stringify(initialJugadores));
    }
    const storedMercadoStatus = JSON.parse(localStorage.getItem('mercadoActivo'));
    if (storedMercadoStatus !== null) {
        setMercadoActivo(storedMercadoStatus);
    }
  }, []);

  const posicionesUnicas = useMemo(() => [...new Set(jugadores.map(j => j.posicion).filter(Boolean))], [jugadores]);
  const paisesUnicos = useMemo(() => [...new Set(jugadores.map(j => j.pais).filter(Boolean))], [jugadores]);

  const jugadoresFiltrados = useMemo(() => {
    return jugadores.filter(j => {
      const media = parseInt(j.media, 10);
      const mediaMin = filtroMediaMin ? parseInt(filtroMediaMin, 10) : 0;
      const mediaMax = filtroMediaMax ? parseInt(filtroMediaMax, 10) : 100;
      return (
        (j.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (j.equipoActual && j.equipoActual.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (filtroPosicion === 'ALL_POSITIONS' || j.posicion === filtroPosicion) &&
        (filtroPais === 'ALL_COUNTRIES' || j.pais === filtroPais) &&
        (media >= mediaMin && media <= mediaMax)
      );
    });
  }, [jugadores, searchTerm, filtroPosicion, filtroPais, filtroMediaMin, filtroMediaMax]);

  const solicitarCompra = (jugador) => {
    if (!mercadoActivo) {
      toast({
        variant: "destructive",
        title: "Mercado Cerrado",
        description: "El mercado de fichajes no está activo en este momento.",
      });
      return;
    }
    navigate(`/mercado-equipos/mercado/jugador/${jugador.id}`);
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(jugadores, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'jugadores_zona_norte.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: "Exportación Exitosa", description: "Los datos de los jugadores se han exportado a JSON." });
  };

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-orbitron">Mercado de Fichajes</h1>
          <p className="text-lg text-muted-foreground">Explora, filtra y ficha a las próximas estrellas para tu equipo.</p>
        </div>
        <Button onClick={handleExportJson} variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Download size={18} className="mr-2" /> Exportar Jugadores (JSON)
        </Button>
      </div>

      {!mercadoActivo && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-destructive/20 border border-destructive text-destructive-foreground rounded-lg text-center font-semibold"
        >
          El mercado de fichajes está actualmente CERRADO.
        </motion.div>
      )}
      
      <motion.div 
        className="glass-card p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="searchTerm" className="form-label flex items-center"><Search size={16} className="mr-1 text-primary" /> Buscar Jugador</label>
            <Input
              type="text"
              id="searchTerm"
              placeholder="Nombre o equipo actual..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="filtroPosicion" className="form-label flex items-center"><Filter size={16} className="mr-1 text-primary" /> Posición</label>
            <Select value={filtroPosicion} onValueChange={setFiltroPosicion}>
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Todas las posiciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_POSITIONS">Todas las posiciones</SelectItem>
                {posicionesUnicas.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="filtroPais" className="form-label flex items-center"><Filter size={16} className="mr-1 text-primary" /> País</label>
            <Select value={filtroPais} onValueChange={setFiltroPais}>
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Todos los países" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_COUNTRIES">Todos los países</SelectItem>
                {paisesUnicos.sort().map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="filtroMediaMin" className="form-label">Media Min</label>
              <Input type="number" id="filtroMediaMin" placeholder="Ej: 70" value={filtroMediaMin} onChange={(e) => setFiltroMediaMin(e.target.value)} className="form-input" min="0" max="99" />
            </div>
            <div>
              <label htmlFor="filtroMediaMax" className="form-label">Media Max</label>
              <Input type="number" id="filtroMediaMax" placeholder="Ej: 90" value={filtroMediaMax} onChange={(e) => setFiltroMediaMax(e.target.value)} className="form-input" min="0" max="99" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="table-container glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-center">Pos.</TableHead>
              <TableHead className="text-center">Edad</TableHead>
              <TableHead className="text-center">Media</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Equipo Actual</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jugadoresFiltrados.length > 0 ? jugadoresFiltrados.map((jugador, index) => (
              <motion.tr 
                key={jugador.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="hover:bg-primary/10 transition-colors"
              >
                <TableCell className="font-semibold">{jugador.nombre}</TableCell>
                <TableCell className="text-center"><span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-semibold">{jugador.posicion}</span></TableCell>
                <TableCell className="text-center">{jugador.edad}</TableCell>
                <TableCell className="text-center"><span className={`font-bold text-lg ${jugador.media >= 90 ? 'text-yellow-300' : jugador.media >= 85 ? 'text-green-400' : 'text-foreground'}`}>{jugador.media}</span></TableCell>
                <TableCell className="text-right text-primary font-medium">{formatCurrency(jugador.valor)}</TableCell>
                <TableCell>{jugador.pais}</TableCell>
                <TableCell>{jugador.equipoActual || 'Libre'}</TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20 h-8 w-8" onClick={() => navigate(`/mercado-equipos/mercado/jugador/${jugador.id}`)}>
                    <Eye size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-green-400 hover:bg-green-500/20 h-8 w-8" 
                    onClick={() => solicitarCompra(jugador)}
                    disabled={!mercadoActivo}
                    title={mercadoActivo ? "Iniciar Negociación" : "Mercado Cerrado"}
                  >
                    <ShoppingCart size={16} />
                  </Button>
                </TableCell>
              </motion.tr>
            )) : (
              <TableRow>
                <TableCell colSpan="8" className="text-center py-12 text-muted-foreground text-lg">
                  <Search size={48} className="mx-auto mb-4 text-primary/50" />
                  No se encontraron jugadores con los filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        La base de datos de jugadores se gestiona localmente. Para una experiencia completa y colaborativa, se recomienda integrar con Supabase.
      </p>
    </PageWrapper>
  );
};

export default MercadoPage;