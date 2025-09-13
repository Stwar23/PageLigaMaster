import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cake, User, Footprints } from "lucide-react";
import RadarStats from "../components/ui/radarStats";

const DetalleJugadorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jugador, setJugador] = useState(null);
  const [logueado, setLogueado] = useState(false);
  const [equipoDtInformacion, setEquipoDtInformacion] = useState(null);

  const getUsuarioActual = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }

    // console.log('usuario:', user);
    return user;
  };

  const getEquipoPorUsuario = async () => {
    const user = await getUsuarioActual();
    if (!user) return;

    const { data, error } = await supabase.rpc("obtener_equipo_dt", {
      usuario: user.id,
    });

    if (error) {
      console.error("Error al obtener equipo:", error);
      return null;
    }

    // console.log("Equipo del usuario:", data);
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      const equipoInformacion = await getEquipoPorUsuario();
      if (equipoInformacion) {
        setLogueado(true);
        setEquipoDtInformacion(equipoInformacion[0]);
        // console.log("EQUIPO INFORMACION DEL DT ==>>>> ", equipoDtInformacion);
      }

      const { data, error } = await supabase.rpc("fn_informacion_jugador", {
        id_jugador: parseInt(id),
      });

      // console.log("JUGADOR ==> ", data);

      if (error) {
        console.error("Error al obtener información del jugador:", error);
      } else {
        setJugador(data[0]);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (!jugador) {
    return <div className="text-white">Cargando jugador...</div>;
  }

  const habilidades = [
    {
      nombre: "Valoración general",
      valor: jugador.juga_valoraciongeneral,
      categoria: "A",
    },
    {
      nombre: "Contacto físico",
      valor: jugador.juga_contactofisico,
      categoria: "A",
    },
    {
      nombre: "Actitud ofensiva",
      valor: jugador.juga_actitudofensiva,
      categoria: "A",
    },
    { nombre: "Equilibrio", valor: jugador.juga_equilibrio, categoria: "A" },
    {
      nombre: "Control de balón",
      valor: jugador.juga_controlbalon,
      categoria: "A",
    },
    { nombre: "Resistencia", valor: jugador.juga_resistencia, categoria: "A" },
    { nombre: "Drible", valor: jugador.juga_dribbling, categoria: "A" },
    {
      nombre: "Actitud defensiva",
      valor: jugador.juga_actituddefensiva,
      categoria: "A",
    },
    {
      nombre: "Posesión de balón",
      valor: jugador.juga_posecionbalon,
      categoria: "A",
    },
    {
      nombre: "Recuperación de balón",
      valor: jugador.juga_recupbalon,
      categoria: "A",
    },
    { nombre: "Pase al ras", valor: jugador.juga_pasealras, categoria: "A" },
    { nombre: "Agresividad", valor: jugador.juga_agresividad, categoria: "A" },
    {
      nombre: "Pase bombeado",
      valor: jugador.juga_pasebombeado,
      categoria: "A",
    },
    {
      nombre: "Actitud de portero",
      valor: jugador.juga_actitudportero,
      categoria: "A",
    },
    {
      nombre: "Finalización",
      valor: jugador.juga_finalizacion,
      categoria: "A",
    },
    { nombre: "Atajar (PT)", valor: jugador.juga_atajar, categoria: "A" },
    { nombre: "Cabeceador", valor: jugador.juga_cabeceador, categoria: "A" },
    { nombre: "Despejar (PT)", valor: jugador.juga_despejar, categoria: "A" },
    { nombre: "Balón parado", valor: jugador.juga_balonparado, categoria: "A" },
    { nombre: "Reflejos (PT)", valor: jugador.juga_reflejos, categoria: "A" },
    { nombre: "Efecto", valor: jugador.juga_efecto, categoria: "A" },
    { nombre: "Cobertura (PT)", valor: jugador.juga_cobertura, categoria: "A" },
    { nombre: "Velocidad", valor: jugador.juga_velocidad, categoria: "A" },
    { nombre: "Uso pie malo", valor: jugador.juga_usopiemalo, categoria: "B" },
    { nombre: "Aceleracion", valor: jugador.juga_aceleracion, categoria: "A" },
    {
      nombre: "Presición pie malo",
      valor: jugador.juga_precisionpiemalo,
      categoria: "B",
    },
    {
      nombre: "Potencia de tiro",
      valor: jugador.juga_potenciatiro,
      categoria: "A",
    },
    { nombre: "Estabilidad", valor: jugador.juga_estabilidad, categoria: "D" },
    { nombre: "Salto", valor: jugador.juga_salto, categoria: "A" },
    {
      nombre: "Resistencia a lesiones",
      valor: jugador.juga_resistlesion,
      categoria: "C",
    },
  ];

  const habilidadesTecnicas = [
    { nombre: "Tijera", valor: jugador.ju_tijera },
    { nombre: "Doble toque", valor: jugador.ju_dobletoque },
    { nombre: "Gambeta", valor: jugador.ju_gambeta },
    { nombre: "Marsellesa", valor: jugador.ju_marsellesa },
    { nombre: "Sombrerito", valor: jugador.ju_sombrerito },
    { nombre: "Cortada", valor: jugador.ju_cortada },
    { nombre: "Amago por detrás y giro", valor: jugador.ju_amadetgiro },
    { nombre: "Rebote interior", valor: jugador.ju_reboteinterior },
    { nombre: "Pisar el balón", valor: jugador.ju_pisarbalon },
    { nombre: "Cabeceador", valor: jugador.ju_cabeceador },
    { nombre: "Cañonero", valor: jugador.ju_canonero },
    { nombre: "Sombrero", valor: jugador.ju_sombrero },
    { nombre: "Tiro de larga distancia", valor: jugador.ju_tirolargadist },
    { nombre: "Tiro con empeine", valor: jugador.ju_tiroempeine },
    { nombre: "Disparo descendente", valor: jugador.ju_dispdescendente },
    { nombre: "Disparo ascendente", valor: jugador.ju_dispascendente },
    { nombre: "Finalización acrobática", valor: jugador.ju_finaacrobat },
    { nombre: "Taconazo", valor: jugador.ju_taconazo },
    { nombre: "Remate al primer toque", valor: jugador.ju_remapritoque },
    { nombre: "Pase al primer toque", valor: jugador.ju_pasepritoque },
    { nombre: "Pase en profundidad", valor: jugador.ju_paseenprof },
    { nombre: "Pase a profundidad", valor: jugador.ju_paseaprof },
    { nombre: "Pase cruzado", valor: jugador.ju_pasecruzado },
    { nombre: "Centro con rosca", valor: jugador.ju_centrosca },
    { nombre: "Rabona", valor: jugador.ju_rabona },
    { nombre: "Pase sin mirar", valor: jugador.ju_pasesinmirar },
    { nombre: "Pase bombeado bajo", valor: jugador.ju_pasebombbajo },
    { nombre: "Patadón en corto", valor: jugador.ju_patadoncorto },
    { nombre: "Patadón en largo", valor: jugador.ju_patadonlargo },
    { nombre: "Saque largo de banda", valor: jugador.ju_saquelargobanda },
    { nombre: "Saque de meta largo", valor: jugador.ju_saquemetalargo },
    { nombre: "Especialista en penales", valor: jugador.ju_especpenales },
    { nombre: "Parapenales", valor: jugador.ju_parapenales },
    { nombre: "Malicia", valor: jugador.ju_malicia },
    { nombre: "Marcar hombre", valor: jugador.ju_marcarhombre },
    { nombre: "Delantero atrasado", valor: jugador.ju_delatrasado },
    { nombre: "Interceptador", valor: jugador.ju_interceptador },
    { nombre: "Despeje acrobático", valor: jugador.ju_despacroba },
    { nombre: "Capitanía", valor: jugador.ju_capitania },
    { nombre: "Súper refuerzo", valor: jugador.ju_suprefuerzo },
    { nombre: "Espíritu de lucha", valor: jugador.ju_espiritulucha },
  ];

  const obtenerColorFondoHabilidad = (categoria, valor) => {
    switch (categoria) {
      case "A":
        if (valor >= 95) return "#0cb89b";
        if (valor >= 85) return "#8abc17";
        if (valor >= 75) return "#c28415";
        return "#c23037";

      case "B":
        if (valor >= 4) return "#0cb89b";
        if (valor === 3) return "#8abc17";
        if (valor === 2) return "#c28415";
        if (valor === 1) return "#c23037";
        break;

      case "C":
        if (valor === 3) return "#0cb89b";
        if (valor === 2) return "#c28415";
        if (valor === 1) return "#c23037";
        break;

      case "D":
        if (valor === 8) return "#0cb89b";
        if (valor >= 5 && valor <= 7) return "#8abc17";
        if (valor >= 2 && valor <= 4) return "#c28415";
        if (valor === 1) return "#c23037";
        break;

      default:
        return "#999";
    }
  };

  const calcularProgresoHabilidad = (categoria, valor) => {
    let porcentaje = 0;

    switch (categoria) {
      case "A":
        porcentaje = ((valor - 0) / (100 - 0)) * 100;
        break;
      case "B":
        porcentaje = ((valor - 0) / (4 - 0)) * 100;
        break;
      case "C":
        porcentaje = ((valor - 0) / (3 - 0)) * 100;
        break;
      case "D":
        porcentaje = ((valor - 0) / (8 - 0)) * 100;
        break;
      default:
        porcentaje = 0;
    }

    return Math.max(0, Math.min(porcentaje, 100)); // asegura que esté entre 0 y 100
  };

  const getColorClase = (valoracion) => {
    if (valoracion >= 90) return "from-yellow-500 to-yellow-300";
    if (valoracion >= 85 && valoracion <= 89)
      return "from-green-600 to-green-400";
    if (valoracion >= 80 && valoracion <= 84)
      return "from-blue-500 to-blue-300";
    if (valoracion >= 76 && valoracion <= 79)
      return "from-gray-500 to-gray-300";
    return "from-red-500 to-red-300";
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

  const getColorFondoPosicion = (valor, posicion) => {
    const posicionesVerdes = ["MDD", "MDI", "MCD", "MC", "MO"];
    const posicionesRojas = ["EXI", "EXD", "SD", "DC"];
    const posicionesAzules = ["LI", "DEC", "LD"];

    if (posicion === "PT" && valor === 2) {
      return "bg-yellow-600 text-black";
    }

    if (valor === 2) {
      if (posicionesVerdes.includes(posicion)) {
        return "bg-green-700/70 text-green-700";
      }
      if (posicionesRojas.includes(posicion)) {
        return "bg-red-700/70 text-red-700";
      }
      if (posicionesAzules.includes(posicion)) {
        return "bg-blue-700/70 text-blue-700";
      }
      return "bg-red-800/70 text-black"; // por si hay alguna posición adicional
    }

    if (valor === 1) {
      if (posicionesVerdes.includes(posicion)) {
        return "bg-green-700/20 text-green-700";
      }
      if (posicionesRojas.includes(posicion)) {
        return "bg-red-700/20 text-red-700";
      }
      if (posicionesAzules.includes(posicion)) {
        return "bg-blue-700/20 text-blue-700";
      }
      return "bg-gray-600/20 text-red-700";
    }

    return "text-black";
  };

  const FnComprarJugadorLibre = async () => {
    const confirmar = window.confirm(
      `¿Estás seguro de comprar a ${jugador.juga_nombre} por el total de ${jugador.vame_valorventa}M?`
    );

    if (!confirmar) return;

    try {
      const { data, error } = await supabase.rpc("fn_comprar_jugador_libre", {
        p_equipo_id: equipoDtInformacion.equi_id,
        p_jugador_id: jugador.juga_id,
      });

      if (error) {
        console.error("Error al ejecutar la función:", error);
        alert("Ocurrió un error al intentar comprar al jugador.");
      } else {
        alert(data[0].mensaje);
        window.location.reload();
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  const FnLiberarJugador = async () => {
    const confirmacion = window.confirm(
      `Vas a liberar a ${jugador.juga_nombre} y recibiras ${jugador.vame_valorlibre}M, ¿Estás seguro?`
    );
    if (!confirmacion) return;

    try {
      const { data, error } = await supabase.rpc("fn_liberar_jugador", {
        p_equipo_id: equipoDtInformacion.equi_id,
        p_jugador_id: jugador.juga_id,
      });

      if (error) {
        console.error("Error al liberar jugador:", error);
        alert("Error al liberar al jugador");
        return;
      }

      if (data && data.length > 0) {
        const { codigo, mensaje } = data[0];
        alert(mensaje);

        if (codigo === 0) {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado");
    }
  };

  return (
    <div className="flex gap-1">
      <div className="pr-4 min-h-screen text-white flex flex-col items-center gap-8">
        <div
          className={`w-[220px] h-[340px] bg-gradient-to-br ${getColorClase(
            jugador.juga_valoraciongeneral
          )} rounded-3xl shadow-lg text-black relative p-4 flex flex-col items-center justify-between`}
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
          <div className="text-lg font-semibold">{jugador.juga_nombre}</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm text-left">
            <div>
              <strong>RIT</strong> {jugador.juga_velocidad}
            </div>
            <div>
              <strong>TIR</strong> {jugador.juga_potenciatiro}
            </div>
            <div>
              <strong>PAS</strong> {jugador.juga_pasealras}
            </div>
            <div>
              <strong>REG</strong> {jugador.juga_dribbling}
            </div>
            <div>
              <strong>DEF</strong> {jugador.juga_actituddefensiva}
            </div>
            <div>
              <strong>FIS</strong> {jugador.juga_contactofisico}
            </div>
          </div>
          <div className="flex p-1">
            <img
              className="w-9 h-9 rounded-full"
              src={jugador.pais_bandera}
              alt={`Bandera de ${jugador.pais_nombre}`}
            />

            {jugador.equi_escudourl ? (
              <img
                className="w-10 h-10 rounded-full"
                src={jugador.equi_escudourl}
                alt={jugador.equi_dt}
              />
            ) : jugador.equi_id === null ? (
              <img
                className="w-10 h-10 rounded-full"
                src="https://igxdgvxcfiucrlqizrhj.supabase.co/storage/v1/object/sign/escudoszonanorte/sinclub.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80NGE0Y2ZhMC02NWVmLTRlMDgtYmVkZS03Yjc5ZGI2NDYxMjIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJlc2N1ZG9zem9uYW5vcnRlL3NpbmNsdWIucG5nIiwiaWF0IjoxNzUxMjQxMDQ0LCJleHAiOjE4NDU4NDkwNDR9.tUiubUHIFPLF0puOKrrlnLrzmSVii2UJXq5k3mzNm2s"
                alt={jugador.equi_nombre}
              />
            ) : (
              <strong>{jugador.equi_nombre}</strong>
            )}
          </div>
        </div>

        <div className="bg-black w-full rounded-3xl">
          <div className="bg-white-500 w-full text-center p-2">
            {jugador.equi_id === equipoDtInformacion.equi_id ? (
              <Button onClick={FnLiberarJugador}>
                <strong>Liberar</strong>
              </Button>
            ) : jugador.equi_id === null ? (
              <Button onClick={() => FnComprarJugadorLibre()}>
                <strong>Comprar</strong>
              </Button>
            ) : jugador.equi_id !== equipoDtInformacion.equi_id ? (
              <Button onClick={() => navigate(`/mercado/negociacion-clubes`)}>
                <strong>Negociar con dt</strong>
              </Button>
            ) : (
              <strong>Null</strong>
            )}
          </div>

          <div className="grid grid-rows-3 grid-cols-2 gap-2 p-4">
            <div>
              <strong>Valor compra</strong>
            </div>
            <div>{jugador.vame_valorventa} M</div>

            <div>
              <strong>Valor liberar</strong>
            </div>
            <div>{jugador.vame_valorlibre} M</div>

            <div>
              <strong>Salario</strong>
            </div>
            <div>{jugador.vame_salario} M</div>
          </div>
        </div>

      </div>

      <div className="flex gap-6 w-full rounded-3xl bg-black pr-4 pl-4 pt-3">
        <div className="flex flex-col w-full">
          <div className=" flex gap-2 justify-center ">
            <div className="flex flex-col rounded-2xl border-2 border-[#ffc105] items-center justify-center bg-black text-xl font-bold pr-2 pl-2">
              <div>
                {/* <Cake className="text-[#f5e7bc]" /> */}
                <label className="text-[#f5e7bc] text-base">Edad</label>
              </div>
              <div>
                <label className="text-[#ffc105] text-base">
                  {jugador.juga_edad}
                </label>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl border-2 border-[#ffc105] items-center justify-center bg-black text-xl font-bold pr-2 pl-2">
              <div>
                <Footprints className="rotate-180 text-[#f5e7bc]" />
              </div>
              <div>
                <label className="text-[#ffc105] text-base">
                  {jugador.juga_piernahabil}
                </label>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl border-2 border-[#ffc105] items-center justify-center bg-black text-xl font-bold pr-2 pl-2">
              <div>
                <label className="text-[#f5e7bc] text-base">
                  Estilo de juego
                </label>
              </div>
              <div>
                <label className="text-base text-[#ffc105]">
                  {jugador.esju_nombre}
                </label>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl border-2 border-[#ffc105] items-center justify-center bg-black text-xl font-bold pr-2 pl-2">
              <div>
                <label className="text-[#f5e7bc] text-base">Talla</label>
              </div>
              <div>
                <label className="text-base text-[#ffc105]">
                  {jugador.juga_talla} cm
                </label>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl border-2 border-[#ffc105] items-center justify-center bg-black text-xl font-bold pr-2 pl-2">
              <div>
                <label className="text-[#f5e7bc] text-base">Peso</label>
              </div>
              <div>
                <label className="text-base text-[#ffc105]">
                  {jugador.juga_peso} kg
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <div className="grid grid-cols-2 gap-4 rounded-3xl shadow p-4 w-full">
              {habilidades.map((hab, index) => {
                const fondo = obtenerColorFondoHabilidad(
                  hab.categoria,
                  hab.valor
                );
                const progreso = calcularProgresoHabilidad(
                  hab.categoria,
                  hab.valor
                );

                return (
                  <div key={index} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm leading-tight">
                      <span>{hab.nombre}</span>
                      <span className="font-bold">{hab.valor}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${progreso}%`,
                          backgroundColor: fondo,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 rounded-2xl shadow text-black ">
          <div>
            <RadarStats jugador={jugador} />
          </div>

          <div className="flex p-1 rounded-3xl">
            <div
              className="grid grid-rows-7 grid-cols-5 gap-2 p-4 mb-2
                            w-[230px] h-[350px]
                            bg-[url('https://igxdgvxcfiucrlqizrhj.supabase.co/storage/v1/object/sign/imagenespagina/terreno.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80NGE0Y2ZhMC02NWVmLTRlMDgtYmVkZS03Yjc5ZGI2NDYxMjIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5lc3BhZ2luYS90ZXJyZW5vLnBuZyIsImlhdCI6MTc1MDQ3MzU0MiwiZXhwIjoxNzgyMDA5NTQyfQ._F9CNmPc1XrauQceCFG0WpXbVdpIO6izRdoS_6sSYU0')] 
                            bg-contain bg-no-repeat bg-center
                            border "
            >
              {/* Fila 1 */}
              <div
                className={`text-red-700 ${getColorFondoPosicion(
                  jugador.LWF,
                  "EXI"
                )} text-center font-bold`}
              >
                EXI
              </div>
              <div></div>
              <div
                className={`text-red-700 ${getColorFondoPosicion(
                  jugador.CF,
                  "CD"
                )} text-center font-bold`}
              >
                CD
              </div>
              <div></div>
              <div
                className={`text-red-700 ${getColorFondoPosicion(
                  jugador.RWF,
                  "EXD"
                )} text-center font-bold`}
              >
                EXD
              </div>

              {/* Fila 2 */}
              <div></div>
              <div></div>
              <div
                className={`text-red-700 ${getColorFondoPosicion(
                  jugador.SS,
                  "SD"
                )} text-center font-bold`}
              >
                SD
              </div>
              <div></div>
              <div></div>

              {/* Fila 3 */}
              <div></div>
              <div></div>
              <div
                className={`text-green-600 ${getColorFondoPosicion(
                  jugador.AMF,
                  "MO"
                )} text-center font-bold`}
              >
                MO
              </div>
              <div></div>
              <div></div>

              {/* Fila 4 */}
              <div
                className={`text-green-600 ${getColorFondoPosicion(
                  jugador.LMF,
                  "MDI"
                )} text-center font-bold`}
              >
                MDI
              </div>
              <div></div>
              <div
                className={`text-green-600 ${getColorFondoPosicion(
                  jugador.CMF,
                  "MC"
                )} text-center font-bold`}
              >
                MC
              </div>
              <div></div>
              <div
                className={`text-green-600 ${getColorFondoPosicion(
                  jugador.RMF,
                  "MDD"
                )} text-center font-bold`}
              >
                MDD
              </div>

              {/* Fila 5 */}
              <div></div>
              <div></div>
              <div
                className={`text-green-600 ${getColorFondoPosicion(
                  jugador.DMF,
                  "MCD"
                )} text-center font-bold`}
              >
                MCD
              </div>
              <div></div>
              <div></div>

              {/* Fila 6 */}
              <div
                className={`text-blue-800 ${getColorFondoPosicion(
                  jugador.LB,
                  "LI"
                )} text-center font-bold`}
              >
                LI
              </div>
              <div></div>
              <div
                className={`text-blue-800 ${getColorFondoPosicion(
                  jugador.CB,
                  "DEC"
                )} text-center font-bold`}
              >
                DEC
              </div>
              <div></div>
              <div
                className={`text-blue-600 ${getColorFondoPosicion(
                  jugador.RB,
                  "LD"
                )} text-center font-bold`}
              >
                LD
              </div>

              {/* Fila 7 (PT centrado en columna 3) */}
              <div></div>
              <div></div>
              <div
                className={`h-full text-orange-500 ${getColorFondoPosicion(
                  jugador.GK,
                  "PT"
                )} text-center font-bold justify-end items-end`}
              >
                PT
              </div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div className="flex flex-col border-2 border-[#ffc105] p-4 rounded-2xl gap-1">
            <label className="bg-yellow-600 text-[#f5e7bc] text-base font-bold px-2 py-1 rounded-full text-center">
              Habilidades del jugador
            </label>
            {habilidadesTecnicas
              .filter((hab) => hab.valor === 1)
              .map((hab, index) => (
                <label
                  key={index}
                  className="text-[#f5e7bc] text-sm px-2 py-1 rounded-full"
                >
                  {hab.nombre}
                </label>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleJugadorPage;
