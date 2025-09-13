import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../lib/supabaseClient";

const RedireccionMiEquipo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const redirigir = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast({
          title: "Sesión requerida",
          description: "Debes iniciar sesión para ver las notificaciones del equipo.",
          variant: "destructive",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1000);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No se pudo obtener el usuario.");
        navigate("/");
        return;
      }

      const { data, error } = await supabase.rpc("obtener_equipo_dt", {
        usuario: user.id,
      });

      if (error || !data || data.length === 0) {
        console.error("Error obteniendo el equipo.");
        navigate("/");
        return;
      }

      // Redirigir a la vista de información del equipo
      const equipoId = data[0].equi_id;
      navigate(`/equipo/mis-notificaciones/${equipoId}`);
    };

    redirigir();
  }, [navigate]);

  return <div className="p-8">Redireccionando a tu equipo...</div>;
};

export default RedireccionMiEquipo;
