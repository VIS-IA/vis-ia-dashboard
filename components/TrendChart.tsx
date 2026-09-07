"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/lib/types";

/**
 * Gráfica de línea genérica para cualquier serie de TrendPoint (VIS
 * Score, calificación promedio, cantidad de reseñas, etc.). Los puntos
 * sin valor (null) se omiten de la línea en vez de dibujarse como 0 —
 * un reporte sin este dato no es lo mismo que un valor real de cero.
 */
export default function TrendChart({
  points,
  yDomain,
  color = "#2563eb",
  valueSuffix = "",
}: {
  points: TrendPoint[];
  yDomain?: [number, number];
  color?: string;
  valueSuffix?: string;
}) {
  const data = points
    .filter((p) => p.value !== null)
    .map((p) => ({ date: p.analysisDateLabel, value: p.value as number }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            domain={yDomain ?? ["auto", "auto"]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value}${valueSuffix}`, ""]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 4, fill: color }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
