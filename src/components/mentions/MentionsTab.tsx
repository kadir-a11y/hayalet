"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Search,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Clock,
  MoreHorizontal,
  Globe,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Types ──────────────────────────────────────────────────────────────

interface Mention {
  id: string;
  projectId: string;
  platform: string;
  sourceUrl: string | null;
  sourceAuthor: string | null;
  content: string;
  sentiment: string;
  reachEstimate: number | null;
  engagementCount: number | null;
  requiresResponse: boolean | null;
  responseStatus: string;
  assignedPersonaId: string | null;
  respondedContentId: string | null;
  detectedAt: string;
  createdAt: string;
}

const SENTIMENT_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  positive: { label: "Pozitif", class: "bg-green-100 text-green-700", icon: ThumbsUp },
  negative: { label: "Negatif", class: "bg-red-100 text-red-700", icon: ThumbsDown },
  neutral: { label: "Nötr", class: "bg-gray-100 text-gray-600", icon: Minus },
};

const RESPONSE_STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  not_needed: { label: "Gerekmiyor", class: "bg-gray-100 text-gray-500" },
  pending: { label: "Bekliyor", class: "bg-yellow-100 text-yellow-700" },
  assigned: { label: "Atandı", class: "bg-blue-100 text-blue-700" },
  responded: { label: "Yanıtlandı", class: "bg-green-100 text-green-700" },
  ignored: { label: "Yok Sayıldı", class: "bg-gray-100 text-gray-400" },
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter/X",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  reddit: "Reddit",
};

const PAGE_SIZE = 20;

// ── Component ──────────────────────────────────────────────────────────

