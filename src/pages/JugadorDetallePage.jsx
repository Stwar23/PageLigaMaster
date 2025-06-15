import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, User, Star, Globe, DollarSign as DollarIcon, TrendingUp, Shield, Zap, Dribbble, Target, ShoppingCart, MessageSquare, Send, Clock } from 'lucide-react';
import { AuthContext } from '@/App';

const initialJugadores = [
  { id: 117047, nombre: "Vinicius Junior", media: 94, valor: 86800000, pais: "Brasil", posicion: "DEL", edad: 24, equipoActual: "Real Madrid", estadisticas: { velocidad: 95, regate: 93, fuerza: 70, pase: 84, disparo: 88 } },
  { id: 1, nombre: 'Lionel Messi', posicion: 'DEL', edad: 37, valor: 50000000, media: 93, nacionalidad: 'Argentina', equipoActual: 'Inter Miami', estadisticas: { velocidad: 85, regate: 95, fuerza: 68, pase: 92, disparo: 90 } },
  { id: 2, nombre: 'Cristiano Ronaldo', posicion: 'DEL', edad: 39, valor: 45000000, media: 91, nacionalidad: 'Portugal', equipoActual: 'Al Nassr', estadisticas: { velocidad: 88, regate: 85, fuerza: 80, pase: 80, disparo: 93 } },
  { id: 3, nombre: 'Kylian Mbappé', posicion: 'DEL', edad: 25, valor: 180000000, media: 92, nacionalidad: 'Francia', equipoActual: 'Real Madrid', estadisticas: { velocidad: 97, regate: 91, fuerza: 75, pase: 82, disparo: 89 } },
  { id: 4, nombre: 'Erling Haaland', posicion: 'DEL', edad: 24, valor: 170000000, media: 91, nacionalidad: 'Noruega', equipoActual: 'Manchester City', estadisticas: { velocidad: 90, regate: 80, fuerza: 92, pase: 70, disparo: 94 } },
  { id: 5, nombre: 'Kevin De Bruyne', posicion: 'MED', edad: 33, valor: 90000000, media: 90, nacionalidad: 'Bélgica', equipoActual: 'Manchester City', estadisticas: { velocidad: 78, regate: 86, fuerza: 72, pase: 94, disparo: 87 } },
  { id: 101, nombre: 'Juan Pérez', posicion: 'DEL', edad: 28, valor: 15000000, media: 88, nacionalidad: 'Argentina', equipoActual: 'Titanes FC', estadisticas: { velocidad: 89, regate: 87, fuerza: 75, pase: 80, disparo: 86 } },
  { id: 102, nombre: 'Pedro Gómez', posicion: 'MED', edad: 25, valor: 12000000, media: 85, nacionalidad: 'Uruguay', equipoActual: 'Titanes FC', estadisticas: { velocidad: 82, regate: 84, fuerza: 70, pase: 88, disparo: 79 } },
  { id: 201, nombre: 'Luis García', posicion: 'DEF', edad: 30, valor: 10000000, media: 86, nacionalidad: 'España', equipoActual: 'Gladiadores SV', estadisticas: { velocidad: 80, regate: 75, fuerza: 88, pase: 78, disparo: 65 } },
  { id: 202, nombre: 'Mario Rodríguez', posicion: 'POR', edad: 27, valor: 8000000, media: 84, nacionalidad: 'Colombia', equipoActual: 'Gladiadores SV', estadisticas: { velocidad: 60, regate: 50, fuerza: 80, pase: 65, disparo: 40, paradas: 90 } },
];

