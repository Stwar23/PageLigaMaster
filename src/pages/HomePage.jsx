import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, BarChartHorizontalBig, Users, Newspaper, Trophy, Users2, DollarSign } from 'lucide-react';

const HomePage = () => (
  <div className="text-center">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative bg-cover bg-center text-white py-20 md:py-32 mb-12"
      style={{ backgroundImage: `url('/images/zn-hero-banner.png')` }}
    >
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="relative container mx-auto px-4 z-10">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100, delay: 0.2 }}
          className="inline-block mb-6"
        >
          <img src="/zonanorte-logo.svg" alt="Zona Norte Logo Grande" className="h-24 w-24 md:h-32 md:w-32 mx-auto filter drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
        </motion.div>
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-4 font-orbitron text-shadow-gold"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Bienvenido a Zona Norte
        </motion.h1>
        <motion.p 
          className="text-2xl md:text-3xl text-gold-light italic mb-10 font-roboto text-shadow-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          "Fortuna favet audacibus"
        </motion.p>
        <motion.p 
          className="text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          Tu comunidad de fútbol virtual definitiva. Aquí, la pasión por el deporte rey se transforma en una competencia vibrante y organizada, con un fuerte énfasis en reglas claras, estadísticas detalladas, una economía interna estratégica y un compromiso inquebrantable con el fair play.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
            <Button asChild size="lg" className="bg-primary hover:bg-accent text-primary-foreground font-semibold shadow-lg hover:shadow-primary/50 transform hover:scale-105 transition-all duration-300">
                <Link to="/torneos/ligas/clasificacion">Ver Clasificación</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 hover:text-primary font-semibold shadow-md hover:shadow-primary/40 transform hover:scale-105 transition-all duration-300">
                <Link to="/comunidad/mercado">Explorar Mercado</Link>
            </Button>
        </motion.div>
      </div>
    </motion.div>

    <h2 className="text-4xl font-bold font-orbitron mb-10 text-primary">Características Destacadas</h2>
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 container mx-auto px-4"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
    >
      {[
        { icon: <Trophy size={48} className="text-primary"/>, title: "Torneos Épicos", desc: "Participa en ligas y copas emocionantes con formatos competitivos." },
        { icon: <DollarSign size={48} className="text-primary"/>, title: "Economía Realista", desc: "Gestiona el presupuesto de tu equipo, ficha jugadores y haz crecer tu club." },
        { icon: <Users2 size={48} className="text-primary"/>, title: "Comunidad Activa", desc: "Conéctate con otros managers, negocia y compite por la gloria." },
        { icon: <BarChartHorizontalBig size={48} className="text-primary"/>, title: "Estadísticas Detalladas", desc: "Sigue el rendimiento de equipos y jugadores con datos precisos." },
        { icon: <ShieldCheck size={48} className="text-primary"/>, title: "Juego Limpio", desc: "Compromiso con la transparencia y reglas claras para todos los participantes." },
        { icon: <Newspaper size={48} className="text-primary"/>, title: "Noticias y Actualidad", desc: "Mantente al día con las últimas novedades y eventos de Zona Norte." },
      ].map((item, i) => (
        <motion.div 
          key={i}
          className="glass-card p-6 text-center h-full flex flex-col justify-start hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1"
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.03, boxShadow: "0px 5px 20px rgba(212,175,55,0.3)" }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex justify-center mb-4">{item.icon}</div>
          <h3 className="text-2xl font-semibold mb-3 font-orbitron">{item.title}</h3>
          <p className="text-muted-foreground flex-grow text-sm leading-relaxed">{item.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

export default HomePage;