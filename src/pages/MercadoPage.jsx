import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, XCircle, Eye } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { supabase } from "../lib/supabaseClient";
import ModalFiltroJugadores from "../modals/modalFiltroJugadores";

const MercadoPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jugadores, setJugadores] = useState([]);
  const [jugadoresFiltrados, setJugadoresFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroPosicion, setFiltroPosicion] = useState("ALL_POSITIONS");
  const [filtroPais, setFiltroPais] = useState("ALL_COUNTRIES");
  const [filtroMediaMin, setFiltroMediaMin] = useState("");
  const [filtroMediaMax, setFiltroMediaMax] = useState("");

  const [posiciones, setPosiciones] = useState([]);

  const [mercadoActivo, setMercadoActivo] = useState(true);
  const [filtrosActivos, setFiltrosActivos] = useState(false);
  const [filtrosAvanzadosGuardados, setFiltrosAvanzadosGuardados] = useState(
    !!localStorage.getItem("filtros_avanzados")
  );

  const [paginaActual, setPaginaActual] = useState(1);
  const jugadoresPorPagina = 10;

  const totalPaginas = Math.ceil(
    jugadoresFiltrados.length / jugadoresPorPagina
  );
  const [actualizarFiltros, setActualizarFiltros] = useState(false);

  const indiceInicio = (paginaActual - 1) * jugadoresPorPagina;
  const indiceFin = indiceInicio + jugadoresPorPagina;
  const jugadoresPaginaActual = jugadoresFiltrados.slice(
    indiceInicio,
    indiceFin
  );

  const [modalAbierto, setModalAbierto] = useState(false);

  const normalizarTexto = (texto) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  useEffect(() => {
    const handleStorageChange = () => {
      setFiltrosAvanzadosGuardados(!!localStorage.getItem("filtros_avanzados"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    filtrarJugadores();
  }, [actualizarFiltros]);

  useEffect(() => {
    if (localStorage.getItem("filtros_avanzados")) {
      setFiltrosActivos(true);
    }

    const fetchJugadores = async () => {
      const total = 6500;
      const tamañoLote = 1000;

      for (let i = 0; i < total; i += tamañoLote) {
        try {
          const { data, error } = await supabase
            .from("vista_v3_jugadores_completos")
            .select("*")
            .range(i, i + tamañoLote - 1);

          if (error) throw error;

          if (data && data.length > 0) {
            // Se eliminan los duplicados según juga_id
            setJugadores((prev) => {
              const mapa = new Map(prev.map((j) => [j.juga_id, j]));
              data.forEach((nuevo) => mapa.set(nuevo.juga_id, nuevo));
              const jugadoresActualizados = Array.from(mapa.values());
              jugadoresActualizados.sort(
                (a, b) => b.juga_valoraciongeneral - a.juga_valoraciongeneral
              );
              return jugadoresActualizados;
            });

            setJugadoresFiltrados((prev) => {
              const mapa = new Map(prev.map((j) => [j.juga_id, j]));
              data.forEach((nuevo) => mapa.set(nuevo.juga_id, nuevo));
              const jugadoresActualizados = Array.from(mapa.values());
              jugadoresActualizados.sort(
                (a, b) => b.juga_valoraciongeneral - a.juga_valoraciongeneral
              );
              return jugadoresActualizados;
            });
          }
        } catch (error) {
          console.error(
            `Error cargando jugadores desde ${i} a ${i + tamañoLote - 1}:`,
            error
          );
          break;
        }
      }
    };

    fetchJugadores();
  }, []);

  useEffect(() => {
    const fetchPosiciones = async () => {
      const { data, error } = await supabase.rpc("get_posiciones_nombres");

      if (error) {
        console.error("Error al obtener posiciones:", error);
      } else {
        setPosiciones(data);
      }
    };

    fetchPosiciones();
  }, []);

  const filtrarJugadores = () => {
    const filtrosAvanzados = JSON.parse(
      localStorage.getItem("filtros_avanzados")
    )?.filtrosCompletos;

    const filtrados = jugadores.filter((jugador) => {
      // === FILTROS PRINCIPALES ===
      const coincideNombre = normalizarTexto(jugador.juga_nombre).includes(
        normalizarTexto(searchTerm)
      );

      const media = jugador.juga_valoraciongeneral;
      const min =
        filtroMediaMin === "" ? -Infinity : parseFloat(filtroMediaMin);
      const max = filtroMediaMax === "" ? Infinity : parseFloat(filtroMediaMax);
      const dentroDelRango = media >= min && media <= max;

      const coincidePosicion =
        filtroPosicion === "ALL_POSITIONS" ||
        jugador.posi_nombre === filtroPosicion;

      // === FILTROS AVANZADOS ===
      const cumpleHabilidades = filtrosAvanzados?.habilidades
        ? Object.entries(filtrosAvanzados.habilidades).every(
            ([clave, valor]) => jugador[clave] >= Number(valor)
          )
        : true;

      const cumplePosiciones = filtrosAvanzados?.posiciones
        ? Object.entries(filtrosAvanzados.posiciones).every(
            ([clave, valor]) => valor === 0 || jugador[clave] === 1
          )
        : true;

      const cumpleEdad =
        typeof filtrosAvanzados?.edad === "number"
          ? jugador.juga_edad >= filtrosAvanzados.edad
          : true;

      const cumplePais =
        filtrosAvanzados?.pais && !isNaN(Number(filtrosAvanzados.pais))
          ? jugador.pais_id === Number(filtrosAvanzados.pais)
          : true;

      const cumplePierna = filtrosAvanzados?.pierna
        ? jugador.juga_piernahabil === filtrosAvanzados.pierna
        : true;

      // Unificación total
      return (
        coincideNombre &&
        dentroDelRango &&
        coincidePosicion &&
        cumpleHabilidades &&
        cumplePosiciones &&
        cumpleEdad &&
        cumplePais &&
        cumplePierna
      );
    });

    setJugadoresFiltrados(filtrados);
    setPaginaActual(1);
  };

  const getEstiloPosicion = (posicion) => {
    switch (posicion) {
      case "DC":
      case "SD":
      case "EXI":
      case "EXD":
        return "bg-black text-red-600";
      case "MCD":
      case "MC":
      case "MDI":
      case "MDD":
      case "MO":
        return "bg-black text-green-500";
      case "DEC":
      case "LI":
      case "LD":
        return "bg-black text-blue-500";
      case "PT":
        return "bg-black text-yellow-400";
      default:
        return "bg-gray-800 text-white"; // por si acaso hay otra posición no contemplada
    }
  };

  const verInformacionJugador = async (jugadorId, event) => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      toast({
        title: "Sesión requerida",
        description:
          "Debes iniciar sesión para ver la información del jugador.",
        variant: "destructive",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    const url = `/mercado/jugador/${jugadorId}`;

    // Si se presionó Ctrl o el clic fue central (botón 1)
    if (event.ctrlKey || event.button === 1) {
      window.open(url, "_blank");
    } else {
      navigate(url);
    }
  };

  const desactivarFiltrosAvanzados = () => {
    setFiltrosActivos(false);
    localStorage.removeItem("filtros_avanzados");
  };

  useEffect(() => {
    filtrarJugadores();
  }, [
    searchTerm,
    filtroMediaMin,
    filtroMediaMax,
    filtroPosicion,
    jugadores,
    filtrosActivos,
  ]);

  return (
    <PageWrapper>
      <div className="flex gap-4 mb-4 items-center justify-center overflow-x-auto px-2">
        <Input
          placeholder="Buscar jugador por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm min-w-16"
        />

        <Select onValueChange={(value) => setFiltroPosicion(value)}>
          <SelectTrigger className="w-[15%]">
            <SelectValue placeholder="Filtrar por posición" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_POSITIONS">Todas</SelectItem>
            {posiciones.map((pos) => (
              <SelectItem key={pos.posi_nombre} value={pos.posi_nombre}>
                {pos.posi_nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Ej. 80"
          value={filtroMediaMin}
          onChange={(e) => setFiltroMediaMin(e.target.value)}
          className="w-24"
        />

        <Input
          type="number"
          placeholder="Ej. 90"
          value={filtroMediaMax}
          onChange={(e) => setFiltroMediaMax(e.target.value)}
          className="w-24"
        />

        <Button onClick={() => setModalAbierto(true)}>
          <Filter className="w-5 h-5 mr-2" />
          {localStorage.getItem("filtros_avanzados")
            ? "Editar filtros"
            : "Más filtros"}
        </Button>
        {filtrosActivos && (
          <Button onClick={desactivarFiltrosAvanzados}>
            <XCircle className="w-4 h-4 mr-2" />
            Quitar filtros
          </Button>
        )}
        {modalAbierto && (
          <ModalFiltroJugadores
            onClose={() => setModalAbierto(false)}
            activarFiltrosAvanzados={() => setFiltrosActivos(true)}
            setActualizarFiltros={setActualizarFiltros}
          ></ModalFiltroJugadores>
        )}
      </div>

      <div className="table-container glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-center">Pos.</TableHead>
              <TableHead className="text-center">Edad</TableHead>
              <TableHead className="text-center">Media</TableHead>
              <TableHead className="text-center">País</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jugadoresPaginaActual.length > 0 ? (
              jugadoresPaginaActual.map((jugador, index) => (
                <motion.tr
                  key={jugador.juga_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="hover:bg-primary/10 transition-colors"
                >
                  <TableCell className="font-semibold">
                    {jugador.juga_nombre}
                  </TableCell>
                  <TableCell className={`text-center`}>
                    <span
                      className={`w-[60px] pl-2 pr-2 rounded-3xl ${getEstiloPosicion(
                        jugador.posi_nombre
                      )}`}
                    >
                      {jugador.posi_nombre}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {jugador.juga_edad}
                  </TableCell>
                  <TableCell className="text-center">
                    {jugador.juga_valoraciongeneral}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <img src={jugador.pais_urlbandera} className="w-5 h-4" />
                      {jugador.pais_nombre}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:bg-primary/20 h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        verInformacionJugador(jugador.juga_id, e);
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan="8"
                  className="text-center py-12 text-muted-foreground text-lg"
                >
                  <Search size={48} className="mx-auto mb-4 text-primary/50" />
                  No se encontraron jugadores con los filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-6 gap-2">
        <Button
          variant="outline"
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
        >
          Anterior
        </Button>

        <span className="px-2 py-1">
          Página {paginaActual} de {totalPaginas}
        </span>

        <Button
          variant="outline"
          onClick={() =>
            setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
          }
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </Button>
      </div>
    </PageWrapper>
  );
};

export default MercadoPage;
