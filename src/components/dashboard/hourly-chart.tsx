"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useFetch } from "@/lib/use-fetch";
import { ErrorState, Skeleton } from "@/components/ui/error-state";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface HourlyData {
  hour: number;
  label: string;
  currentTransactions: number;
  previousTransactions: number;
  change: number;
}

export function HourlyChart() {
  const { data, loading, error, refetch } = useFetch<HourlyData[]>("/api/dashboard/hourly-distribution");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Sales Distribution</CardTitle>
        <CardDescription>Current 4 weeks vs previous 4 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : loading || !data ? (
          <Skeleton className="h-72" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#475569" fontSize={10} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="previousTransactions" name="Previous" fill="#475569" radius={[2, 2, 0, 0]} />
              <Bar dataKey="currentTransactions" name="Current" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
