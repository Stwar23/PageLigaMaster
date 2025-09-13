import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const ModalFiltroJugadores = ({ onClose, activarFiltrosAvanzados, setActualizarFiltros }) => {
  const [paises, setPaises] = useState([]);
  const [stats, setStats] = useState([]);
  const habilidadesRef = useRef({});
  const posicionesRef = useRef({});
  const piernaRef = useRef();
  const paisRef = useRef();
  const [filtroEdad, setFiltroEdad] = useState();

  useEffect(() => {
    const filtrosGuardados = localStorage.getItem("filtros_avanzados");

    if (filtrosGuardados) {
      const { filtrosCompletos } = JSON.parse(filtrosGuardados);

      // Edad
      if (filtrosCompletos.edad) {
        setFiltroEdad(filtrosCompletos.edad);
      }

      // Pierna hábil
      if (filtrosCompletos.pierna && piernaRef.current) {
        piernaRef.current.value = filtrosCompletos.pierna;
      }

      // País
      if (filtrosCompletos.pais && paisRef.current) {
        paisRef.current.value = filtrosCompletos.pais;
      }

      // Habilidades
      if (filtrosCompletos.habilidades) {
        setStats(filtrosCompletos.habilidades);

        // Aplicar valores a los inputs directamente también
        Object.entries(filtrosCompletos.habilidades).forEach(([key, value]) => {
          if (habilidadesRef.current[key]) {
            habilidadesRef.current[key].value = value;
          }
        });
      }

      // Posiciones
      if (filtrosCompletos.posiciones) {
        Object.entries(filtrosCompletos.posiciones).forEach(([key, value]) => {
          if (posicionesRef.current[key]) {
            posicionesRef.current[key].value = value;
          }
        });
      }
    }
  }, []);

  const habilidades = [
    { nombre: "Valoración general", id: "juga_valoraciongeneral" },
    { nombre: "Contacto físico", id: "juga_contactofisico" },
    { nombre: "Actitud ofensiva", id: "juga_actitudofensiva" },
    { nombre: "Equilibrio", id: "juga_equilibrio" },
    { nombre: "Control de balón", id: "juga_controlbalon" },
    { nombre: "Resistencia", id: "juga_resistencia" },
    { nombre: "Drible", id: "juga_dribbling" },
    { nombre: "Actitud defensiva", id: "juga_actituddefensiva" },
    { nombre: "Posesión de balón", id: "juga_posecionbalon" },
    { nombre: "Recuperación de balón", id: "juga_recupbalon" },
    { nombre: "Pase al ras", id: "juga_pasealras" },
    { nombre: "Agresividad", id: "juga_agresividad" },
    { nombre: "Pase bombeado", id: "juga_pasebombeado" },
    { nombre: "Actitud de portero", id: "juga_actitudportero" },
    { nombre: "Finalización", id: "juga_finalizacion" },
    { nombre: "Atajar (PT)", id: "juga_atajar" },
    { nombre: "Cabeceador", id: "juga_cabeceador" },
    { nombre: "Despejar (PT)", id: "juga_despejar" },
    { nombre: "Balón parado", id: "juga_balonparado" },
    { nombre: "Reflejos (PT)", id: "juga_reflejos" },
    { nombre: "Efecto", id: "juga_efecto" },
    { nombre: "Cobertura (PT)", id: "juga_cobertura" },
    { nombre: "Velocidad", id: "juga_velocidad" },
    { nombre: "Uso pie malo", id: "juga_usopiemalo" },
    { nombre: "Aceleracion", id: "juga_aceleracion" },
    { nombre: "Presición pie malo", id: "juga_precisionpiemalo" },
    { nombre: "Potencia de tiro", id: "juga_potenciatiro" },
    { nombre: "Estabilidad", id: "juga_estabilidad" },
    { nombre: "Salto", id: "juga_salto" },
    { nombre: "Resistencia a lesiones", id: "juga_resistlesion" },
  ];

  const posiciones = [
    { nombre: "PT", id: "GK" },
    { nombre: "MDD", id: "RMF" },
    { nombre: "DEC", id: "CB" },
    { nombre: "MO", id: "AMF" },
    { nombre: "LI", id: "LB" },
    { nombre: "EXI", id: "LWF" },
    { nombre: "LD", id: "RB" },
    { nombre: "EXD", id: "RWF" },
    { nombre: "MCD", id: "DMF" },
    { nombre: "SD", id: "SS" },
    { nombre: "MC", id: "CMF" },
    { nombre: "CD", id: "CF" },
    { nombre: "MDI", id: "LMF" },
  ];

  useEffect(() => {
    const paisesLocalStorage = localStorage.getItem("paises");
    if (paisesLocalStorage) {
      setPaises(JSON.parse(paisesLocalStorage));
    }
    // console.log("STATS ==> ", stats);
  }, []);

  const aplicarFiltros = () => {
    if (localStorage.getItem("filtros_avanzados")){
        localStorage.removeItem("filtros_avanzados");
    }

    const filtrosHabilidades = {};

    const piernaValue = piernaRef.current?.value;
    const piernaHabil = piernaValue !== "0" ? piernaValue : null;

    const paisValue = paisRef.current?.value;
    const paisSeleccionado = paisValue !== "0" ? paisValue : null;

    for (const key in habilidadesRef.current) {
      const value = parseInt(habilidadesRef.current[key]?.value || "40", 10);
      filtrosHabilidades[key] = isNaN(value) ? 40 : Math.max(40, value); // Asegura mínimo 40
    }

    const filtrosPosiciones = {};
    for (const key in posicionesRef.current) {
      const value = parseInt(posicionesRef.current[key]?.value || "0", 10);
      filtrosPosiciones[key] = isNaN(value) ? 0 : value;
    }

    const filtrosCompletos = {
      habilidades: stats,
      posiciones: filtrosPosiciones,
      edad: filtroEdad,
    };

    if (piernaHabil) filtrosCompletos.pierna = piernaHabil;
    if (paisSeleccionado) filtrosCompletos.pais = paisSeleccionado;

    console.log("FILTROS ==> ", filtrosCompletos);

    localStorage.setItem(
      "filtros_avanzados",
      JSON.stringify({ filtrosCompletos })
    );

    activarFiltrosAvanzados();
    setActualizarFiltros(prev => !prev); // <- activa el useEffect del principal

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
      <div className="bg-black dark:bg-gray-900 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center">
          Filtros avanzados
        </h2>

        <div className="flex justify-center">
          <div className="flex flex-col justify-start p-2">
            <div className="flex justify-between my-1 gap-4">
              <label className="font-normal text-sm text-primary">Edad</label>
              <input
                type="number"
                className="max-h-5 max-w-16 text-black rounded pl-1 text-center"
                max={110}
                value={filtroEdad?.juga_edad || ""}
                onChange={(e) =>
                  setFiltroEdad((prev) => ({
                    ...prev,
                    ["juga_edad"]: parseInt(e.target.value) || 14,
                  }))
                }
              />
            </div>
            <div className="flex justify-between my-1 gap-4">
              <label className="font-normal text-sm text-primary">
                Pierna hábil
              </label>
              <select
                className="text-black rounded"
                ref={piernaRef}
                defaultValue="0"
              >
                <option value="0">Selecciona</option>
                <option value="Derecha">Derecha</option>
                <option value="Izquierda">Izquierda</option>
              </select>
            </div>
            <div className="flex justify-between my-1 gap-4">
              <label className="font-normal text-sm text-primary">País</label>
              <select
                className="text-black rounded"
                ref={paisRef}
                defaultValue="0"
              >
                <option value="0">Selecciona</option>
                {paises.map((pais) => (
                  <option key={pais.pais_id} value={pais.pais_id}>
                    {pais.pais_nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-center border border-primary rounded p-2">
              <label className="w-full text-lg text-primary font-semibold text-center">
                Habilidad por posición
              </label>
              <div className="grid grid-cols-2 p-2 rounded gap-x-5 gap-y-2">
                {posiciones.map((pos, index) => {
                  return (
                    <div key={index} className="flex justify-between">
                      <label className="font-normal text-sm text-primary">
                        {pos.nombre}
                      </label>
                      <select
                        className="text-black rounded px-1"
                        ref={(pr) => (posicionesRef.current[pos.id] = pr)}
                        defaultValue={0}
                      >
                        <option value={0}>C</option>
                        <option value={1}>B</option>
                        <option value={2}>A</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 border border-primary p-2 rounded">
            {habilidades.map((hab, index) => {
              return (
                <div
                  key={hab.id}
                  className="flex px-2 justify-between my-1 gap-2"
                >
                  <label className="font-normal text-sm text-primary">
                    {hab.nombre}
                  </label>
                  <input
                    ref={(sr) => (habilidadesRef.current[hab.id] = sr)}
                    type="number"
                    className="max-h-5 max-w-16 text-black rounded pl-1 text-center"
                    max={110}
                    // defaultValue={40}
                    onChange={(e) =>
                      setStats((prev) => ({
                        ...prev,
                        [hab.id]: parseInt(e.target.value) || 40,
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={aplicarFiltros}>Aplicar</Button>
        </div>
      </div>
    </div>
  );
};

export default ModalFiltroJugadores;