export default function MentionsTab({
  projectId,
}: {
  projectId: string;
}) {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-scan
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
  const [autoScanLoading, setAutoScanLoading] = useState(false);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Mention | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Detail
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Mention | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────

  const fetchMentions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (filterPlatform !== "all") params.set("platform", filterPlatform);
      if (filterSentiment !== "all") params.set("sentiment", filterSentiment);

      const res = await fetch(`/api/projects/${projectId}/mentions?${params}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data: Mention[] = await res.json();
      setMentions(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error("Mentions fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, filterPlatform, filterSentiment]);

  const fetchAutoScanStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/twitter-scan`);
      if (res.ok) {
        const data = await res.json();
        setAutoScanEnabled(data.enabled);
        setLastScanAt(data.lastScanAt);
      }
    } catch {}
  }, [projectId]);

  useEffect(() => {
    fetchMentions();
  }, [fetchMentions]);

  useEffect(() => {
    fetchAutoScanStatus();
  }, [fetchAutoScanStatus]);

  useEffect(() => {
    setPage(0);
  }, [filterPlatform, filterSentiment]);

  // Client-side search + date filter
  const filteredMentions = useMemo(() => {
    let result = mentions;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          (m.sourceAuthor && m.sourceAuthor.toLowerCase().includes(q))
      );
    }

    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((m) => new Date(m.detectedAt) >= from);
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((m) => new Date(m.detectedAt) <= to);
    }

    return result;
  }, [mentions, searchQuery, filterDateFrom, filterDateTo]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncate = (text: string, max = 200) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  // ── Auto-scan toggle ──────────────────────────────────────────────

  async function handleAutoScanToggle(enabled: boolean) {
    setAutoScanLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/twitter-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        const data = await res.json();
        setAutoScanEnabled(data.enabled);
        setLastScanAt(data.lastScanAt);
        if (enabled) {
          await fetchMentions();
        }
      }
    } catch (error) {
      console.error("Auto-scan toggle error:", error);
    } finally {
      setAutoScanLoading(false);
    }
  }

  async function handleScanNow() {
    setAutoScanLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/twitter-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanNow: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastScanAt(data.lastScanAt);
        await fetchMentions();
      }
    } catch (error) {
      console.error("Scan now error:", error);
    } finally {
      setAutoScanLoading(false);
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/mentions/${deleteItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setDeleteItem(null);
        await fetchMentions();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Auto-scan bar */}
      <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoScanEnabled}
              onCheckedChange={handleAutoScanToggle}
              disabled={autoScanLoading}
            />
            <span className="text-sm font-medium">
              Otomatik Tarama {autoScanEnabled ? "(Açık — saatte 1)" : "(Kapalı)"}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={handleScanNow}
            disabled={autoScanLoading}
          >
            {autoScanLoading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Şimdi Tara
          </Button>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Son Twitter Güncellemesi:</span>
          <span className="font-medium text-foreground">
            {lastScanAt ? formatDate(lastScanAt) : "Henüz taranmadı"}
          </span>
        </div>
      </div>

      {/* Top bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Bahsetme veya yazar ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-8 text-sm"
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-sm text-muted-foreground ml-auto">
          {filteredMentions.length} bahsetme
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Platformlar</SelectItem>
            {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSentiment} onValueChange={setFilterSentiment}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue placeholder="Duygu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Duygular</SelectItem>
            <SelectItem value="positive">Pozitif</SelectItem>
            <SelectItem value="negative">Negatif</SelectItem>
            <SelectItem value="neutral">Nötr</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="w-[140px] h-8 text-sm"
        />
        <span className="text-xs text-muted-foreground">—</span>
        <Input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="w-[140px] h-8 text-sm"
        />
        {(filterDateFrom || filterDateTo) && (
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => { setFilterDateFrom(""); setFilterDateTo(""); }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Mentions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredMentions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>Henüz bahsetme yok.</p>
            <p className="text-xs mt-1">Otomatik taramayı açın veya &quot;Şimdi Tara&quot; butonuna tıklayın.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredMentions.map((mention) => {
            const sentimentCfg = SENTIMENT_CONFIG[mention.sentiment] || SENTIMENT_CONFIG.neutral;
            const SentimentIcon = sentimentCfg.icon;
            const responseCfg = RESPONSE_STATUS_CONFIG[mention.responseStatus] || RESPONSE_STATUS_CONFIG.not_needed;

            return (
              <Card
                key={mention.id}
                className="hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => { setDetailItem(mention); setDetailOpen(true); }}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {mention.sourceAuthor && (
                          <span className="font-medium text-sm">{mention.sourceAuthor}</span>
                        )}
                        <Badge variant="secondary" className="text-xs h-5">
                          {PLATFORM_LABELS[mention.platform] || mention.platform}
                        </Badge>
                        <Badge className={`text-xs h-5 gap-1 ${sentimentCfg.class}`}>
                          <SentimentIcon className="h-3 w-3" />
                          {sentimentCfg.label}
                        </Badge>
                        {mention.responseStatus !== "not_needed" && (
                          <Badge className={`text-xs h-5 ${responseCfg.class}`}>
                            {responseCfg.label}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm mt-1 text-foreground/80">
                        {truncate(mention.content)}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(mention.detectedAt)}
                        </span>
                        {mention.engagementCount != null && mention.engagementCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {mention.engagementCount.toLocaleString()}
                          </span>
                        )}
                        {mention.reachEstimate != null && mention.reachEstimate > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {mention.reachEstimate.toLocaleString()}
                          </span>
                        )}
                        {mention.sourceUrl && (
                          <a
                            href={mention.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Kaynak
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setDetailItem(mention); setDetailOpen(true); }}>
                            <Eye className="mr-2 h-4 w-4" /> Görüntüle
                          </DropdownMenuItem>
                          {mention.sourceUrl && (
                            <DropdownMenuItem asChild>
                              <a href={mention.sourceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" /> Kaynağa Git
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => { setDeleteItem(mention); setDeleteOpen(true); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {(page > 0 || hasMore) && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Önceki
          </Button>
          <span className="text-sm text-muted-foreground">Sayfa {page + 1}</span>
          <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
            Sonraki <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bahsetme Detayı</DialogTitle>
          </DialogHeader>
          {detailItem && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {detailItem.sourceAuthor && (
                    <span className="font-medium">{detailItem.sourceAuthor}</span>
                  )}
                  <Badge variant="secondary">
                    {PLATFORM_LABELS[detailItem.platform] || detailItem.platform}
                  </Badge>
                  <Badge className={SENTIMENT_CONFIG[detailItem.sentiment]?.class || ""}>
                    {SENTIMENT_CONFIG[detailItem.sentiment]?.label || detailItem.sentiment}
                  </Badge>
                </div>

                <div className="rounded-md border bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{detailItem.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tespit Tarihi</p>
                    <p className="font-medium">{formatDate(detailItem.detectedAt)}</p>
                  </div>
                  {detailItem.reachEstimate != null && (
                    <div>
                      <p className="text-muted-foreground">Erişim Tahmini</p>
                      <p className="font-medium">{detailItem.reachEstimate.toLocaleString()}</p>
                    </div>
                  )}
                  {detailItem.engagementCount != null && (
                    <div>
                      <p className="text-muted-foreground">Etkileşim</p>
                      <p className="font-medium">{detailItem.engagementCount.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Yanıt Durumu</p>
                    <Badge className={RESPONSE_STATUS_CONFIG[detailItem.responseStatus]?.class || ""}>
                      {RESPONSE_STATUS_CONFIG[detailItem.responseStatus]?.label || detailItem.responseStatus}
                    </Badge>
                  </div>
                </div>

                {detailItem.sourceUrl && (
                  <a
                    href={detailItem.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Kaynağa Git
                  </a>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bahsetmeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu bahsetmeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteItem && (
            <div className="rounded-md border bg-muted/50 p-3 text-sm">
              <p className="font-medium">{deleteItem.sourceAuthor || "Bilinmeyen"}</p>
              <p className="mt-1 text-muted-foreground line-clamp-2">{deleteItem.content}</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
