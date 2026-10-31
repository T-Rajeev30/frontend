"use client";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { TopProducts } from "@/components/dashboard/top-products";
import { CustomerSegments } from "@/components/dashboard/customer-segments";
import { BriefingCard } from "@/components/dashboard/briefing-card";
import { AiOpsPanel } from "@/components/dashboard/ai-ops-panel";
import { formatCurrency } from "@/lib/utils";
import { useFetch } from "@/lib/use-fetch";
import { ErrorState, Skeleton } from "@/components/ui/error-state";
import { IndianRupee, Receipt, TrendingUp, Users } from "lucide-react";

interface Stats {
  totalRevenue: number;
  revenueChange: number;
  totalTransactions: number;
  transactionChange: number;
  avgOrderValue: number;
  aovChange: number;
  returningCustomers: number;
  returningChange: number;
}

export default function DashboardPage() {
  const { data: stats, loading, error, refetch } = useFetch<Stats>("/api/dashboard/stats");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Business Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time overview of your business performance</p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading || !stats ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : (
            <>
              <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} change={stats.revenueChange} icon={IndianRupee} />
              <StatCard title="Transactions" value={stats.totalTransactions} change={stats.transactionChange} icon={Receipt} />
              <StatCard title="Avg Order Value" value={formatCurrency(stats.avgOrderValue)} change={stats.aovChange} icon={TrendingUp} />
              <StatCard title="Returning Customers" value={stats.returningCustomers} change={stats.returningChange} icon={Users} />
            </>
          )}
        </div>
      )}

      <BriefingCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <HourlyChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts />
        <CustomerSegments />
      </div>

      <AiOpsPanel />
    </div>
  );
}
