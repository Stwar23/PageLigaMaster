import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const RadarStats = ({ jugador }) => {
  let datosRadar;
  if ( jugador.GK != 0){
    datosRadar = [
        { categoria: "TIR", valor: (jugador.juga_finalizacion + jugador.juga_potenciatiro ) / 2 },
        { categoria: "PAS", valor: (jugador.juga_pasealras + jugador.juga_pasebombeado ) / 2 },
        { categoria: "FRZ", valor: (jugador.juga_salto + jugador.juga_contactofisico) / 2 },
        { categoria: "DEF", valor: ( jugador.juga_actitudportero + jugador.juga_atajar + jugador.juga_despejar + jugador.juga_reflejos + jugador.juga_cobertura ) / 5 },
        { categoria: "VEL", valor: (jugador.juga_velocidad + jugador.juga_resistencia) / 2 },
        { categoria: "DRI", valor: (jugador.juga_dribbling + jugador.juga_posecionbalon + jugador.juga_equilibrio) / 3 },
    ]
  } else {
    datosRadar = [
        { categoria: "TIR", valor: (jugador.juga_finalizacion + jugador.juga_potenciatiro ) / 2 },
        { categoria: "PAS", valor: (jugador.juga_pasealras + jugador.juga_pasebombeado ) / 2 },
        { categoria: "FRZ", valor: (jugador.juga_salto + jugador.juga_contactofisico) / 2 },
        { categoria: "DEF", valor: ( jugador.juga_agresividad + jugador.juga_recupbalon + jugador.juga_actituddefensiva) / 3 },
        { categoria: "VEL", valor: (jugador.juga_velocidad + jugador.juga_resistencia) / 2 },
        { categoria: "DRI", valor: (jugador.juga_dribbling + jugador.juga_posecionbalon + jugador.juga_equilibrio) / 3 },
    ];
  }

  return (
    <div className="w-[220px] h-[200px] ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" width={300} height={250} data={datosRadar}>
        <PolarGrid />
        <PolarAngleAxis dataKey="categoria"  />
        <PolarRadiusAxis angle={30} domain={[40, 100]} tick={false} />

        <Radar
            name="Valor"
            dataKey="valor"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.7}
        />
        <Tooltip
            contentStyle={{ backgroundColor: "#000", borderColor: "#444", color: "#fff" }}
            formatter={(value: number, name: string) => [`${value}`, name]}
        />
        </RadarChart>

      </ResponsiveContainer>
    </div>
  );
};

export default RadarStats;
