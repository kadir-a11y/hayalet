"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Radar,
  Search,
  Zap,
  Clock,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
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

interface StatsData {
  activeTopics: number;
  todayDiscovered: number;
  todayAutoPosted: number;
  pendingApproval: number;
  last7DaysData: { date: string; count: number }[];
  sourceDistribution: { sourceType: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
}

interface DiscoveredItem {
  id: string;
  topicId: string;
  sourceId: string;
  externalId: string | null;
  title: string | null;
  summary: string | null;
  url: string | null;
  relevanceScore: number;
  status: string;
  discoveredAt: string;
  createdAt: string;
  topicName: string;
  sourceType: string;
}

interface DiscoveredResponse {
  items: DiscoveredItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface Topic {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  pending_approval: "Onay Bekliyor",
  approved: "Onaylandı",
  auto_posted: "Otomatik Paylaşım",
  rejected: "Reddedildi",
  posted: "Paylaşıldı",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "outline",
  pending_approval: "secondary",
  approved: "default",
  auto_posted: "default",
  rejected: "destructive",
  posted: "default",
};

const SOURCE_LABELS: Record<string, string> = {
  rss: "RSS",
  twitter: "Twitter",
  reddit: "Reddit",
  web: "Web",
  youtube: "YouTube",
  telegram: "Telegram",
  news: "Haber",
};

const SCORE_COLORS: Record<string, string> = {
  "0-19": "#ef4444",
  "20-49": "#f59e0b",
  "50-79": "#3b82f6",
  "80-100": "#22c55e",
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
// Score Bar
// ---------------------------------------------------------------------------

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 50
        ? "bg-blue-500"
        : score >= 20
          ? "bg-yellow-500"
          : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums">{score}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MonitoringDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [items, setItems] = useState<DiscoveredItem[]>([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterScoreMin, setFilterScoreMin] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"discoveredAt" | "relevanceScore">("discoveredAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const pageSize = 20;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/monitoring/stats");
      if (!res.ok) throw new Error("İstatistik verileri yüklenemedi.");
      const json = await res.json();
      setStats(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  }, []);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch("/api/monitoring/topics");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.map((t: Topic) => ({ id: t.id, name: t.name })));
      }
    } catch {
      // silent
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("pageSize", String(pageSize));
      if (filterTopic !== "all") params.set("topicId", filterTopic);
      if (filterSource !== "all") params.set("sourceType", filterSource);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterScoreMin !== "all") {
        const [min, max] = filterScoreMin.split("-");
        params.set("minScore", min);
        params.set("maxScore", max);
      }

      const res = await fetch(`/api/monitoring/discovered?${params.toString()}`);
      if (!res.ok) throw new Error("İçerikler yüklenemedi.");
      const json: DiscoveredResponse = await res.json();
      setItems(json.items);
      setItemsTotal(json.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  }, [currentPage, filterTopic, filterSource, filterStatus, filterScoreMin]);

  useEffect(() => {
    Promise.all([fetchStats(), fetchTopics(), fetchItems()]).finally(() =>
      setIsLoading(false)
    );
  }, [fetchStats, fetchTopics, fetchItems]);

  function handleSort(field: "discoveredAt" | "relevanceScore") {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortField === "relevanceScore") {
      return (a.relevanceScore - b.relevanceScore) * dir;
    }
    return (new Date(a.discoveredAt).getTime() - new Date(b.discoveredAt).getTime()) * dir;
  });

  // Recent items for live feed (latest 10)
  const recentItems = [...items]
    .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime())
    .slice(0, 10);

  const totalPages = Math.ceil(itemsTotal / pageSize);

  function handleRefresh() {
    setIsLoading(true);
    setError("");
    Promise.all([fetchStats(), fetchItems()]).finally(() => setIsLoading(false));
  }

  function handleFilterReset() {
    setFilterTopic("all");
    setFilterSource("all");
    setFilterStatus("all");
    setFilterScoreMin("all");
    setCurrentPage(1);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes} dk once`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat once`;
    return `${Math.floor(hours / 24)} gun once`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/monitoring">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Izleme Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Izleme istatistikleri ve kesif verileri
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      <Separator />

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleRefresh}>
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {isLoading && !stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Data loaded */}
      {stats && (
        <>
          {/* Overview stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Aktif Konular"
              value={stats.activeTopics}
              icon={Radar}
              description="izlenen konu"
            />
            <StatCard
              title="Bugün Keşfedilen"
              value={stats.todayDiscovered}
              icon={Search}
              description="bugün bulunan içerik"
            />
            <StatCard
              title="Otomatik Paylaşım"
              value={stats.todayAutoPosted}
              icon={Zap}
              description="bugün otomatik paylaşılan"
            />
            <StatCard
              title="Onay Bekleyen"
              value={stats.pendingApproval}
              icon={Clock}
              description="onay bekliyor"
            />
          </div>

          {/* Live Feed + Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Live Feed Panel (left) */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Son Keşfedilenler</CardTitle>
                <CardDescription>En son bulunan icerikler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentItems.length > 0 ? (
                  recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1.5 rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight line-clamp-2">
                          {item.title || "Başlıksız içerik"}
                        </p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {SOURCE_LABELS[item.sourceType] || item.sourceType}
                        </Badge>
                        <Badge
                          variant={STATUS_VARIANTS[item.status] || "outline"}
                          className="text-xs"
                        >
                          {STATUS_LABELS[item.status] || item.status}
                        </Badge>
                        <ScoreBar score={item.relevanceScore} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.topicName} &middot; {formatTimeAgo(item.discoveredAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Henuz kesfedilen icerik yok
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Charts (right) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Line chart: last 7 days */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Son 7 Gun</CardTitle>
                  <CardDescription>Gunluk kesfedilen icerik sayisi</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.last7DaysData.some((d) => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={stats.last7DaysData}>
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
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Keşfedilen"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                      Henüz veri yok
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Pie chart: source distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Kaynak Dagilimi</CardTitle>
                    <CardDescription>Kaynak turune gore icerikler</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.sourceDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={stats.sourceDistribution.map((s) => ({
                              name: SOURCE_LABELS[s.sourceType] || s.sourceType,
                              value: s.count,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {stats.sourceDistribution.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                        Henüz veri yok
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bar chart: score distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Skor Dagilimi</CardTitle>
                    <CardDescription>Ilgililik skoruna gore icerikler</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.scoreDistribution.some((s) => s.count > 0) ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.scoreDistribution}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" name="İçerik" radius={[4, 4, 0, 0]}>
                            {stats.scoreDistribution.map((entry, index) => (
                              <Cell
                                key={`score-${index}`}
                                fill={SCORE_COLORS[entry.range] || "#94a3b8"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                        Henüz veri yok
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Keşfedilen İçerikler</CardTitle>
                  <CardDescription>
                    Toplam {itemsTotal} icerik
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Button variant="ghost" size="sm" onClick={handleFilterReset}>
                    Filtreleri Temizle
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                {/* Topic filter */}
                <Select value={filterTopic} onValueChange={(v) => { setFilterTopic(v); setCurrentPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Konu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tum Konular</SelectItem>
                    {topics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Source type filter */}
                <Select value={filterSource} onValueChange={(v) => { setFilterSource(v); setCurrentPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kaynak Turu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tum Kaynaklar</SelectItem>
                    <SelectItem value="rss">RSS</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="news">Haber</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status filter */}
                <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tum Durumlar</SelectItem>
                    <SelectItem value="new">Yeni</SelectItem>
                    <SelectItem value="pending_approval">Onay Bekliyor</SelectItem>
                    <SelectItem value="approved">Onaylandi</SelectItem>
                    <SelectItem value="auto_posted">Otomatik Paylaşım</SelectItem>
                    <SelectItem value="rejected">Reddedildi</SelectItem>
                    <SelectItem value="posted">Paylaşıldı</SelectItem>
                  </SelectContent>
                </Select>

                {/* Score range filter */}
                <Select value={filterScoreMin} onValueChange={(v) => { setFilterScoreMin(v); setCurrentPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Skor Aralığı" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Skorlar</SelectItem>
                    <SelectItem value="80-100">Yüksek (80-100)</SelectItem>
                    <SelectItem value="50-79">Orta (50-79)</SelectItem>
                    <SelectItem value="20-49">Düşük (20-49)</SelectItem>
                    <SelectItem value="0-19">Çok Düşük (0-19)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              {sortedItems.length > 0 ? (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">Baslik</TableHead>
                          <TableHead>Konu</TableHead>
                          <TableHead>Kaynak</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSort("relevanceScore")}
                          >
                            Skor {sortField === "relevanceScore" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none text-right"
                            onClick={() => handleSort("discoveredAt")}
                          >
                            Tarih {sortField === "discoveredAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                          </TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <p className="text-sm font-medium line-clamp-1">
                                {item.title || "Başlıksız içerik"}
                              </p>
                              {item.summary && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {item.summary}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{item.topicName}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {SOURCE_LABELS[item.sourceType] || item.sourceType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={STATUS_VARIANTS[item.status] || "outline"}
                                className="text-xs"
                              >
                                {STATUS_LABELS[item.status] || item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <ScoreBar score={item.relevanceScore} />
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {formatDate(item.discoveredAt)}
                            </TableCell>
                            <TableCell>
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Button>
                                </a>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Sayfa {currentPage} / {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                        >
                          Onceki
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          Sonraki
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Filtrelere uyan icerik bulunamadi
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
