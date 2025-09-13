import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

const RedireccionNegociacionClubes = () => {
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
          description: "Debes iniciar sesión para acceder a la negociación entre clubes.",
          variant: "destructive",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1000);

        return;
      }

      navigate("/mercado/negociacion/negociacion-clubes"); // o la ruta real
    };

    redirigir();
  }, [navigate]);

  return <div className="p-8">Redireccionando a la negociación entre clubes...</div>;
};

export default RedireccionNegociacionClubes;