const NegociacionJugador = ({ jugador, presupuestoEquipo, onNegociacionTerminada }) => {
  const { toast } = useToast();
  const [oferta, setOferta] = useState('');
  const [respuestaIA, setRespuestaIA] = useState(null);
  const [negociacionBloqueadaHasta, setNegociacionBloqueadaHasta] = useState(null);
  const [tiempoRestanteBloqueo, setTiempoRestanteBloqueo] = useState(0);

  useEffect(() => {
    const bloqueoGuardado = localStorage.getItem(`bloqueo_negociacion_${jugador.id}`);
    if (bloqueoGuardado && new Date(bloqueoGuardado) > new Date()) {
      setNegociacionBloqueadaHasta(new Date(bloqueoGuardado));
    }
  }, [jugador.id]);

  useEffect(() => {
    if (!negociacionBloqueadaHasta) {
      setTiempoRestanteBloqueo(0);
      return;
    }

    const intervalId = setInterval(() => {
      const restante = Math.max(0, Math.floor((negociacionBloqueadaHasta.getTime() - new Date().getTime()) / 1000));
      setTiempoRestanteBloqueo(restante);
      if (restante === 0) {
        setNegociacionBloqueadaHasta(null);
        localStorage.removeItem(`bloqueo_negociacion_${jugador.id}`);
        toast({ title: "Negociación Desbloqueada", description: `Puedes volver a negociar por ${jugador.nombre}.` });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [negociacionBloqueadaHasta, jugador.nombre, toast, jugador.id]);


  const negociarConIA = (ofertaActual, jugadorInfo, presupuesto) => {
    const valor = jugadorInfo.valor;
    const media = jugadorInfo.media;
    const edad = jugadorInfo.edad;
    const margenAceptacion = 0.95; 
    const margenContraoferta = 0.80;
    let factorEdadMedia = 1;

    if (edad < 25 && media > 85) factorEdadMedia = 1.15; // Joven promesa, más caro
    else if (edad < 28 && media > 80) factorEdadMedia = 1.05; // Buen jugador joven
    else if (edad > 32) factorEdadMedia = 0.9; // Veterano, más barato

    const valorAjustado = valor * factorEdadMedia;

    if (ofertaActual > presupuesto) {
      return { respuesta: 'rechazar', mensaje: 'No tienes presupuesto suficiente para esta oferta.' };
    }

    if (ofertaActual >= valorAjustado * margenAceptacion) {
      return { respuesta: 'aceptar', mensaje: `¡Transferencia aceptada por ${formatCurrency(ofertaActual)}! ${jugadorInfo.nombre} es tuyo.` };
    } else if (ofertaActual >= valorAjustado * margenContraoferta) {
      const contra = Math.floor(valorAjustado * (0.96 + Math.random() * 0.08)); // IA pide un poco más
      return {
        respuesta: 'contraoferta',
        nuevaOferta: contra,
        mensaje: `Tu oferta de ${formatCurrency(ofertaActual)} está cerca. El club pide ${formatCurrency(contra)}.`
      };
    } else {
      const tiempoBloqueoMinutos = 1; // 5 minutos para el ejemplo real, 1 para prueba
      const bloqueoHasta = new Date(new Date().getTime() + tiempoBloqueoMinutos * 60 * 1000);
      localStorage.setItem(`bloqueo_negociacion_${jugadorInfo.id}`, bloqueoHasta.toISOString());
      setNegociacionBloqueadaHasta(bloqueoHasta);
      return {
        respuesta: 'rechazar_bloqueo',
        mensaje: `La oferta de ${formatCurrency(ofertaActual)} es demasiado baja. Negociación bloqueada por ${tiempoBloqueoMinutos} minuto(s).`
      };
    }
  };

  const handleEnviarOferta = () => {
    if (negociacionBloqueadaHasta && new Date() < negociacionBloqueadaHasta) {
      toast({ variant: "destructive", title: "Negociación Bloqueada", description: `Intenta de nuevo en ${tiempoRestanteBloqueo} segundos.` });
      return;
    }

    const ofertaNum = parseFloat(oferta);
    if (isNaN(ofertaNum) || ofertaNum <= 0) {
      toast({ variant: "destructive", title: "Oferta Inválida", description: "Ingresa un monto válido." });
      return;
    }

    const resultado = negociarConIA(ofertaNum, jugador, presupuestoEquipo);
    setRespuestaIA(resultado);

    if (resultado.respuesta === 'aceptar') {
      toast({ title: "¡Fichaje Exitoso!", description: resultado.mensaje, duration: 5000 });
      onNegociacionTerminada(jugador, ofertaNum);
      // Aquí se podría actualizar el localStorage o llamar a una función para actualizar el equipo del usuario
    } else if (resultado.respuesta === 'contraoferta') {
      toast({ title: "Contraoferta Recibida", description: resultado.mensaje, duration: 5000 });
    } else if (resultado.respuesta === 'rechazar_bloqueo') {
      toast({ variant: "destructive", title: "Oferta Rechazada y Bloqueada", description: resultado.mensaje, duration: 5000 });
    } else {
      toast({ variant: "destructive", title: "Oferta Rechazada", description: resultado.mensaje, duration: 5000 });
    }
    setOferta('');
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 glass-card p-6"
    >
      <h3 className="text-2xl font-semibold text-primary mb-4 font-orbitron flex items-center">
        <MessageSquare size={24} className="mr-2" /> Sala de Negociación
      </h3>
      {negociacionBloqueadaHasta && tiempoRestanteBloqueo > 0 ? (
        <div className="text-center p-4 bg-destructive/20 border border-destructive rounded-md">
          <Clock size={32} className="mx-auto mb-2 text-destructive" />
          <p className="font-semibold text-destructive-foreground">Negociación Bloqueada</p>
          <p className="text-sm text-destructive-foreground">Podrás volver a ofertar por {jugador.nombre} en:</p>
          <p className="text-2xl font-bold text-destructive-foreground mt-1">{Math.floor(tiempoRestanteBloqueo / 60)}:{('0' + (tiempoRestanteBloqueo % 60)).slice(-2)}</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="oferta" className="form-label">Tu Oferta (ARS):</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                id="oferta"
                value={oferta}
                onChange={(e) => setOferta(e.target.value)}
                placeholder={`Valor: ${formatCurrency(jugador.valor)}`}
                className="form-input"
              />
              <Button onClick={handleEnviarOferta} className="bg-primary hover:bg-accent text-primary-foreground">
                <Send size={18} className="mr-2" /> Enviar Oferta
              </Button>
            </div>
          </div>
          {respuestaIA && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-4 p-4 rounded-md text-sm ${
                respuestaIA.respuesta === 'aceptar' ? 'bg-green-500/20 text-green-300 border border-green-500' :
                respuestaIA.respuesta === 'contraoferta' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500' :
                'bg-red-500/20 text-red-300 border border-red-500'
              }`}
            >
              <p className="font-semibold">Respuesta del Club ({jugador.equipoActual || 'Vendedor'}):</p>
              <p>{respuestaIA.mensaje}</p>
              {respuestaIA.nuevaOferta && <p className="mt-1">Contraoferta: <span className="font-bold">{formatCurrency(respuestaIA.nuevaOferta)}</span></p>}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};


const JugadorDetallePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const [jugador, setJugador] = useState(null);
  const [mercadoActivo, setMercadoActivo] = useState(true); // Admin control
  const [presupuestoUsuario, setPresupuestoUsuario] = useState(500000000); // Simulado

  useEffect(() => {
    const storedJugadores = JSON.parse(localStorage.getItem('jugadoresZonaNorte')) || initialJugadores;
    const jugadorEncontrado = storedJugadores.find(j => j.id.toString() === id);
    setJugador(jugadorEncontrado);

    const storedMercadoStatus = JSON.parse(localStorage.getItem('mercadoActivo'));
    if (storedMercadoStatus !== null) setMercadoActivo(storedMercadoStatus);
    
    // Simular carga de presupuesto del usuario/equipo
    if (user && user.teamId) {
        const economiaEquipos = JSON.parse(localStorage.getItem('economiaEquipos')) || [];
        const equipoUsuario = economiaEquipos.find(e => e.id === user.teamId);
        if (equipoUsuario) {
            setPresupuestoUsuario(equipoUsuario.presupuesto + (equipoUsuario.ingresos || 0) - (equipoUsuario.multas || 0) + (equipoUsuario.transferencias || 0) );
        }
    }

  }, [id, user]);

  const handleNegociacionTerminada = (jugadorFichado, precioPagado) => {
    // Lógica para cuando se acepta una oferta
    // 1. Actualizar presupuesto del equipo
    if (user && user.teamId) {
        let economiaEquipos = JSON.parse(localStorage.getItem('economiaEquipos')) || [];
        economiaEquipos = economiaEquipos.map(eq => {
            if (eq.id === user.teamId) {
                return { ...eq, presupuesto: eq.presupuesto - precioPagado, transferencias: (eq.transferencias || 0) - precioPagado };
            }
            return eq;
        });
        localStorage.setItem('economiaEquipos', JSON.stringify(economiaEquipos));
        setPresupuestoUsuario(prev => prev - precioPagado); // Actualizar estado local
    }

    // 2. Añadir jugador a la plantilla del equipo del usuario (simulado)
    let plantillas = JSON.parse(localStorage.getItem('plantillasEquipos')) || {};
    if (!plantillas[user.teamId]) plantillas[user.teamId] = [];
    plantillas[user.teamId].push({...jugadorFichado, equipoActual: `Equipo de ${user.username}`}); // Marcar como fichado
    localStorage.setItem('plantillasEquipos', JSON.stringify(plantillas));

    // 3. Marcar jugador como no disponible en el mercado general o actualizar su equipo
    let jugadoresMercado = JSON.parse(localStorage.getItem('jugadoresZonaNorte')) || initialJugadores;
    jugadoresMercado = jugadoresMercado.map(j => {
        if (j.id === jugadorFichado.id) {
            return {...j, equipoActual: `Equipo de ${user.username}`}; // O marcar como "Fichado"
        }
        return j;
    });
    localStorage.setItem('jugadoresZonaNorte', JSON.stringify(jugadoresMercado));
    setJugador(prev => ({...prev, equipoActual: `Equipo de ${user.username}`})); // Actualizar estado local del jugador
    
    toast({ title: "¡Fichaje Completado!", description: `${jugadorFichado.nombre} ahora forma parte de tu equipo. Presupuesto actualizado.`});
  };


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  if (!jugador) {
    return <div className="text-center py-10 text-xl">Cargando datos del jugador...</div>;
  }

  const statsPrincipales = [
    { label: 'Velocidad', value: jugador.estadisticas.velocidad, icon: <Zap size={20} /> },
    { label: 'Regate', value: jugador.estadisticas.regate, icon: <Dribbble size={20} /> },
    { label: 'Disparo', value: jugador.estadisticas.disparo, icon: <Target size={20} /> },
    { label: 'Pase', value: jugador.estadisticas.pase, icon: <TrendingUp size={20} /> },
    { label: 'Fuerza', value: jugador.estadisticas.fuerza, icon: <Shield size={20} /> },
  ];
  if (jugador.posicion === 'POR' && jugador.estadisticas.paradas) {
    statsPrincipales.push({ label: 'Paradas', value: jugador.estadisticas.paradas, icon: <Shield size={20} /> });
  }

  const puedeNegociar = user && user.role === 'participante' && mercadoActivo;

  return (
    <>
      <Link to="/mercado-equipos/mercado" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
        <ArrowLeft size={18} className="mr-1" /> Volver al Mercado
      </Link>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary">
            <User size={80} className="text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-orbitron mb-1">{jugador.nombre}</h1>
            <p className="text-xl text-muted-foreground mb-3">{jugador.posicion} - {jugador.edad} años</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
              <InfoChip icon={<Star size={18} />} label="Media" value={jugador.media} valueClass="text-yellow-400" />
              <InfoChip icon={<Globe size={18} />} label="País" value={jugador.pais || jugador.nacionalidad} />
              <InfoChip icon={<DollarIcon size={18} />} label="Valor Mercado" value={formatCurrency(jugador.valor)} valueClass="text-green-400" />
            </div>
            <p className="text-md text-foreground">Equipo Actual: <span className="font-semibold">{jugador.equipoActual || 'Libre'}</span></p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-primary mb-4 font-orbitron">Estadísticas Clave</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {statsPrincipales.map(stat => (
              <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
        
        {puedeNegociar && (
          <NegociacionJugador 
            jugador={jugador} 
            presupuestoEquipo={presupuestoUsuario} 
            onNegociacionTerminada={handleNegociacionTerminada}
          />
        )}

        {!mercadoActivo && user && user.role === 'participante' && (
            <p className="text-sm text-red-400 mt-6 text-center md:text-left p-4 bg-destructive/10 border border-destructive rounded-md">
                <Clock size={16} className="inline mr-1" /> El mercado de fichajes está actualmente cerrado. No se pueden realizar negociaciones.
            </p>
        )}
        {!user && (
            <p className="text-sm text-muted-foreground mt-6 text-center md:text-left p-4 bg-input/50 border border-border rounded-md">
                <Link to="/login" className="text-primary hover:underline font-semibold">Inicia sesión</Link> como participante para negociar por este jugador.
            </p>
        )}
         {user && user.role !== 'participante' && (
            <p className="text-sm text-muted-foreground mt-6 text-center md:text-left p-4 bg-input/50 border border-border rounded-md">
                Solo los participantes pueden negociar fichajes.
            </p>
        )}


      </motion.div>
    </>
  );
};

const InfoChip = ({ icon, label, value, valueClass = 'text-foreground' }) => (
  <div className="flex items-center space-x-1 bg-card/50 px-3 py-1.5 rounded-full border border-primary/20">
    <span className="text-primary">{icon}</span>
    <span className="text-xs text-muted-foreground">{label}:</span>
    <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
  </div>
);

const StatCard = ({ icon, label, value }) => {
  const getStatColor = (val) => {
    if (val >= 90) return 'text-yellow-400';
    if (val >= 80) return 'text-green-400';
    if (val >= 70) return 'text-blue-400';
    return 'text-foreground';
  };
  return (
    <div className="bg-card/50 p-4 rounded-lg text-center border border-primary/20 hover:shadow-primary/30 transition-shadow">
      <div className="text-primary mx-auto mb-2 w-fit p-2 bg-primary/10 rounded-full">{icon}</div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-3xl font-bold ${getStatColor(value)}`}>{value}</p>
    </div>
  );
};

export default JugadorDetallePage;