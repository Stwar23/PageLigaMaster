import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ValoresMercadoPage = () => {
  const [valoresMercado, setValoresMercado] = useState([]);

  useEffect(() => {
    const consultarValoresMercado = async () => {
      const { data, error } = await supabase.rpc("fn_listar_valores_mercado");

      if (error) {
        console.error("Ha ocurrido un error.");
      } else {
        setValoresMercado(data);
      }
    };

    consultarValoresMercado();
  }, []);

  return (
    <div className="flex flex-col w-full items-center justify-items-end ">
      <h1 className="w-full text-center text-lg mb-2 font-bold">
        VALORES DEL MERCADO
      </h1>
      <div className="w-2/3 flex justify-center items-center">
        <Table className="border border-primary/30 rounded bg-black">
          <TableHeader>
            <TableRow className="bg-black">
              <th className="text-center text-primary font-semibold py-1.5">Valoración general</th>
              <th className="text-center text-primary font-semibold py-1.5">Valor venta</th>
              <th className="text-center text-primary font-semibold py-1.5">Valor libre</th>
              <th className="text-center text-primary font-semibold py-1.5">Valor salario</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {valoresMercado.length > 0 ? (
              valoresMercado.map((valor, index) => {
                return (
                <tr className="" key={index}>
                    <td className="border border-primary/30 text-center text-white font-normal py-1">{valor.vame_id}</td>
                    <td className="border border-primary/30 text-center text-white font-normal py-1">{valor.vame_valorventa}</td>
                    <td className="border border-primary/30 text-center text-white font-normal py-1">{valor.vame_valorlibre}</td>
                    <td className="border border-primary/30 text-center text-white font-normal py-1">{valor.vame_salario}</td>
                </tr>
                );
              })
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
    </div>
  );
};

export default ValoresMercadoPage;
