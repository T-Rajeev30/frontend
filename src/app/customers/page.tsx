"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { api } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { useFetch } from "@/lib/use-fetch";
import { MessageSquare, Copy, ExternalLink, Users, Check } from "lucide-react";

interface MessageResponse {
  message: string;
  segment: string;
  customerCount: number;
  whatsappUrl: string;
  language: string;
}

export default function CustomersPage() {
  const { language } = useLanguage();
  const [selectedSegment, setSelectedSegment] = useState<string>("inactive");
  const [offerDetails, setOfferDetails] = useState("");
  const [result, setResult] = useState<MessageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: segData } = useFetch<{ segments: Record<string, number>; total: number }>("/api/customers/segments");

  const generateMessage = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<MessageResponse>("/api/customers/message", {
        method: "POST",
        body: JSON.stringify({
          segment: selectedSegment,
          offerDetails: offerDetails || undefined,
          language,
        }),
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const segments = segData?.segments ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Engagement</h1>
        <p className="text-sm text-slate-400 mt-1">Generate offer messages and reach your customers on WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Target Segment</label>
              <div className="flex flex-wrap gap-2">
                {["inactive", "loyal", "regular", "new", "all"].map((seg) => (
                  <button
                    key={seg}
                    onClick={() => setSelectedSegment(seg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedSegment === seg
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {seg.charAt(0).toUpperCase() + seg.slice(1)}
                    {segments[seg] !== undefined && (
                      <span className="ml-1 text-slate-500">({segments[seg]})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Offer Details (optional)</label>
              <input
                value={offerDetails}
                onChange={(e) => setOfferDetails(e.target.value)}
                placeholder="e.g. 20% off on combos this weekend"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <Button onClick={generateMessage} disabled={loading}>
              {loading ? "Generating..." : "Generate Message"}
            </Button>

            {error && <ErrorState message={error} onRetry={generateMessage} />}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Message Preview</CardTitle>
            <CardDescription>
              {result ? `For ${result.customerCount} ${result.segment} customers` : "Generate a message to preview"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-xl p-4">
                  <p className="text-sm text-white leading-relaxed">{result.message}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={copyMessage}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="success" size="sm">
                      <ExternalLink className="h-3 w-3" /> Share on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Select a segment and generate a message</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
