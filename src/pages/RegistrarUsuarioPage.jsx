import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AuthContext } from '@/App';
import { supabase } from '@/lib/supabaseClient';
import { Mail as MailIcon, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [esValidoRegistrar, setEsValidoRegistrar] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [mensajeModal, setMensajeModal] = useState('');
  const [mostrarBotonAceptar, setMostrarBotonAceptar] = useState(false);
  const [botonDeshabilitado, setBotonDeshabilitado] = useState(false);


  useEffect(() => {
    const fetchValidarRegistro = async () => {
      const { data, error } = await supabase.rpc("fn_verificar_registro_nuevos_usuarios");
      if (error) {
        console.error("Error al verificar:", error);
      } else {
        setEsValidoRegistrar(data);
      }
    };

    fetchValidarRegistro();
  }, []);

  const registrarNuevoUsuario = async () => {
    const emailCompleto = `${email}@zonanorte.com`;

    if (!email || !password) {
      toast({ title: 'Error', description: 'Debe ingresar usuario y contraseña', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Contraseña débil', description: 'Debe tener al menos 6 caracteres', variant: 'destructive' });
      return;
    }

    // Mostrar modal y deshabilitar botón
    setBotonDeshabilitado(true);
    setMensajeModal('Creando usuario...');
    setMostrarModalExito(true);
    setMostrarBotonAceptar(false);

    const { data, error } = await supabase.auth.signUp({
      email: emailCompleto,
      password: password
    });

    if (error?.message.includes("User already registered")) {
      setMensajeModal("Este correo ya está registrado.");
      setMostrarBotonAceptar(true);
      setBotonDeshabilitado(false);
      return;
    }

    if (error) {
      setMensajeModal("Ha ocurrido un error al crear el usuario.");
      setMostrarBotonAceptar(true);
      setBotonDeshabilitado(false);
    } else {
      setMensajeModal("¡Usuario creado con éxito!");
      setMostrarBotonAceptar(true);
      setBotonDeshabilitado(false);
    }
  };


  return (
    <div className="flex items-center justify-center">
      <div className="bg-black rounded-2xl shadow-lg p-10 w-full max-w-md">

        {mostrarModalExito && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className="bg-black text-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-white/10">
              <h2 className="text-xl font-bold mb-4">{mensajeModal}</h2>

              {mensajeModal === 'Creando usuario...' && (
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 animate-pulse w-full"></div>
                </div>
              )}

              {mostrarBotonAceptar && (
                <Button
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setMostrarModalExito(false);
                    navigate('/login');
                  }}
                >
                  Aceptar
                </Button>
              )}
            </div>
          </div>
        )}

        {esValidoRegistrar === 0 ? (
          <div className="text-center text-red-600 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p className="text-lg font-semibold">El registro de usuarios está deshabilitado, contacta a algún administrador.</p>
          </div>
        ) : esValidoRegistrar === null ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Registro Zona Norte</h2>

            <div className="space-y-4">
              <div className="relative">
                <MailIcon className="absolute top-3 left-3 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="usuario (sin @zonanorte.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring focus:ring-blue-200 text-black"
                />
              </div>

              <div className="relative">
                <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring focus:ring-blue-200 text-black"
                />
              </div>

              <Button className="w-full mt-4" onClick={registrarNuevoUsuario} disabled={botonDeshabilitado}>
                {botonDeshabilitado ? "Registrando..." : "Registrarse"}
              </Button>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
