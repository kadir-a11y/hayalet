"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Rss,
  Newspaper,
  Edit,
  Play,
} from "lucide-react";

interface Source {
  id: string;
  topicId: string;
  sourceType: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

interface DiscoveredItem {
  id: string;
  topicId: string;
  sourceId: string;
  externalId: string;
  title: string;
  summary: string;
  url: string;
  relevanceScore: number;
  status: string;
  discoveredAt: string;
  topicName?: string;
  sourceType?: string;
}

interface Rule {
  id: string;
  topicId: string;
  minRelevanceScore: number;
  targetPlatforms: string[];
  maxPostsPerDay: number;
  requiresApproval: boolean;
  isActive: boolean;
}

interface TopicDetail {
  id: string;
  name: string;
  keywords: string[];
  language: string;
  isActive: boolean;
  checkIntervalMinutes: number;
  lastCheckedAt: string | null;
  sources: Source[];
  discoveredItems: DiscoveredItem[];
  rules: Rule[];
}

const SOURCE_TYPES = [
  { value: "google_news", label: "Google News", icon: Newspaper },
  { value: "rss", label: "RSS Feed", icon: Rss },
  { value: "reddit", label: "Reddit", icon: Rss },
  { value: "youtube", label: "YouTube", icon: Play },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  reviewed: "bg-yellow-500",
  auto_posted: "bg-green-500",
  ignored: "bg-gray-500",
  manual_posted: "bg-purple-500",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  reviewed: "Incelendi",
  auto_posted: "Oto Paylasim",
  ignored: "Yoksayildi",
  manual_posted: "Manuel Paylasim",
};

export default function TopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Source dialog
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceType, setSourceType] = useState("google_news");
  const [sourceConfig, setSourceConfig] = useState("");
  const [sourceLoading, setSourceLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Rule dialog
  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleMinScore, setRuleMinScore] = useState("70");
  const [ruleMaxPosts, setRuleMaxPosts] = useState("5");
  const [ruleApproval, setRuleApproval] = useState(true);
  const [ruleLoading, setRuleLoading] = useState(false);

  const [checkNowLoading, setCheckNowLoading] = useState(false);

  const fetchTopic = useCallback(async () => {
    try {
      const res = await fetch(`/api/monitoring/topics/${topicId}`);
      if (res.ok) {
        setTopic(await res.json());
      } else {
        router.push("/monitoring");
      }
    } catch (error) {
      console.error("Failed to fetch topic:", error);
    } finally {
      setLoading(false);
    }
  }, [topicId, router]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  async function handleCheckNow() {
    setCheckNowLoading(true);
    try {
      await fetch(`/api/monitoring/topics/${topicId}/check-now`, { method: "POST" });
      setTimeout(() => fetchTopic(), 2000);
    } catch (error) {
      console.error("Check now failed:", error);
    } finally {
      setCheckNowLoading(false);
    }
  }

  async function handleEdit() {
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      const keywords = editKeywords.split(",").map((k) => k.trim()).filter(Boolean);
      const res = await fetch(`/api/monitoring/topics/${topicId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, keywords }),
      });
      if (res.ok) {
        setEditOpen(false);
        await fetchTopic();
      }
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/monitoring/topics/${topicId}`, { method: "DELETE" });
      if (res.ok) router.push("/monitoring");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleAddSource() {
    setSourceLoading(true);
    try {
      const config: Record<string, unknown> = {};
      if (sourceType === "rss" && sourceConfig) config.url = sourceConfig;
      if (sourceType === "reddit" && sourceConfig) config.subreddit = sourceConfig;
      if (sourceType === "youtube" && sourceConfig) config.channelId = sourceConfig;

      const res = await fetch(`/api/monitoring/topics/${topicId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType, config }),
      });
      if (res.ok) {
        setSourceOpen(false);
        setSourceConfig("");
        await fetchTopic();
      }
    } finally {
      setSourceLoading(false);
    }
  }

  async function handleDeleteSource(sourceId: string) {
    await fetch(`/api/monitoring/sources/${sourceId}`, { method: "DELETE" });
    await fetchTopic();
  }

  async function handleAddRule() {
    setRuleLoading(true);
    try {
      const res = await fetch(`/api/monitoring/topics/${topicId}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minRelevanceScore: parseInt(ruleMinScore),
          maxPostsPerDay: parseInt(ruleMaxPosts),
          requiresApproval: ruleApproval,
        }),
      });
      if (res.ok) {
        setRuleOpen(false);
        await fetchTopic();
      }
    } finally {
      setRuleLoading(false);
    }
  }

  async function handleStatusChange(itemId: string, newStatus: string) {
    await fetch(`/api/monitoring/discovered/${itemId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchTopic();
  }

  async function handleDeleteRule(ruleId: string) {
    await fetch(`/api/monitoring/rules/${ruleId}`, { method: "DELETE" });
    await fetchTopic();
  }

  function scoreColor(score: number) {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  }

  if (loading || !topic) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Yukleniyor...</p>
      </div>
    );
  }

  const filteredItems = statusFilter === "all"
    ? topic.discoveredItems
    : topic.discoveredItems.filter((i) => i.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/monitoring")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{topic.name}</h1>
          <div className="flex flex-wrap gap-1 mt-1">
            {topic.keywords.map((kw, i) => (
              <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckNow}
            disabled={checkNowLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${checkNowLoading ? "animate-spin" : ""}`} />
            Simdi Kontrol Et
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditName(topic.name);
              setEditKeywords(topic.keywords.join(", "));
              setEditOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Duzenle
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Feed ({topic.discoveredItems.length})</TabsTrigger>
          <TabsTrigger value="sources">Kaynaklar ({topic.sources.length})</TabsTrigger>
          <TabsTrigger value="rules">Kurallar ({topic.rules.length})</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-4">
          <div className="flex gap-2">
            {["all", "new", "reviewed", "auto_posted", "ignored"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "Tumu" : STATUS_LABELS[s] || s}
              </Button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Bulunan icerik yok. Kaynak ekleyin ve kontrol baslatin.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[item.status] || "bg-gray-400"}`} />
                          <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs font-bold ${scoreColor(item.relevanceScore)}`}>
                            Skor: {item.relevanceScore}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.discoveredAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Select
                          value={item.status}
                          onValueChange={(val) => handleStatusChange(item.id, val)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Yeni</SelectItem>
                            <SelectItem value="reviewed">Incelendi</SelectItem>
                            <SelectItem value="ignored">Yoksay</SelectItem>
                            <SelectItem value="manual_posted">Paylasildi</SelectItem>
                          </SelectContent>
                        </Select>
                        {item.url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(item.url, "_blank")}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Button size="sm" onClick={() => setSourceOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Kaynak Ekle
          </Button>

          {topic.sources.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Henuz kaynak eklenmemis.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {topic.sources.map((source) => (
                <Card key={source.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge>{source.sourceType}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {source.sourceType === "rss" && (source.config as { url?: string }).url}
                        {source.sourceType === "reddit" && `r/${(source.config as { subreddit?: string }).subreddit}`}
                        {source.sourceType === "youtube" && (source.config as { channelId?: string }).channelId}
                        {source.sourceType === "google_news" && "Google News RSS"}
                      </span>
                      <Badge variant={source.isActive ? "default" : "secondary"}>
                        {source.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSource(source.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Button size="sm" onClick={() => setRuleOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Kural Ekle
          </Button>

          {topic.rules.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Henuz otomatik paylasim kurali eklenmemis.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {topic.rules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span>Min Skor: <strong>{rule.minRelevanceScore}</strong></span>
                      <span>Max Post/Gun: <strong>{rule.maxPostsPerDay}</strong></span>
                      <Badge variant={rule.requiresApproval ? "outline" : "default"}>
                        {rule.requiresApproval ? "Onay Gerekli" : "Otomatik"}
                      </Badge>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konuyu Duzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Konu Adi</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Anahtar Kelimeler (virgul ile)</Label>
              <Input value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Iptal</Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Source Dialog */}
      <Dialog open={sourceOpen} onOpenChange={setSourceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kaynak Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kaynak Tipi</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((st) => (
                    <SelectItem key={st.value} value={st.value}>
                      {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {sourceType === "rss" && (
              <div className="space-y-2">
                <Label>RSS URL</Label>
                <Input
                  placeholder="https://example.com/feed.xml"
                  value={sourceConfig}
                  onChange={(e) => setSourceConfig(e.target.value)}
                />
              </div>
            )}
            {sourceType === "reddit" && (
              <div className="space-y-2">
                <Label>Subreddit Adi</Label>
                <Input
                  placeholder="orn: technology"
                  value={sourceConfig}
                  onChange={(e) => setSourceConfig(e.target.value)}
                />
              </div>
            )}
            {sourceType === "youtube" && (
              <div className="space-y-2">
                <Label>Kanal ID</Label>
                <Input
                  placeholder="orn: UCxxxxxx"
                  value={sourceConfig}
                  onChange={(e) => setSourceConfig(e.target.value)}
                />
              </div>
            )}
            {sourceType === "google_news" && (
              <p className="text-sm text-muted-foreground">
                Google News otomatik olarak konu anahtar kelimelerini kullanarak arama yapar.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSourceOpen(false)}>Iptal</Button>
            <Button onClick={handleAddSource} disabled={sourceLoading}>
              {sourceLoading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rule Dialog */}
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Otomatik Paylasim Kurali</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Minimum Relevance Skoru (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={ruleMinScore}
                onChange={(e) => setRuleMinScore(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gunluk Maksimum Post</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={ruleMaxPosts}
                onChange={(e) => setRuleMaxPosts(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Manuel Onay Gerekli</Label>
              <Switch checked={ruleApproval} onCheckedChange={setRuleApproval} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleOpen(false)}>Iptal</Button>
            <Button onClick={handleAddRule} disabled={ruleLoading}>
              {ruleLoading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konuyu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{topic.name}&rdquo; konusunu ve tum bagli kaynak, icerik ve kurallari silmek istediginize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Iptal</AlertDialogCancel>
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
