"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Plus, Radar, Clock, Rss, Search, Eye, BarChart3 } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  keywords: string[];
  language: string;
  isActive: boolean;
  checkIntervalMinutes: number;
  lastCheckedAt: string | null;
  sourceCount: number;
  discoveredCount: number;
  createdAt: string;
}

export default function MonitoringPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createKeywords, setCreateKeywords] = useState("");
  const [createLanguage, setCreateLanguage] = useState("tr");
  const [createInterval, setCreateInterval] = useState("60");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch("/api/monitoring/topics");
      if (res.ok) {
        setTopics(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  async function handleCreate() {
    if (!createName.trim() || !createKeywords.trim()) return;
    setCreateLoading(true);
    try {
      const keywords = createKeywords.split(",").map((k) => k.trim()).filter(Boolean);
      const res = await fetch("/api/monitoring/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          keywords,
          language: createLanguage,
          checkIntervalMinutes: parseInt(createInterval),
        }),
      });
      if (res.ok) {
        setCreateName("");
        setCreateKeywords("");
        setCreateLanguage("tr");
        setCreateInterval("60");
        setCreateOpen(false);
        await fetchTopics();
      }
    } catch (error) {
      console.error("Failed to create topic:", error);
    } finally {
      setCreateLoading(false);
    }
  }

  function formatTimeAgo(dateStr: string | null) {
    if (!dateStr) return "Henuz kontrol edilmedi";
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Az once";
    if (minutes < 60) return `${minutes} dk once`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat once`;
    return `${Math.floor(hours / 24)} gun once`;
  }

  // Stats
  const totalTopics = topics.length;
  const activeTopics = topics.filter((t) => t.isActive).length;
  const totalDiscovered = topics.reduce((sum, t) => sum + t.discoveredCount, 0);
  const totalSources = topics.reduce((sum, t) => sum + t.sourceCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Yukleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Icerik Izleme</h1>
          <p className="text-muted-foreground">
            Konulari tanimlayin, kaynaklari ekleyin ve otomatik icerik kesfini baslatin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/monitoring/dashboard">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Konu
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Izleme Konusu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="topic-name">Konu Adi</Label>
                <Input
                  id="topic-name"
                  placeholder="orn: Espor Turkiye"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic-keywords">Anahtar Kelimeler (virgul ile ayirin)</Label>
                <Input
                  id="topic-keywords"
                  placeholder="orn: espor, e-spor, gaming, oyun"
                  value={createKeywords}
                  onChange={(e) => setCreateKeywords(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dil</Label>
                  <Select value={createLanguage} onValueChange={setCreateLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Turkce</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="fr">Francais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Kontrol Sikligi</Label>
                  <Select value={createInterval} onValueChange={setCreateInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 dakika</SelectItem>
                      <SelectItem value="30">30 dakika</SelectItem>
                      <SelectItem value="60">1 saat</SelectItem>
                      <SelectItem value="180">3 saat</SelectItem>
                      <SelectItem value="360">6 saat</SelectItem>
                      <SelectItem value="720">12 saat</SelectItem>
                      <SelectItem value="1440">24 saat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Iptal
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createLoading || !createName.trim() || !createKeywords.trim()}
              >
                {createLoading ? "Olusturuluyor..." : "Olustur"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Konu</CardTitle>
            <Radar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTopics}</div>
            <p className="text-xs text-muted-foreground">{activeTopics} aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kaynaklar</CardTitle>
            <Rss className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSources}</div>
            <p className="text-xs text-muted-foreground">tum konularda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulunan Icerik</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDiscovered}</div>
            <p className="text-xs text-muted-foreground">toplam kesif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Son Kontrol</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topics.length > 0
                ? formatTimeAgo(
                    topics
                      .filter((t) => t.lastCheckedAt)
                      .sort((a, b) =>
                        new Date(b.lastCheckedAt!).getTime() - new Date(a.lastCheckedAt!).getTime()
                      )[0]?.lastCheckedAt || null
                  )
                : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Grid */}
      {topics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radar className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Henuz izleme konusu yok</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Icerik izlemeye baslamak icin bir konu olusturun.
            </p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Konu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/monitoring/${topic.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{topic.name}</CardTitle>
                  <Badge variant={topic.isActive ? "default" : "secondary"}>
                    {topic.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {(topic.keywords as string[]).slice(0, 5).map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                  {(topic.keywords as string[]).length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{(topic.keywords as string[]).length - 5}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Rss className="h-3 w-3" />
                    <span>{topic.sourceCount} kaynak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{topic.discoveredCount} icerik</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{topic.checkIntervalMinutes} dk</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(topic.lastCheckedAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
