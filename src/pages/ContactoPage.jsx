import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Mail, MessageSquare, Phone, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactoPage = () => {
  const { toast } = useToast();
  const [contactData, setContactData] = useState({ nombre: '', correo: '', mensaje: '' });

  const handleChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactData.nombre || !contactData.correo || !contactData.mensaje) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos.",
      });
      return;
    }
    localStorage.setItem('lastContactMessage', JSON.stringify(contactData));
    toast({
      title: "¡Mensaje Enviado!",
      description: `Gracias por contactarnos, ${contactData.nombre}. Te responderemos pronto.`,
    });
    setContactData({ nombre: '', correo: '', mensaje: '' });
  };

  return (
    <>
      <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft size={18} className="mr-1" /> Volver a Inicio
      </Link>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 font-orbitron">Contacto</h1>
        <p className="text-lg text-muted-foreground mb-10">¿Tienes dudas o quieres unirte? ¡Contáctanos!</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div 
          className="glass-card p-8 space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-primary mb-4 font-orbitron">Envíanos un Mensaje</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="form-label">Nombre Completo</label>
              <input type="text" name="nombre" id="nombre" value={contactData.nombre} onChange={handleChange} className="form-input" placeholder="Tu nombre" required />
            </div>
            <div>
              <label htmlFor="correo" className="form-label">Correo Electrónico</label>
              <input type="email" name="correo" id="correo" value={contactData.correo} onChange={handleChange} className="form-input" placeholder="tu@correo.com" required />
            </div>
            <div>
              <label htmlFor="mensaje" className="form-label">Mensaje</label>
              <textarea name="mensaje" id="mensaje" value={contactData.mensaje} onChange={handleChange} rows="5" className="form-input" placeholder="Escribe tu consulta aquí..." required></textarea>
            </div>
            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-3">
              Enviar Mensaje <Send size={18} className="ml-2"/>
            </Button>
          </form>
        </motion.div>

        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass-card p-8">
            <h3 className="text-xl font-semibold text-primary mb-3 font-orbitron">Otras Formas de Contacto</h3>
            <a href="mailto:contacto@zonanorte.com" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-colors group">
              <Mail size={24} className="text-primary group-hover:text-accent"/>
              <span className="text-foreground group-hover:text-primary">contacto@zonanorte.com</span>
            </a>
            <Button variant="outline" className="w-full mt-4 border-primary text-primary hover:bg-primary/10 flex items-center justify-center space-x-2 py-3" onClick={() => window.open('https://discord.gg/tu-servidor', '_blank')}>
              <MessageSquare size={20}/>
              <span>Únete a nuestro Discord</span>
            </Button>
            <Button variant="outline" className="w-full mt-3 border-primary text-primary hover:bg-primary/10 flex items-center justify-center space-x-2 py-3" onClick={() => window.open('https://wa.me/1234567890', '_blank')}>
              <Phone size={20}/>
              <span>Contáctanos por WhatsApp</span>
            </Button>
          </div>
          <div className="glass-card p-8">
            <h3 className="text-xl font-semibold text-primary mb-3 font-orbitron">Nuestra Sede Virtual</h3>
            <p className="text-muted-foreground">Operamos 100% online, conectando jugadores de todas partes del mundo.</p>
            <div className="mt-4 h-48 bg-input rounded-lg flex items-center justify-center border border-border">
              <p className="text-muted-foreground italic">(Espacio para mapa de OpenStreetMap si fuera necesario)</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ContactoPage;