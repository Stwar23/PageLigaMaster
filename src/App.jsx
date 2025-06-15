import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageWrapper from '@/components/layout/PageWrapper';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

import HomePage from '@/pages/HomePage';
import ClasificacionPage from '@/pages/ClasificacionPage';
import CalendarioPage from '@/pages/CalendarioPage';
import RegistrarPartidoPage from '@/pages/RegistrarPartidoPage';
import EconomiaPage from '@/pages/EconomiaPage';
import MercadoPage from '@/pages/MercadoPage';
import ContactoPage from '@/pages/ContactoPage';
import EquiposPage from '@/pages/EquiposPage';
import EquipoDetallePage from '@/pages/EquipoDetallePage';
import JugadorDetallePage from '@/pages/JugadorDetallePage';

import AdminPage from '@/pages/AdminPage';
import AdminGestionParticipantes from '@/pages/admin/AdminGestionParticipantes';
import AdminGestionEquipos from '@/pages/admin/AdminGestionEquipos';
import AdminGestionLigas from '@/pages/admin/AdminGestionLigas';
import AdminGestionCopas from '@/pages/admin/AdminGestionCopas';

import LoginPage from '@/pages/LoginPage';

import { Home, ListChecks, CalendarDays, Edit3, DollarSign, Users, Mail, Shield, Settings, LogIn, LogOut, Newspaper, Trophy as TrophyIcon, KeyRound as UsersRound, Library, Award } from 'lucide-react';

export const AuthContext = createContext(null);

const initialNavItems = [
  { name: 'Inicio', path: '/', icon: <Home size={20} />, roles: ['all'] },
  { 
    name: 'Torneos', 
    path: '/torneos', 
    icon: <TrophyIcon size={20} />, 
    roles: ['all'], 
    subMenuOffset: 'left-0', 
    subMenu: [
      { name: 'Ligas', path: '/torneos/ligas', icon: <Library size={18} />, roles: ['all'], 
        nestedSubMenu: [
          { name: 'Clasificación', path: '/torneos/ligas/clasificacion', icon: <ListChecks size={16} />, roles: ['all'] },
          { name: 'Calendario', path: '/torneos/ligas/calendario', icon: <CalendarDays size={16} />, roles: ['all'] },
          { name: 'Registrar Partido', path: '/torneos/ligas/registrar-partido', icon: <Edit3 size={16} />, roles: ['participante', 'admin'] },
        ]
      },
      { name: 'Copas', path: '/torneos/copas', icon: <Award size={18} />, roles: ['all'] },
    ]
  },
  { 
    name: 'Comunidad', 
    path: '/comunidad', 
    icon: <UsersRound size={20} />, 
    roles: ['all'], 
    subMenuOffset: 'left-1/2 -translate-x-1/2', 
    subMenu: [
      { name: 'Mercado de Fichajes', path: '/comunidad/mercado', icon: <DollarSign size={18} />, roles: ['all'] },
      { name: 'Equipos', path: '/comunidad/equipos', icon: <Shield size={18} />, roles: ['all'] },
      { name: 'Economía', path: '/comunidad/economia', icon: <DollarSign size={18} />, roles: ['participante', 'admin'] },
    ]
  },
  { name: 'Noticias', path: '/noticias', icon: <Newspaper size={20} />, roles: ['all'] },
  { name: 'Contacto', path: '/contacto', icon: <Mail size={20} />, roles: ['all'] },
];


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { session, loadingAuth } = useContext(AuthContext);
  
  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen"><p>Cargando sesión...</p></div>;
  }

  const userRole = session?.user?.user_metadata?.role || 'guest';

  if (!session && (allowedRoles.includes('participante') || allowedRoles.includes('admin'))) {
    return <Navigate to="/login" replace />;
  }
  if (session && !allowedRoles.includes('all') && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; 
  }
  return children;
};

