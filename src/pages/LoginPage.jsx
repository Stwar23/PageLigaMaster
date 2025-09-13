import React, { useState, useContext, useEffect } from 'react';
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
  const [esValidoRegistrar, setEsValidoRegistrar] = useState();

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
        const userRole = data.user?.user_metadata?.roles;
        if (userRole === 'Administrador') {
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

  useEffect(() => {
    const fetchValidarRegistro = async () => {
      const { data, error } = await supabase.rpc("fn_verificar_registro_nuevos_usuarios");
      
      if (error) {
        console.error("Error al obtener posiciones:", error);
      } else {
        setEsValidoRegistrar(data);
      }
    };

    fetchValidarRegistro();
  }, []);


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
                placeholder="tunombreusuario@zonanorte.com"
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
            ¿No tienes cuenta? Contacta a un administrador para que habilite el registro.
          </p>

          <div className="text-center">
            {esValidoRegistrar === 1 ? (
              <Button className="w-full"
                onClick={() => navigate(`/login/registro`)}
              > Registrarme</Button>
            ) : (
              ""
            )}
          </div>
          
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;