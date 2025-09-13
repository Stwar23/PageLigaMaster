import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";

const NotificacionMercadoPage = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [jugadoresTransferencia, setJugadoresTransferencia] = useState([]);
  const [notificacionSeleccionada, setNotificacionSeleccionada] =
    useState(null);
  const [detalleTransferencia, setDetalleTransferencia] = useState(null);

  const { equipoId } = useParams();

  const cargarNotificaciones = async () => {
    const { data, error } = await supabase.rpc("fn_solicitudes_por_equipo", {
      equipo_id: equipoId,
    });

    if (error) {
      console.error("Error al cargar notificaciones:", error);
    } else {
      setNotificaciones(data);
    }
  };

  const cargarDetalleTransferencia = async (tran_id) => {
    const { data, error } = await supabase.rpc("fn_informacion_transferencia", {
      transferencia_id: tran_id,
    });

    if (error) {
      console.error("Error al obtener detalle de transferencia:", error);
    } else {
      setDetalleTransferencia(data);
      await cargarJugadoresTransferencia(tran_id);
    }
  };

  const cargarJugadoresTransferencia = async (tran_id) => {
    const { data, error } = await supabase.rpc(
      "fn_jugadores_de_transferencia",
      {
        id_transferencia: tran_id,
      }
    );

    if (error) {
      console.error("Error al obtener detalle de transferencia:", error);
    } else {
      setJugadoresTransferencia(data);
    }
  };

  useEffect(() => {
    if (equipoId) {
      cargarNotificaciones();
    }
  }, [equipoId]);

  useEffect(() => {
    if (notificacionSeleccionada) {
      cargarDetalleTransferencia(notificacionSeleccionada.tran_id);
    }
  }, [notificacionSeleccionada]);

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

  const manejarRespuestaTransferencia = async (nuevoEstado) => {
    if (
      !notificacionSeleccionada ||
      !detalleTransferencia ||
      detalleTransferencia.length === 0
    )
      return;

    const tran_id = detalleTransferencia[0].tran_id;

    console.log(
      "Id transferencia = ",
      tran_id,
      ". Valor estado = ",
      nuevoEstado
    );

    // Solo procesamos solicitudes de compra
    if (notificacionSeleccionada.nome_titulo !== "Solicitud de compra") {
      alert("Este tipo de transferencia aún no está implementado.");
      return;
    }

    const confirmacion = window.confirm(
      `¿Estás seguro de ${
        nuevoEstado === 1 ? "aceptar" : "rechazar"
      } esta solicitud?`
    );

    if (!confirmacion) return;

    const { data, error } = await supabase.rpc(
      "fn_evaluar_oferta_transferencia",
      {
        p_tran_id: tran_id,
        p_tran_estado: nuevoEstado,
      }
    );

    if (error) {
      console.error("Error al evaluar la transferencia:", error);
      alert("Ocurrió un error al procesar la solicitud.");
    } else {
      alert(data[0].mensaje);
      window.location.reload();
    }
  };

  const manejarRespuestaIntercambioJugadores = async (nuevoEstado) => {
    if (
      !notificacionSeleccionada ||
      !detalleTransferencia ||
      detalleTransferencia.length === 0
    )
      return;

    const tran_id = detalleTransferencia[0].tran_id;

    console.log(
      "Id transferencia = ",
      tran_id,
      ". Valor estado = ",
      nuevoEstado
    );

    if (notificacionSeleccionada.nome_titulo !== "Solicitud de intercambio") {
      alert("Este tipo de transferencia aún no está implementado.");
      return;
    }

    const confirmacion = window.confirm(
      `¿Estás seguro de ${
        nuevoEstado === 1 ? "aceptar" : "rechazar"
      } esta solicitud?`
    );

    if (!confirmacion) return;

    const { data, error } = await supabase.rpc(
      "fn_responder_intercambio_jugadores",
      {
        p_tran_id: tran_id,
        p_estado: nuevoEstado,
      }
    );

    if (error) {
      console.error("Error al evaluar la transferencia:", error);
      alert("Ocurrió un error al procesar la solicitud.");
    } else {
      alert(data[0].mensaje);
      window.location.reload();
    }
  };

  const gestionarRespuestaSolicitud = async (estado, titulo) => {
    if (titulo === "Solicitud de compra") {
      manejarRespuestaTransferencia(estado);
    } else if (titulo === "Solicitud de intercambio") {
      manejarRespuestaIntercambioJugadores(estado);
    } else {
      alert(`No se encuentra el tipo de solicitud para ${titulo}.`);
    }
  };

  return (
    <div className="p-10 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-8">
        Solicitudes de Transferencia Recibidas
      </h1>

      <div className="flex gap-6">
        <div className="w-[40%] rounded-xl shadow-lg p-4 overflow-y-auto h-[500px] border border-blue-500 bg-black">
          {notificaciones.map((notif) => {
            let bgColor = "";
            switch (notif.tran_estado) {
              case 0:
                bgColor = "border-orange-500";
                break;
              case 1:
                bgColor = "border-green-600";
                break;
              case 2:
                bgColor = "border-red-600";
                break;
              default:
                bgColor = "border-gray-600";
            }

            return (
              <div
                key={notif.nome_id}
                className={`cursor-pointer border-2 p-3 rounded-lg mb-3 ${bgColor}
                  ${
                    notificacionSeleccionada?.nome_id === notif.nome_id
                      ? "bg-gray-900"
                      : "hover:bg-gray-800"
                  }
                `}
                onClick={() => setNotificacionSeleccionada(notif)}
              >
                <div className="flex justify-between">
                  <div className="flex">
                    <h3 className="mr-1">Título:</h3>
                    <p>{notif.nome_titulo}</p>
                  </div>
                  {/* <div className="h-[10px] w-[10px] rounded-2xl bg-white"></div> */}
                  { notif.nome_leido === false 
                    ? <div className="h-[10px] w-[10px] rounded-2xl bg-white"></div>
                    : ""
                  }
                </div>
                <div className="flex">
                  <h3 className="mr-1">Mensaje:</h3>
                  <p> {notif.nome_mensaje}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-[60%] bg-black rounded-xl shadow-lg pl-4 pb-4 pr-1 pt-4 border border-green-500 h-[500px]">
          {detalleTransferencia ? (
            <div className="space-y-4 overflow-y-auto h-full pr-2">
              <h2 className="text-xl font-bold text-center">
                Detalle de la Transferencia
              </h2>
              <div className="flex">
                <h3 className="mr-1 font-bold">Tipo:</h3>{" "}
                <p>{notificacionSeleccionada.nome_titulo}</p>
              </div>
              <div className="flex">
                <h3 className="mr-1 font-bold">Equipo solicitante:</h3>
                <p> {detalleTransferencia[0].equi_nombresolicitante}</p>
              </div>
              <div className="flex">
                <h3 className="mr-1 font-bold">Fecha:</h3>
                <p>
                  {new Date(
                    notificacionSeleccionada.nome_fecha
                  ).toLocaleDateString()}
                </p>
              </div>
              <div className="flex">
                <h3 className="mr-1 font-bold">Valor ofrecido:</h3>
                <p>
                  {detalleTransferencia &&
                    (() => {
                      const detalle = detalleTransferencia[0];
                      if (detalle.trco_id === 2) {
                        return `${detalle.equi_nombresolicitante} paga a ${detalle.equi_nombrereceptor} $${detalle.tran_valortransferencia} M`;
                      } else if (detalle.trco_id === 3) {
                        return `${detalle.equi_nombrereceptor} paga a ${detalle.equi_nombresolicitante} $${detalle.tran_valortransferencia} M`;
                      } else {
                        return `$${detalle.tran_valortransferencia} M`;
                      }
                    })()}
                </p>
              </div>

              {/* Aquí puedes agregar botones para aceptar/rechazar */}
              <div className="">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Id jugador</TableHead>
                      <TableHead className="text-center">
                        Nombre jugador
                      </TableHead>
                      <TableHead className="text-center">
                        Valoración General
                      </TableHead>
                      <TableHead className="text-center">
                        Equipo actual
                      </TableHead>
                      <TableHead className="text-center">Posición</TableHead>
                      <TableHead className="text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jugadoresTransferencia.length > 0 ? (
                      jugadoresTransferencia.map((jugador, index) => (
                        <motion.tr
                          key={jugador.juga_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="hover:bg-primary/20 transition-colors"
                        >
                          <TableCell className="font-semibold text-center">
                            {jugador.juga_id}
                          </TableCell>
                          <TableCell className="text-center">
                            {jugador.juga_nombre}
                          </TableCell>
                          <TableCell className="text-center">
                            {jugador.juga_valoraciongeneral}
                          </TableCell>
                          <TableCell className="text-center">
                            {jugador.equi_nombre}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`w-[60px] pl-2 pr-2 rounded-3xl ${getEstiloPosicion(
                                jugador.posi_nombre
                              )}`}
                            >
                              {jugador.posi_nombre}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {jugador.trju_tipo}
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-gray-500"
                        >
                          No hay jugadores asociados a esta transferencia.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="text-center p-3">
                {detalleTransferencia &&
                detalleTransferencia[0].tran_estado === 0 ? (
                  <>
                    <Button
                      className="mr-3 bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        gestionarRespuestaSolicitud(
                          1,
                          notificacionSeleccionada.nome_titulo
                        )
                      }
                    >
                      Aceptar
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() =>
                        gestionarRespuestaSolicitud(
                          2,
                          notificacionSeleccionada.nome_titulo
                        )
                      }
                    >
                      Rechazar
                    </Button>
                  </>
                ) : (
                  <div
                    className={`text-lg font-bold ${
                      detalleTransferencia[0].tran_estado === 1
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    Solicitud{" "}
                      {detalleTransferencia[0].tran_estado === 1
                        ? "Aprobada"
                        : detalleTransferencia[0].tran_estado === 2
                        ? "Rechazada"
                        : "Anulada"}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Selecciona una notificación para ver los detalles.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificacionMercadoPage;
