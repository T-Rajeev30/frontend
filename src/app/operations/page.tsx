"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState, Skeleton } from "@/components/ui/error-state";
import { useFetch } from "@/lib/use-fetch";
import { Package, AlertTriangle, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface ForecastSlot {
  slot: string;
  predictedUnits: number;
  confidence: { low: number; high: number };
  avgRevenue: number;
}

interface ForecastItem {
  productName: string;
  category: string;
  slots: ForecastSlot[];
  totalPredicted: number;
}

interface ForecastData {
  forecastDate: string;
  dayOfWeek: string;
  basedOnWeeks: number;
  forecast: ForecastItem[];
  slowMoving: Array<{ name: string; category: string; orders30d: number }>;
}

export default function OperationsPage() {
  const { data, loading, error, refetch } = useFetch<ForecastData>("/api/operations/forecast");

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Operations & Prep Planner</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Operations & Prep Planner</h1>
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data) return null;

  const chartData = data.forecast.slice(0, 8).map((item) => ({
    name: item.productName,
    Morning: item.slots.find((s) => s.slot === "Morning")?.predictedUnits ?? 0,
    Lunch: item.slots.find((s) => s.slot === "Lunch")?.predictedUnits ?? 0,
    Afternoon: item.slots.find((s) => s.slot === "Afternoon")?.predictedUnits ?? 0,
    Evening: item.slots.find((s) => s.slot === "Evening")?.predictedUnits ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Operations & Prep Planner</h1>
        <p className="text-sm text-slate-400 mt-1">
          Demand forecast for {data.dayOfWeek}, {data.forecastDate} (based on {data.basedOnWeeks} weeks of data)
        </p>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Prepare for Tomorrow
          </CardTitle>
          <CardDescription>Predicted units per product per time slot</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#475569" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} width={100} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Morning" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Lunch" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Afternoon" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="Evening" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 text-slate-400 font-medium">Product</th>
                  <th className="text-center py-2 text-amber-400 font-medium">Morning</th>
                  <th className="text-center py-2 text-blue-400 font-medium">Lunch</th>
                  <th className="text-center py-2 text-purple-400 font-medium">Afternoon</th>
                  <th className="text-center py-2 text-emerald-400 font-medium">Evening</th>
                  <th className="text-center py-2 text-white font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.forecast.map((item) => (
                  <tr key={item.productName} className="border-b border-slate-800/50">
                    <td className="py-2">
                      <span className="text-white">{item.productName}</span>
                      <Badge variant="default" className="ml-2">{item.category}</Badge>
                    </td>
                    {item.slots.map((slot) => (
                      <td key={slot.slot} className="text-center py-2 text-slate-300">
                        {slot.predictedUnits > 0 ? (
                          <span title={`${slot.confidence.low}–${slot.confidence.high}`}>
                            {slot.predictedUnits}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    ))}
                    <td className="text-center py-2 font-medium text-white">{item.totalPredicted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Slow Moving Products */}
      {data.slowMoving.length > 0 && (
        <Card className="border-amber-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Slow-Moving Products
            </CardTitle>
            <CardDescription>Products with significantly below-average sales in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data.slowMoving.map((p) => (
                <div key={p.name} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                  <Package className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="text-sm text-white">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.orders30d} orders in 30d</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
