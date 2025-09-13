import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Shield } from "lucide-react";

const InformacionEquipoGeneralPage = () => {
  const [equipo, setEquipo] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();


  const obtenerJugadores = async (id_equipo) => {
    const { data, error } = await supabase.rpc("fn_jugadores_equipo", {
      equipo_id: id_equipo,
    });
    if (error) {
      console.error("Error al obtener jugadores:", error);
    } else {
      setJugadores(data);
    }
  };

  useEffect(() => {
    const fetchEquipos = async () => {
      const { data, error } = await supabase.rpc("fn_informacion_equipo", {
        equipo_id: id,
      });
      if (error) {
        console.error("Error al obtener equipo:", error);
      } else {
        setEquipo(data[0]);
        obtenerJugadores(data[0].equi_id);
      }
    };

    fetchEquipos();
  }, []);

  if (!equipo) return <div className="p-8">Cargando equipo...</div>;

  const getColorClase = (valoracion) => {
    if (valoracion >= 90) return 'from-yellow-500 to-yellow-300';
    if (valoracion >= 85 && valoracion <= 89) return 'from-green-600 to-green-400';
    if (valoracion >= 80 && valoracion <= 84) return 'from-blue-500 to-blue-300';
    if (valoracion >= 76 && valoracion <= 79) return 'from-gray-500 to-gray-300';
    return 'from-red-500 to-red-300';
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
        return "bg-gray-800 text-white";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Cabecera */}
      <div className="bg-gray-200 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 mb-10">
        {/* Escudo */}
        <img
          src={equipo.equi_escudourl}
          alt={`Escudo de ${equipo.equi_nombre}`}
          className="w-32 h-32 object-contain"
        />

        {/* Info general */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">
            {equipo.equi_nombre}
          </h1>
          <p className="text-gray-600">Estadio: {equipo.equi_estadio}</p>
          <p className="text-gray-600">Director Técnico: {equipo.equi_dt}</p>
          <p className="text-gray-600">
            Presupuesto: ${equipo.equi_presupuesto.toLocaleString()}
          </p>
          <p className="text-gray-600">
            Cantidad de jugadores: {equipo.cantidad_jugadores}
          </p>
        </div>
      </div>

      {/* Plantilla de jugadores */}
      <h2 className="text-2xl font-semibold mb-4 text-center bg-black rounded-2xl">
        Plantilla de Jugadores
      </h2>
      <div className="flex">
        <div className="flex flex-col items-center space-y-2 text-center bg-black rounded-2xl p-2 mr-2">
          <div className="flex flex-col items-center">
            <img
              src={equipo.equi_kit11url}
              alt={`Kit local de ${equipo.equi_nombre}`}
              className="w-[200px] h-[220px] object-contain border"
            />
            <span className="text-smmt-1 text-white font-bold">Camiseta Local</span>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={equipo.equi_kit2url}
              alt={`Kit visitante de ${equipo.equi_nombre}`}
              className="w-[200px] h-[220px] object-contain border"
            />
            <span className="text-smmt-1 text-white font-bold">Camiseta Visitante</span>
          </div>
        </div>

        <div className="flex bg-black p-2 rounded-2xl w-full h-[520px] max-h-[600px] overflow-y-auto justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {jugadores.map((jugador) => (
              <div
                key={jugador.juga_id}
                className={`w-[200px] h-[200px] bg-gradient-to-br ${getColorClase(
                    jugador.juga_valoraciongeneral
                )} rounded-3xl shadow-lg text-black relative p-4 flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-transform duration-300`}
                onClick={() => window.location.href = `/mercado/jugador/${jugador.juga_id}`} // o usa navigate si prefieres
                >
                  
                <div className="flex justify-between w-full text-xl font-bold">
                    <span>{jugador.juga_valoraciongeneral}</span>
                    <span
                    className={`px-2 py-1 rounded text-sm font-bold ${getEstiloPosicion(
                        jugador.posi_nombre
                    )}`}
                    >
                    {jugador.posi_nombre}
                    </span>
                </div>

                <img
                    src={jugador.juga_faceplayer}
                    alt={jugador.juga_nombre}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white my-2"
                />

                <div className="text-lg font-semibold text-center leading-tight">
                    {jugador.juga_nombre}
                </div>
                </div>

            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformacionEquipoGeneralPage;
