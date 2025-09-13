import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";

const NegociacionClubes = () => {
  const [equipoSolicitante, setEquipoSolicitante] = useState();
  const [tipoNegociacion, setTipoNegociacion] = useState("");
  const [equipoReceptor, setEquipoReceptor] = useState("");
  const [listaEquipos, setListaEquipos] = useState([]);
  const [listaJugaEquiReceptor, setListaJugaEquiReceptor] = useState([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

  const [cantidadPropios, setCantidadPropios] = useState(0);
  const [cantidadRivales, setCantidadRivales] = useState(0);
  const [jugadoresPropiosSeleccionados, setJugadoresPropiosSeleccionados] = useState([]);
  const [jugadoresRivalesSeleccionados, setJugadoresRivalesSeleccionados] = useState([]);
  const [jugadoresSolicitante, setJugadoresSolicitante] = useState([]);
  const [jugadoresReceptor, setJugadoresReceptor] = useState([]);
  const [jugadoresEquipoSolicitante, setJugadoresEquipoSolicitante] = useState([]); // lista de tu equipo

  const [compensaciones, setCompensaciones] = useState([]);
  const [compensacionSeleccionada, setCompensacionSeleccionada] = useState("");
  const [montoCompensacion, setMontoCompensacion] = useState(0);


  const [valorOferta, setValorOferta] = useState();
  const [valorMinimo, setValorMinimo] = useState(0);
  const [valorMaximo, setValorMaximo] = useState(0);

  const getUsuarioActual = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error al obtener usuario:", error);
        return null;
      }

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

    const equipo = data?.[0];
    if (!equipo) {
      console.warn("Este usuario no tiene un equipo asignado.");
      return null;
    }

    setEquipoSolicitante(equipo);
    return equipo;
  };

  const listaJugadoresEquipoSolicitante = async (equipo_id) => {
    const { data, error } = await supabase.rpc("fn_jugadores_equipo", {
      equipo_id,
    });
    if (error) console.error("Error al obtener jugadores del solicitante:", error);
    else setJugadoresEquipoSolicitante(data);
  };

  const obtenerCompensaciones = async () => {
    const { data, error } = await supabase.rpc("fn_lista_compensacion_transferencia");
    if (error) {
      console.error("Error al obtener compensaciones:", error);
      return;
    }
    setCompensaciones(data);
  };

  useEffect(() => {
    const fetchEquipos = async () => {
    const equipo = await getEquipoPorUsuario();
    if (!equipo) return;

    const { data, error } = await supabase.rpc("fn_obtener_equipos_completos");
    if (error) {
      console.error("Error al obtener equipos:", error);
    }
    else 
    {
      const equiposFiltrados = data.filter(e => e.equi_id !== equipo.equi_id);
      setListaEquipos(equiposFiltrados);
    }
  };

    fetchEquipos();
  }, []);

  useEffect(() => {
    if (tipoNegociacion && equipoReceptor) {
      listaJugadoresEquipoReceptor(equipoReceptor);
      obtenerCompensaciones();
    }
  }, [tipoNegociacion, equipoReceptor]);

  const listaJugadoresEquipoReceptor = async (equipo_id) => {
    const { data, error } = await supabase.rpc("fn_jugadores_equipo", {
      equipo_id,
    });
    if (error) console.error("Error al obtener jugadores:", error);
    else setListaJugaEquiReceptor(data);
  };

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

  const RealizarSolicitudCompra = async (
    equipoSolicitanteId,
    jugador,
    valorOferta
  ) => {

    if (!valorOferta) {
      alert("Debe ingresar un valor de compra.");
      return;
    }

    if (valorOferta < valorMinimo || valorOferta > valorMaximo) {
      alert(
        `El valor de la oferta está fuera del rango permitido.\nDebe estar entre $${valorMinimo.toLocaleString()} y $${valorMaximo.toLocaleString()}`
      );
      return;
    }

    const confirmacion = window.confirm(
      `¿Deseas realizar la solicitud de compra por ${
        jugador.juga_nombre
      } por $${valorOferta.toLocaleString()}M?`
    );

    if (!confirmacion) return;

    const { data, error } = await supabase.rpc(
      "fn_comprar_jugador_entre_clubes",
      {
        p_equi_solicitante: equipoSolicitanteId,
        p_jugador_id: jugador.juga_id,
        p_valor_ofertado: valorOferta,
      }
    );

    if (error) {
      console.error("Error al realizar la solicitud:", error);
      console.error("Parametros del error: ", equipoSolicitanteId, ' ; ', jugador.juga_id, ' ; ', valorOferta);
      alert("Ocurrió un error al procesar la solicitud. Intenta nuevamente.");
    } else {
      alert(data[0].mensaje);
      window.location.reload();
    }
  };


  useEffect(() => {
    if (equipoSolicitante?.equi_id && tipoNegociacion === "intercambiar") {
      listaJugadoresEquipoSolicitante(equipoSolicitante.equi_id);
    }
  }, [equipoSolicitante, tipoNegociacion]);

  const toggleSeleccionJugador = (jugador, origen) => {
    if (origen === "solicitante") {
      const yaSeleccionado = jugadoresSolicitante.find(j => j.juga_id === jugador.juga_id);
      if (yaSeleccionado) {
        setJugadoresSolicitante(jugadoresSolicitante.filter(j => j.juga_id !== jugador.juga_id));
      } else if (jugadoresSolicitante.length < 2) {
        setJugadoresSolicitante([...jugadoresSolicitante, jugador]);
      } else {
        alert("Solo puedes seleccionar hasta 2 jugadores de tu equipo.");
      }
    } else {
      const yaSeleccionado = jugadoresReceptor.find(j => j.juga_id === jugador.juga_id);
      if (yaSeleccionado) {
        setJugadoresReceptor(jugadoresReceptor.filter(j => j.juga_id !== jugador.juga_id));
      } else if (jugadoresReceptor.length < 2) {
        setJugadoresReceptor([...jugadoresReceptor, jugador]);
      } else {
        alert("Solo puedes seleccionar hasta 2 jugadores del equipo rival.");
      }
    }
  };

  const SolicitarIntercambioJugadores = async () => {
    if (!compensacionSeleccionada) {
      alert("Debe seleccionar un tipo de compensación.");
      return;
    }

    if (montoCompensacion < 0) {
      alert("El monto de compensación debe ser positivo.");
      return;
    }

    const confirmacion = window.confirm("¿Confirmar el intercambio de jugadores?");
    if (!confirmacion) return;

    const { data, error } = await supabase.rpc("fn_solicitar_intercambio_jugadores", {
      p_equi_solicitante: equipoSolicitante.equi_id,
      p_equi_receptor: parseInt(equipoReceptor),
      p_jugadores_solicitante: jugadoresSolicitante.map(j => j.juga_id),
      p_jugadores_receptor: jugadoresReceptor.map(j => j.juga_id),
      p_direccion_dinero: parseInt(compensacionSeleccionada),
      p_monto_compensacion: montoCompensacion
    });

    if (error) {
      console.error("Error al hacer el intercambio:", error);
      alert("Hubo un error al procesar el intercambio.");
    } else {
      alert(data[0].mensaje);
      window.location.reload();
    }
  };


  return (
    <div className="min-h-screen bg-black rounded-3xl flex flex-col items-center justify-start pt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Negociación entre Clubes
      </h1>

      <div className=" p-6 rounded-lg w-fit flex flex-row items-center justify-center gap-4">
        <h3>Tipo de negociación:</h3>
        <select
          className="p-2 rounded-md text-black w-52"
          value={tipoNegociacion}
          onChange={(e) => {
            setTipoNegociacion(e.target.value);
            setJugadorSeleccionado(null);
          }}
        >
          <option value="">-- Tipo de negociación --</option>
          <option value="comprar">Comprar jugador</option>
          <option value="intercambiar">Intercambiar jugadores</option>
        </select>

        <h3>Club receptor:</h3>
        <select
          className="p-2 rounded-md text-black w-52"
          value={equipoReceptor}
          onChange={(e) => {
            setEquipoReceptor(e.target.value);
            setJugadorSeleccionado(null);
          }}
        >
          <option value="">-- Seleccionar equipo receptor --</option>
          {listaEquipos.map((equipo) => (
            <option key={equipo.equi_id} value={equipo.equi_id}>
              {equipo.equi_nombre}
            </option>
          ))}
        </select>
      </div>

      {tipoNegociacion === "comprar" && equipoReceptor && (
        <div className="w-[90%] mt-8 p-4 rounded-lg text-center">

          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {(jugadorSeleccionado
              ? [jugadorSeleccionado]
              : listaJugaEquiReceptor
            ).map((jugador) => (
              <div
                key={jugador.juga_id}
                onClick={() => {
                  if (!jugadorSeleccionado) {
                    const valor = jugador.vame_valorventa;
                    setJugadorSeleccionado(jugador);
                    setValorOferta(valor);
                    setValorMinimo(Math.floor(valor * 0.75)); // -25%
                    setValorMaximo(Math.ceil(valor * 1.15)); // +15%
                  }
                }}
                className={`cursor-pointer w-[205px] h-[205px] bg-gradient-to-br ${getColorClase(
                  jugador.juga_valoraciongeneral
                )} rounded-3xl shadow-lg text-black relative p-4 flex flex-col items-center justify-between transition-transform hover:scale-105`}
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
                <div className="text-lg font-semibold">
                  {jugador.juga_nombre}
                </div>
                
                <div className="flex p-1">
                  {jugador.equi_escudourl ? (
                    <img
                      className="w-14 h-14 rounded-full"
                      src={jugador.equi_escudourl}
                      alt={jugador.equi_dt}
                    />
                  ) : (
                    <strong>{jugador.equi_nombre}</strong>
                  )}
                </div>
              </div>
            ))}
          </div>

          {jugadorSeleccionado && (
            <div className="mt-6">
              <button
                onClick={() => {
                  setJugadorSeleccionado(null);
                  setValorOferta(0);
                }}
                className="bg-white text-blue-600 px-4 py-2 rounded shadow font-semibold hover:bg-gray-100 transition"
              >
                Quitar selección
              </button>
            </div>
          )}

          {jugadorSeleccionado && (
            <div className="mt-6 flex items-center justify-center">
              <div>
                <label className="block mb-2 text-white text-lg">
                  Valor de la oferta ($):
                </label>
                <p className="text-sm text-white mt-2">
                  Valor permitido: entre ${valorMinimo.toLocaleString()} y $
                  {valorMaximo.toLocaleString()}
                </p>
              </div>
              <input
                type="number"
                min={valorMinimo}
                max={valorMaximo}
                step={100000}
                value={valorOferta}
                onChange={(e) => {
                  const nuevoValor = parseInt(e.target.value);
                  if (!isNaN(nuevoValor)) setValorOferta(nuevoValor);
                }}
                className="p-2 rounded w-25 text-black text-center ml-5"
              />

              <Button className="ml-10"
                onClick={() => RealizarSolicitudCompra(equipoSolicitante.equi_id, jugadorSeleccionado, valorOferta)}
              >
                <strong>Realizar oferta</strong>
              </Button>
            </div>
          )}
        </div>
      )}

      {tipoNegociacion === "intercambiar" && equipoReceptor && (
        <div className="w-full mt-1 p-1 rounded-lg text-center">

          <div className="flex gap-10 justify-center mt-6">
            <div className="flex p-2 rounded-md">
              <h3 className="block mb-1 mr-4">Jugadores de mi equipo:</h3>
              <select
                value={cantidadPropios}
                onChange={(e) => {
                  setCantidadPropios(parseInt(e.target.value));
                  setJugadoresSolicitante([]); 
                }}
                className="p-2 rounded-md text-black w-26 text-center"
              >
                <option value="">-- Seleccionar --</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>

            <div className="flex p-2 rounded-md text-center justify-center">
              <h3 className="block mb-1 mr-4">Jugadores del rival:</h3>
              <select
                value={cantidadRivales}
                onChange={(e) => {
                  setCantidadRivales(parseInt(e.target.value));
                  setJugadoresReceptor([]); 
                }}
                className="p-2 rounded-md text-black w-26 text-center"
              >
                <option value="">-- Seleccionar --</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between gap-6 mt-6">
           
            <div className="w-1/2">
              <h2 className="text-lg mb-2">Tus jugadores</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {jugadoresEquipoSolicitante
                  .filter((jugador) =>
                    jugadoresSolicitante.find(j => j.juga_id === jugador.juga_id) || jugadoresSolicitante.length < cantidadPropios
                  )
                  .map((jugador) => (
                    <div
                      key={jugador.juga_id}
                      onClick={() => toggleSeleccionJugador(jugador, "solicitante")}
                      className={`cursor-pointer w-[205px] h-[205px] rounded-xl border-4 ${
                        jugadoresSolicitante.find(j => j.juga_id === jugador.juga_id)
                          ? "border-red-700"
                          : "border-transparent"
                      } bg-gradient-to-br ${getColorClase(jugador.juga_valoraciongeneral)} text-black p-3 flex flex-col justify-between`}
                    >
                      <div className="flex justify-between w-full text-xl font-bold">
                        <span>{jugador.juga_valoraciongeneral}</span>
                        <span
                          className={`px-2 py-1 rounded text-sm font-bold ${getEstiloPosicion(
                            jugador.posi_nombre
                          )}`}
                        >{jugador.posi_nombre}</span>
                      </div>
                      <img src={jugador.juga_faceplayer} className="w-20 h-20 rounded-full mx-auto" />
                      <div className="text-lg font-semibold">{jugador.juga_nombre}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="w-1/2">
              <h2 className="text-lg mb-2">Jugadores del rival</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {listaJugaEquiReceptor
                  .filter((jugador) =>
                    jugadoresReceptor.find(j => j.juga_id === jugador.juga_id) || jugadoresReceptor.length < cantidadRivales
                  )
                  .map((jugador) => {
                    const estaSeleccionado = jugadoresReceptor.find(j => j.juga_id === jugador.juga_id);

                    return (
                      <div
                        key={jugador.juga_id}
                        onClick={() => toggleSeleccionJugador(jugador, "receptor")}
                        className={`cursor-pointer w-[205px] h-[205px] rounded-xl border-4 ${
                          estaSeleccionado ? "border-green-700" : "border-transparent"
                        } bg-gradient-to-br ${getColorClase(jugador.juga_valoraciongeneral)} text-black p-3 flex flex-col justify-between`}
                      >
                        <div className="flex justify-between w-full text-xl font-bold">
                          <span>{jugador.juga_valoraciongeneral}</span>
                          <span
                            className={`px-2 py-1 rounded text-sm font-bold ${getEstiloPosicion(
                              jugador.posi_nombre
                            )}`}
                          >{jugador.posi_nombre}</span>
                        </div>
                        <img src={jugador.juga_faceplayer} className="w-20 h-20 rounded-full mx-auto" />
                        <div className="text-lg font-semibold"> {jugador.juga_nombre}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {jugadoresSolicitante.length === cantidadPropios &&
            jugadoresReceptor.length === cantidadRivales && (
              <div className="mt-8 bg-black p-4 rounded-md text-left w-[80%] mx-auto">
                <h2 className="text-lg mb-3 font-semibold text-center">Compensación por transferencia</h2>

                <div className="flex items-center justify-between gap-6 bg-blue">
                  <div className="flex w-full ">
                    <h2 className="block text-white mb-1 mr-2">Tipo de compensación:</h2>
                    <select
                      value={compensacionSeleccionada}
                      onChange={(e) => setCompensacionSeleccionada(e.target.value)}
                      className="w-full p-2 text-black rounded"
                    >
                      <option value="">-- Seleccionar --</option>
                      {compensaciones.map((comp) => (
                        <option key={comp.trco_id} value={comp.trco_id}>
                          {comp.trco_nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex w-full ">
                    <h2 className="block text-white mb-1 mr-2">Monto ($):</h2>
                    <input
                      type="number"
                      min={0}
                      value={montoCompensacion}
                      onChange={(e) => setMontoCompensacion(Number(e.target.value))}
                      className="p-2 w-[100px] text-black rounded text-center"
                    />
                  </div>

                  <div className="w-full  mt-4 sm:mt-0">
                    <Button
                      onClick={SolicitarIntercambioJugadores}
                      className="hover:bg-green-700"
                    >
                      Confirmar intercambio
                    </Button>
                  </div>
                </div>
              </div>
            )}

        </div>
      )}



    </div>
  );
};

export default NegociacionClubes;
