import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageWrapper from "@/components/layout/PageWrapper";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

import HomePage from "@/pages/HomePage";
import MercadoPage from "@/pages/MercadoPage";
import ContactoPage from "@/pages/ContactoPage";
import EquiposPage from "@/pages/EquiposPage";
import RegistrarUsuarioPage from "@/pages/RegistrarUsuarioPage";
import InformacionEquipoGeneralPage from "@/pages/InformacionEquipoGeneralPage";

import RedireccionMiEquipo from "@/components/validations/RedireccionMiEquipo";
import RedireccionNegociacionClubes from "@/components/validations/RedireccionNegociacionClubes";

import RedireccionNotificacionesEquipo from "@/components/validations/RedireccionNotificacionesEquipo";

import AdminPage from "@/pages/AdminPage";

import LoginPage from "@/pages/LoginPage";

import {
  Home, UserCircle, Shield, CalendarDays, Store, ShieldUser,
  DollarSign, Settings,LogIn,LogOut,Newspaper, Handshake, ChartCandlestick,
  KeyRound as UsersRound,
} from "lucide-react";


import DetalleJugadorPage from "./pages/DetalleJugadorPage";
import NegociacionClubes from "./pages/NegociacionClubes";
import NotificacionMercadoPage from "./pages/NotificacionMercadoPage";
import ValoresMercadoPage from "./pages/ValoresMercado";

export const AuthContext = createContext(null);

const initialNavItems = [
  { 
    name: "Inicio", path: "/", 
    icon: <Home size={20} />, 
    roles: ["all", "Participante", "Administrador"] 
  },

  {
    name: "Mercado",
    path: "/mercado",
    icon: <ChartCandlestick size={20} />,
    roles: ["all", "Participante", "Administrador"],
    subMenuOffset: "left-1/2 -translate-x-1/2",
    subMenu: [
      {
        name: "Mercado de Fichajes",
        path: "/mercado/jugadores",
        icon: <Store size={18} />,
        roles: ["all", "Participante", "Administrador"],
      },
      {
        name: "Negociaciones clubes",
        path: "/mercado/negociacion-clubes",
        icon: <Handshake size={18} />,
        roles: ["Participante", "Administrador"],
      },
      {
        name: "Valores del mercado",
        path: "/mercado/valores-mercado",
        icon: <DollarSign size={18} />,
        roles: ["Participante", "Administrador"],
      },
    ],
  },

  {
    name: "Equipos",
    path: "/equipos",
    icon: <Shield size={18} />,
    roles: ["Participante", "Administrador"],
    subMenu: [
      {
        name: "Equipos",
        path: "/equipos",
        icon: <UserCircle size={16} />,
        roles: ["Participante", "Administrador"],
      },
      {
        name: "Mi equipo",
        path: "equipo/mi-equipo",
        icon: <ShieldUser size={16} />,
        roles: ["Participante", "Administrador"],
      },
      {
        name: "Mis notificaciones",
        path: "equipo/notificaciones",
        icon: <CalendarDays size={16} />,
        roles: ["Participante", "Administrador"],
      },
    ],
  },

  {
    name: "Noticias",
    path: "/noticias",
    icon: <Newspaper size={20} />,
    roles: ["Participante", "Administrador"],
  },
];

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { session, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = session.user.user_metadata?.roles || [];
  const hasPermission = userRoles.some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};



