"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, FileText, CheckCircle, Megaphone, Loader2, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentStatItem {
  status: string;
  count: number;
}

interface ActivityLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
}

interface ActivityStatItem {
  date: string;
  count: number;
}

interface CampaignStatItem {
  status: string;
  count: number;
}

interface AnalyticsData {
  personaCount: number;
  contentStats: ContentStatItem[];
  recentActivity: ActivityLogItem[];
  activityStats: ActivityStatItem[];
  campaignStats: CampaignStatItem[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  scheduled: "#3b82f6",
  publishing: "#f59e0b",
  published: "#22c55e",
  failed: "#ef4444",
};

const PIE_COLORS = ["#94a3b8", "#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"];

const ACTION_LABELS: Record<string, string> = {
  created: "Oluşturuldu",
  updated: "Güncellendi",
  deleted: "Silindi",
  executed: "Çalıştırıldı",
  scheduled: "Zamanlanmış",
};

const ENTITY_LABELS: Record<string, string> = {
  persona: "Persona",
  content: "İçerik",
  campaign: "Kampanya",
  tag: "Etiket",
};

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-4 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Analitik verileri yüklenemedi.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Derived values
  const totalContent =
    data?.contentStats.reduce((sum, s) => sum + s.count, 0) ?? 0;
  const publishedContent =
    data?.contentStats.find((s) => s.status === "published")?.count ?? 0;
  const activeCampaigns =
    data?.campaignStats.find((s) => s.status === "active")?.count ?? 0;

  // Pie chart data
  const pieData =
    data?.contentStats.map((s) => ({
      name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
      value: s.count,
      color: STATUS_COLORS[s.status] || "#8b5cf6",
    })) ?? [];

  // Bar chart data (last 30 days activity)
  const barData = data?.activityStats ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analitik</h1>
        <p className="text-sm text-muted-foreground">
          Genel bakış ve istatistikler
        </p>
      </div>

      <Separator />

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setIsLoading(true);
                fetchAnalytics();
              }}
            >
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Data loaded */}
      {!isLoading && !error && data && (
        <>
          {/* Overview cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Toplam Persona"
              value={data.personaCount}
              icon={Users}
            />
            <StatCard
              title="Toplam İçerik"
              value={totalContent}
              icon={FileText}
            />
            <StatCard
              title="Yayınlanan İçerik"
              value={publishedContent}
              icon={CheckCircle}
            />
            <StatCard
              title="Aktif Kampanya"
              value={activeCampaigns}
              icon={Megaphone}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Content Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">İçerik Durum Dağılımı</CardTitle>
                <CardDescription>
                  İçerik durumlarının genel dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    Henüz içerik verisi yok
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aktivite (Son 30 Gun)</CardTitle>
                <CardDescription>
                  Günlük aktivite sayıları
                </CardDescription>
              </CardHeader>
              <CardContent>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const d = new Date(value);
                          return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        labelFormatter={(value) => {
                          const d = new Date(value as string);
                          return d.toLocaleDateString("tr-TR");
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        name="Aktivite"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    Henüz aktivite verisi yok
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Son Aktiviteler</CardTitle>
              <CardDescription>
                Son yapılan işlemler
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentActivity.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tür</TableHead>
                      <TableHead>İşlem</TableHead>
                      <TableHead>Varlık ID</TableHead>
                      <TableHead className="text-right">Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {ENTITY_LABELS[activity.entityType] || activity.entityType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              activity.action === "deleted"
                                ? "destructive"
                                : activity.action === "created"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {ACTION_LABELS[activity.action] || activity.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {activity.entityId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Henüz aktivite kaydı yok
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
