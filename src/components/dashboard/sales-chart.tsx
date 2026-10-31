"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  date: string;
  revenue: number;
  transactions: number;
}

export function SalesChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<ChartData[]>(`/api/dashboard/sales-chart?period=${period}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Revenue Trend</CardTitle>
        <div className="flex gap-1">
          {(["daily", "weekly"] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "primary" : "ghost"}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-72 flex items-center justify-center text-slate-500">Loading chart...</div>
        ) : (
          <ResponsiveContainer width="100%" height={288}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={11}
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              />
              <YAxis stroke="#475569" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                labelFormatter={(label: any) => new Date(String(label)).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