function AppContent() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [listaPaises, setListaPaises] = useState([]);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoadingAuth(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setLoadingAuth(false);
        if (_event === "SIGNED_IN") {
          toast({
            title: "¡Bienvenido de nuevo!",
            description: `Has iniciado sesión.`,
          });
        } else if (_event === "SIGNED_OUT") {
          toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión exitosamente.",
          });
        }
      }
    );
    
    const fetchListaPaises = async () => {
      const { data, error } = await supabase.rpc("fn_lista_paises");

      if (error) {
        console.error("Error al obtener los paises:", error);
      } else {
        setListaPaises(data);
        
        if (localStorage.getItem("paises") == null){
          localStorage.setItem("paises", JSON.stringify(data));
        }
      }
    };
    
    fetchListaPaises();
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };


  }, [toast]);

  const getNavItems = () => {
    const userRoles = session ? session.user.user_metadata?.roles : ["all"];

    let nav = initialNavItems
      .map((item) => {
        let filteredItem = { ...item };
        if (item.roles.some((role) => userRoles.includes(role))) {
          if (item.subMenu) {
            filteredItem.subMenu = item.subMenu
              .filter((subItem) =>
                subItem.roles.some((role) => userRoles.includes(role))
              )
              .map((subItem) => {
                if (subItem.nestedSubMenu) {
                  return {
                    ...subItem,
                    nestedSubMenu: subItem.nestedSubMenu.filter((nested) =>
                      nested.roles.some((role) => userRoles.includes(role))
                    ),
                  };
                }
                return subItem;
              })
              .filter(
                (subItem) =>
                  !subItem.nestedSubMenu || subItem.nestedSubMenu.length > 0
              );
          }
          return filteredItem;
        }
        return null;
      })
      .filter(Boolean);

    if (session && userRoles.includes("Administrador")) {
      nav.push({
        name: "Admin Panel",
        path: "/admin",
        icon: <Settings size={20} />,
        roles: ["Administrador"],
      });
    }

    if (session) {
      nav.push({
        name: "Logout",
        path: "/logout",
        icon: <LogOut size={20} />,
        action: async () => {
          await supabase.auth.signOut();
          navigate("/");
        },
        roles: ["Participante", "Administrador"],
      });
    } else {
      nav.push({
        name: "Login",
        path: "/login",
        icon: <LogIn size={20} />,
        roles: ["all"],
      });
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
              {/* PÁGINA PRINCIPAL */}
              <Route
                path="/"
                element={
                  <PageWrapper>
                    <HomePage />
                  </PageWrapper>
                }
              />

              {/* FORMULARIO DE REGISTRO */}
              <Route
                path="/login/registro"
                element={
                  <PageWrapper>
                    <RegistrarUsuarioPage />
                  </PageWrapper>
                }
              />

              {/* MERCADO */}
              <Route
                path="/mercado/jugadores"
                element={
                  <PageWrapper>
                    <MercadoPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/mercado/jugador/:id"
                element={
                  <PageWrapper>
                    <DetalleJugadorPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/mercado/negociacion-clubes"
                element={
                  <PageWrapper>
                    <RedireccionNegociacionClubes />
                  </PageWrapper>
                }
              />

              <Route
                path="/mercado/negociacion/negociacion-clubes"
                element={
                  <PageWrapper>
                    <NegociacionClubes />
                  </PageWrapper>
                }
              />

              <Route
                path="/mercado/valores-mercado"
                element={
                  <PageWrapper>
                    <ValoresMercadoPage />
                  </PageWrapper>
                }
              />

              {/* EQUIPOS */}
              <Route
                path="/equipos"
                element={
                  <PageWrapper>
                    <EquiposPage />
                  </PageWrapper>
                }
              />
              <Route
                path="equipo/mi-equipo"
                element={
                  <PageWrapper>
                    <RedireccionMiEquipo  />
                  </PageWrapper>
                }
              />

              <Route
                path="equipo/general/informacion/:id"
                element={
                  <PageWrapper>
                    <InformacionEquipoGeneralPage />
                  </PageWrapper>
                }
              />

              {/* NOTIFICACIONES */}
              <Route
                path="/equipo/notificaciones"
                element={<RedireccionNotificacionesEquipo />}
              />

              <Route
                path="equipo/mis-notificaciones/:equipoId"
                element={
                  <PageWrapper>
                    <NotificacionMercadoPage />
                  </PageWrapper>
                }
              />

              {/* ADMINISTRACIÓN */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["Administrador"]}>
                    <PageWrapper>
                      <AdminPage />
                    </PageWrapper>
                  </ProtectedRoute>
                }
              />

              {/* OTRAS PÁGINAS */}
              <Route
                path="/noticias"
                element={
                  <PageWrapper>
                    <div>
                      <h1 className="text-3xl font-bold">Noticias</h1>
                      <p>Próximamente...</p>
                    </div>
                  </PageWrapper>
                }
              />
              <Route
                path="/contacto"
                element={
                  <PageWrapper>
                    <ContactoPage />
                  </PageWrapper>
                }
              />

              {/* AUTENTICACIÓN */}
              <Route
                path="/login"
                element={
                  <PageWrapper>
                    <LoginPage />
                  </PageWrapper>
                }
              />
              <Route path="/logout" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <Toaster />
      </div>
    </AuthContext.Provider>
  );
}

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
