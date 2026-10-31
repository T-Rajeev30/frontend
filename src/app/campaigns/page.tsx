"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState, Skeleton } from "@/components/ui/error-state";
import { api, formatCurrency } from "@/lib/utils";
import { Lightbulb, Zap, AlertTriangle, TrendingDown, Users, ShoppingBag } from "lucide-react";

interface Recommendation {
  id: string;
  _id?: string;
  opportunityType: string;
  title: string;
  description: string;
  reasoning: string;
  severity: string;
  metrics: Record<string, unknown>;
  suggestedAction: string;
  estimatedCost: number;
  estimatedProfit: number;
  status: string;
}

interface Campaign {
  id: string;
  _id?: string;
  name: string;
  description: string;
  status: string;
  type: string;
  budgetAmount: number;
  estimatedProfit: number;
  discountPercent: number | null;
  targetSegment: string;
}

const severityColors = { high: "danger", medium: "warning", low: "info" } as const;
const typeIcons: Record<string, typeof TrendingDown> = {
  declining_sales: TrendingDown,
  inactive_customers: Users,
  underperforming_product: ShoppingBag,
  low_aov: AlertTriangle,
};

function getId(item: { id?: string; _id?: string }): string {
  return item.id || item._id || "";
}

export default function OpportunitiesPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [recs, camps] = await Promise.all([
        api<{ recommendations: Recommendation[] }>("/api/opportunities"),
        api<{ campaigns: Campaign[] }>("/api/campaigns"),
      ]);
      setRecommendations(recs.recommendations);
      setCampaigns(camps.campaigns);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const runDetection = async () => {
    setDetecting(true);
    try {
      await api("/api/opportunities/detect");
      await loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDetecting(false);
    }
  };

  const generateCampaign = async (id: string) => {
    setGeneratingId(id);
    try {
      const res = await api<{ campaign: Campaign; reasoning: string }>(`/api/opportunities/${id}/recommend`, { method: "POST" });
      setReasoning((prev) => ({ ...prev, [id]: res.reasoning }));
      await loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGeneratingId(null);
    }
  };

  const approveCampaign = async (id: string) => {
    await api(`/api/campaigns/${id}/approve`, { method: "PATCH" });
    await loadData();
  };

  const rejectCampaign = async (id: string) => {
    await api(`/api/campaigns/${id}/reject`, { method: "PATCH" });
    await loadData();
  };

  const simulateCampaign = async (id: string) => {
    await api(`/api/campaigns/${id}/simulate`, { method: "POST" });
    await loadData();
  };

  if (error && recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">AI Opportunity Detection</h1>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const pendingCampaigns = campaigns.filter((c) => c.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Opportunity Detection</h1>
          <p className="text-sm text-slate-400 mt-1">Analyse your business data to find growth opportunities</p>
        </div>
        <Button onClick={runDetection} disabled={detecting} size="lg">
          <Zap className="h-4 w-4" />
          {detecting ? "Analysing..." : "Run AI Analysis"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : (
        <>
          {error && <ErrorState message={error} onRetry={loadData} />}

          {recommendations.filter((r) => r.status === "new").length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                Detected Opportunities
              </h2>
              {recommendations.filter((r) => r.status === "new").map((rec) => {
                const recId = getId(rec);
                const Icon = typeIcons[rec.opportunityType] || AlertTriangle;
                return (
                  <Card key={recId}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          <div className="rounded-lg bg-slate-800 p-3 h-fit">
                            <Icon className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white">{rec.title}</h3>
                              <Badge variant={severityColors[rec.severity as keyof typeof severityColors]}>
                                {rec.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{rec.description}</p>
                            <details className="group mb-3">
                              <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">Why was this detected?</summary>
                              <p className="mt-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3">{rec.reasoning}</p>
                            </details>
                            <div className="flex gap-4 text-xs text-slate-400">
                              <span>Est. cost: <strong className="text-white">{formatCurrency(rec.estimatedCost)}</strong></span>
                              <span>Est. profit: <strong className="text-emerald-400">{formatCurrency(rec.estimatedProfit)}</strong></span>
                            </div>
                            {reasoning[recId] && (
                              <div className="mt-3 text-xs text-slate-400 bg-blue-950/30 border border-blue-900/30 rounded-lg p-3">
                                <strong className="text-blue-400">AI Reasoning:</strong> {reasoning[recId]}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button onClick={() => generateCampaign(recId)} disabled={generatingId === recId}>
                          <Zap className="h-3 w-3" />
                          {generatingId === recId ? "Generating..." : "Generate Campaign"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {pendingCampaigns.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Campaigns Awaiting Approval</h2>
              {pendingCampaigns.map((c) => {
                const cId = getId(c);
                return (
                  <Card key={cId} className="border-amber-900/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{c.name}</h3>
                          <p className="text-sm text-slate-400 mb-3">{c.description}</p>
                          <div className="flex gap-4 text-xs text-slate-400">
                            <span>Budget: <strong className="text-white">{formatCurrency(c.budgetAmount)}</strong></span>
                            <span>Discount: <strong className="text-white">{c.discountPercent || 0}%</strong></span>
                            <span>Target: <strong className="text-white">{c.targetSegment}</strong></span>
                            <span>Est. Profit: <strong className="text-emerald-400">{formatCurrency(c.estimatedProfit)}</strong></span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="success" onClick={() => approveCampaign(cId)}>Approve</Button>
                          <Button variant="danger" onClick={() => rejectCampaign(cId)}>Reject</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {campaigns.filter((c) => c.status === "approved").length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Approved Campaigns</h2>
              {campaigns.filter((c) => c.status === "approved").map((c) => {
                const cId = getId(c);
                return (
                  <Card key={cId} className="border-emerald-900/30">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{c.name}</h3>
                        <p className="text-sm text-slate-400">{c.description}</p>
                      </div>
                      <Button variant="success" onClick={() => simulateCampaign(cId)}>
                        <Zap className="h-3 w-3" /> Execute Campaign
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {recommendations.length === 0 && !loading && (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Lightbulb className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300">No opportunities detected yet</h3>
                <p className="text-sm text-slate-500 mt-1">Click &quot;Run AI Analysis&quot; to scan your business data</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
