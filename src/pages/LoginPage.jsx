import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AuthContext } from '@/App';
import { supabase } from '@/lib/supabaseClient';
import { LogIn, User, Lock, ShieldAlert, ArrowLeft, Mail as MailIcon, UserPlus } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: error.message || "Correo o contraseña incorrectos.",
        });
      } else if (data.session) {
        const userRole = data.user?.user_metadata?.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
         toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: "No se pudo iniciar sesión. Inténtalo de nuevo.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "Ocurrió un error. Por favor, inténtalo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDevAdminSignUp = async () => {
    setLoading(true);
    const adminEmail = 'alejo@zonanorte.com'; 
    const adminPassword = 'AdminPassword123!'; // Asegúrate de usar una contraseña segura y recordarla

    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          role: 'admin', 
          username: 'Alejo'
        }
      }
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        toast({ title: "Info (Admin)", description: "El usuario admin 'Alejo' ya existe. Intenta iniciar sesión." });
      } else if (error.message.includes("rate limit")) {
        toast({ variant: "destructive", title: "Límite de Tasa Excedido", description: "Demasiados intentos de registro. Espera un momento y prueba de nuevo, o deshabilita la confirmación por email en Supabase para desarrollo." });
      } else {
        toast({ variant: "destructive", title: "Error de Registro (Admin)", description: error.message });
      }
    } else if (data.user) {
      toast({ title: "Admin Registrado", description: "Usuario admin 'Alejo' creado/confirmado. Si la confirmación por email está activa en Supabase, revisa tu correo." });
    }
    setLoading(false);
  };


  if (session) {
    return (
      <div className="text-center py-10">
        <ShieldAlert size={64} className="mx-auto text-green-400 mb-4" />
        <h1 className="text-3xl font-bold text-primary mb-2">Ya has iniciado sesión</h1>
        <p className="text-lg text-muted-foreground">Usuario: {session.user.email}</p>
        <Button asChild className="mt-6"><Link to="/">Volver al Inicio</Link></Button>
      </div>
    );
  }

  return (
    <>
      <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft size={18} className="mr-1" /> Volver a Inicio
      </Link>
      <div className="flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-card p-8 space-y-6"
        >
          <div className="text-center">
            <LogIn size={48} className="mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold text-primary font-orbitron">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Accede a tu cuenta de Zona Norte.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="form-label flex items-center">
                <MailIcon size={16} className="mr-2 text-primary" /> Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="tu@correo.com"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label flex items-center">
                <Lock size={16} className="mr-2 text-primary" /> Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Tu contraseña"
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-3" disabled={loading}>
              {loading ? 'Ingresando...' : <><LogIn size={20} className="mr-2" /> Entrar</>}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground">
            ¿No tienes cuenta? Contacta a un administrador para el registro.
          </p>
          <Button onClick={handleDevAdminSignUp} variant="outline" size="sm" className="w-full mt-2 text-xs" disabled={loading}>
            {loading ? 'Procesando...' : <><UserPlus size={14} className="mr-1" /> Dev: Crear/Verificar Admin (Alejo)</>}
          </Button>
           <p className="text-xs text-center text-muted-foreground mt-1">
            Admin Email: alejo@zonanorte.com / Pass: AdminPassword123!
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;