function AppContent() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoadingAuth(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setLoadingAuth(false);
        if (_event === 'SIGNED_IN') {
          toast({ title: "¡Bienvenido de nuevo!", description: `Has iniciado sesión.` });
        } else if (_event === 'SIGNED_OUT') {
          toast({ title: "Sesión cerrada", description: "Has cerrado sesión exitosamente." });
        }
      }
    );
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [toast]);
  
  const getNavItems = () => {
    const userRole = session?.user?.user_metadata?.role || 'guest';

    let nav = initialNavItems.map(item => {
      let filteredItem = { ...item };
      if (item.roles.includes('all') || item.roles.includes(userRole)) {
        if (item.subMenu) {
          filteredItem.subMenu = item.subMenu.filter(subItem => 
            subItem.roles.includes('all') || subItem.roles.includes(userRole)
          ).map(subItem => {
            if (subItem.nestedSubMenu) {
              return {
                ...subItem,
                nestedSubMenu: subItem.nestedSubMenu.filter(nested => 
                  nested.roles.includes('all') || nested.roles.includes(userRole)
                )
              };
            }
            return subItem;
          }).filter(subItem => !subItem.nestedSubMenu || subItem.nestedSubMenu.length > 0);
        }
        return filteredItem;
      }
      return null;
    }).filter(Boolean);
    
    if (userRole === 'admin') {
      nav.push({ name: 'Admin Panel', path: '/admin', icon: <Settings size={20} />, roles: ['admin'] });
    }
    if (session) {
      nav.push({ name: 'Logout', path: '/logout', icon: <LogOut size={20} />, action: async () => { await supabase.auth.signOut(); navigate('/'); }, roles:['participante', 'admin'] });
    } else {
      nav.push({ name: 'Login', path: '/login', icon: <LogIn size={20} />, roles:['all'] });
    }
    return nav;
  };

  return (
    <AuthContext.Provider value={{ session, loadingAuth }}>
        <div className="min-h-screen bg-background flex flex-col">
          <Header navItems={getNavItems()} />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                
                <Route path="/torneos/ligas/clasificacion" element={<PageWrapper><ClasificacionPage /></PageWrapper>} />
                <Route path="/torneos/ligas/calendario" element={<PageWrapper><CalendarioPage /></PageWrapper>} />
                <Route path="/torneos/ligas/registrar-partido" element={<ProtectedRoute allowedRoles={['participante', 'admin']}><PageWrapper><RegistrarPartidoPage /></PageWrapper></ProtectedRoute>} />
                <Route path="/torneos/copas" element={<PageWrapper><div><h1 className="text-3xl font-bold">Sección de Copas</h1><p>Próximamente emocionantes torneos de copa...</p></div></PageWrapper>} />

                <Route path="/comunidad/economia" element={<ProtectedRoute allowedRoles={['participante', 'admin']}><PageWrapper><EconomiaPage /></PageWrapper></ProtectedRoute>} />
                <Route path="/comunidad/mercado" element={<PageWrapper><MercadoPage /></PageWrapper>} />
                <Route path="/comunidad/mercado/jugador/:id" element={<PageWrapper><JugadorDetallePage /></PageWrapper>} />
                <Route path="/comunidad/equipos" element={<PageWrapper><EquiposPage /></PageWrapper>} />
                <Route path="/comunidad/equipos/:id" element={<PageWrapper><EquipoDetallePage /></PageWrapper>} />
                
                <Route path="/noticias" element={<PageWrapper><div><h1 className="text-3xl font-bold">Noticias</h1><p>Próximamente...</p></div></PageWrapper>} />
                <Route path="/contacto" element={<PageWrapper><ContactoPage /></PageWrapper>} />
                
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminPage /></PageWrapper></ProtectedRoute>} />
                <Route path="/admin/participantes" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminGestionParticipantes /></PageWrapper></ProtectedRoute>} />
                <Route path="/admin/equipos" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminGestionEquipos /></PageWrapper></ProtectedRoute>} />
                <Route path="/admin/ligas" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminGestionLigas /></PageWrapper></ProtectedRoute>} />
                <Route path="/admin/copas" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminGestionCopas /></PageWrapper></ProtectedRoute>} />

                <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
                <Route path="/logout" element={<Navigate to="/" />} />

                <Route path="/torneo/clasificacion" element={<Navigate to="/torneos/ligas/clasificacion" replace />} />
                <Route path="/torneo/calendario" element={<Navigate to="/torneos/ligas/calendario" replace />} />
                <Route path="/torneo/registrar-partido" element={<Navigate to="/torneos/ligas/registrar-partido" replace />} />
                <Route path="/mercado-equipos/economia" element={<Navigate to="/comunidad/economia" replace />} />
                <Route path="/mercado-equipos/mercado" element={<Navigate to="/comunidad/mercado" replace />} />
                <Route path="/mercado-equipos/mercado/jugador/:id" element={<Navigate to="/comunidad/mercado/jugador/:id" replace />} />
                <Route path="/mercado-equipos/equipos" element={<Navigate to="/comunidad/equipos" replace />} />
                <Route path="/mercado-equipos/equipos/:id" element={<Navigate to="/comunidad/equipos/:id" replace />} />

              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
          <Toaster />
        </div>
    </AuthContext.Provider>
  );
}

// Wrap AppContent with Router to use useNavigate
const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;