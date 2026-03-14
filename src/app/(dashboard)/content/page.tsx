"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { Plus, FileText, Trash2, Twitter, Instagram, Facebook, Linkedin, Sparkles } from "lucide-react";
import AiContentContent from "@/components/content/ai-content";

// --- Types ---

interface ContentItemRow {
  contentItem: {
    id: string;
    personaId: string;
    campaignId: string | null;
    platform: string;
    contentType: string;
    content: string;
    mediaUrls: string[];
    status: string;
    scheduledAt: string | null;
    publishedAt: string | null;
    errorMessage: string | null;
    aiGenerated: boolean;
    aiPrompt: string | null;
    aiModel: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
  personaName: string;
  personaAvatar: string | null;
}

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
}

// --- Constants ---

const STATUS_TABS = [
  { label: "Tümü", value: "all" },
  { label: "Taslak", value: "draft" },
  { label: "Zamanlanmış", value: "scheduled" },
  { label: "Kuyrukta", value: "queued" },
  { label: "Yayında", value: "published" },
  { label: "Başarısız", value: "failed" },
] as const;

const STATUS_BADGE_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  queued: "bg-yellow-100 text-yellow-700 border-yellow-200",
  publishing: "bg-orange-100 text-orange-700 border-orange-200",
  published: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  scheduled: "Zamanlanmış",
  queued: "Kuyrukta",
  publishing: "Yayınlanıyor",
  published: "Yayında",
  failed: "Başarısız",
  cancelled: "İptal Edildi",
};

const PLATFORM_BADGE_COLORS: Record<string, string> = {
  twitter: "bg-blue-100 text-blue-700 border-blue-200",
  instagram: "bg-pink-100 text-pink-700 border-pink-200",
  facebook: "bg-blue-100 text-blue-800 border-blue-200",
  linkedin: "bg-blue-100 text-blue-600 border-blue-200",
  tiktok: "bg-gray-900 text-white border-gray-900",
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const PLATFORMS = ["twitter", "instagram", "facebook", "linkedin", "tiktok", "reddit"] as const;

const CONTENT_TYPES = [
  { value: "post", label: "Post" },
  { value: "reply", label: "Yanıt" },
  { value: "comment", label: "Yorum" },
  { value: "story", label: "Hikaye" },
  { value: "reel", label: "Reel" },
] as const;

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "twitter":
      return <Twitter className="h-3.5 w-3.5" />;
    case "instagram":
      return <Instagram className="h-3.5 w-3.5" />;
    case "facebook":
      return <Facebook className="h-3.5 w-3.5" />;
    case "linkedin":
      return <Linkedin className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

export default function ContentPage() {
  const [items, setItems] = useState<ContentItemRow[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createPersonaId, setCreatePersonaId] = useState("");
  const [createPlatform, setCreatePlatform] = useState("");
  const [createContentType, setCreateContentType] = useState("post");
  const [createContent, setCreateContent] = useState("");
  const [createScheduledAt, setCreateScheduledAt] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ContentItemRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (platformFilter !== "all") params.set("platform", platformFilter);

      const res = await fetch(`/api/content?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, platformFilter]);

  const fetchPersonas = useCallback(async () => {
    try {
      const res = await fetch("/api/personas");
      if (res.ok) {
        const data = await res.json();
        setPersonas(data);
      }
    } catch (error) {
      console.error("Failed to fetch personas:", error);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  async function handleCreate() {
    if (!createPersonaId || !createPlatform || !createContent.trim()) return;
    setCreateLoading(true);
    try {
      const body: Record<string, unknown> = {
        personaId: createPersonaId,
        platform: createPlatform,
        contentType: createContentType,
        content: createContent.trim(),
        status: createScheduledAt ? "scheduled" : "draft",
      };
      if (createScheduledAt) {
        body.scheduledAt = new Date(createScheduledAt).toISOString();
      }
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        resetCreateForm();
        setCreateOpen(false);
        await fetchContent();
      }
    } catch (error) {
      console.error("Failed to create content:", error);
    } finally {
      setCreateLoading(false);
    }
  }

  function resetCreateForm() {
    setCreatePersonaId("");
    setCreatePlatform("");
    setCreateContentType("post");
    setCreateContent("");
    setCreateScheduledAt("");
  }

  function openDelete(item: ContentItemRow) {
    setDeleteItem(item);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/content/${deleteItem.contentItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setDeleteItem(null);
        await fetchContent();
      }
    } catch (error) {
      console.error("Failed to delete content:", error);
    } finally {
      setDeleteLoading(false);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İçerik</h1>
          <p className="text-muted-foreground">
            İçerik kuyruğunuzu oluşturun, zamanlayın ve yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* page-level tabs will be added below */}
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <FileText className="h-4 w-4" />
            İçerik Listesi
          </TabsTrigger>
          <TabsTrigger value="ai-generate" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Üretici
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
        <div className="flex items-center justify-end">
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni İçerik
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni İçerik Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Persona</Label>
                <Select value={createPersonaId} onValueChange={setCreatePersonaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Persona seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {personas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={createPlatform} onValueChange={setCreatePlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Platform seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PLATFORM_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>İçerik Türü</Label>
                  <Select value={createContentType} onValueChange={setCreateContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((ct) => (
                        <SelectItem key={ct.value} value={ct.value}>
                          {ct.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>İçerik</Label>
                <Textarea
                  placeholder="İçerik metnini girin..."
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Zamanlama (opsiyonel)</Label>
                <Input
                  type="datetime-local"
                  value={createScheduledAt}
                  onChange={(e) => setCreateScheduledAt(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
                İptal
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createLoading || !createPersonaId || !createPlatform || !createContent.trim()}
              >
                {createLoading ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setLoading(true); }} className="flex-1">
          <div className="flex items-center justify-between">
            <TabsList>
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v); setLoading(true); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Platformlar</SelectItem>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* All tab contents share the same table */}
          {STATUS_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              <ContentTable
                items={items}
                formatDate={formatDate}
                onDelete={openDelete}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İçeriği Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu içeriği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>İptal</AlertDialogCancel>
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
        </TabsContent>

        <TabsContent value="ai-generate">
          <AiContentContent embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentTable({
  items,
  formatDate,
  onDelete,
}: {
  items: ContentItemRow[];
  formatDate: (d: string | null) => string;
  onDelete: (item: ContentItemRow) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">İçerik bulunamadı</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Bu filtrelemeye uygun içerik yok.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Persona</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead className="max-w-[300px]">İçerik</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow key={row.contentItem.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {row.personaAvatar && (
                      <AvatarImage src={row.personaAvatar} alt={row.personaName} />
                    )}
                    <AvatarFallback className="text-xs">
                      {row.personaName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{row.personaName}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={PLATFORM_BADGE_COLORS[row.contentItem.platform] || ""}
                >
                  <PlatformIcon platform={row.contentItem.platform} />
                  <span className="ml-1">{PLATFORM_LABELS[row.contentItem.platform] || row.contentItem.platform}</span>
                </Badge>
              </TableCell>
              <TableCell className="max-w-[300px]">
                <p className="truncate text-sm">
                  {row.contentItem.content.length > 100
                    ? row.contentItem.content.slice(0, 100) + "..."
                    : row.contentItem.content}
                </p>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={STATUS_BADGE_COLORS[row.contentItem.status] || ""}
                >
                  {STATUS_LABELS[row.contentItem.status] || row.contentItem.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.contentItem.publishedAt
                  ? formatDate(row.contentItem.publishedAt)
                  : row.contentItem.scheduledAt
                    ? formatDate(row.contentItem.scheduledAt)
                    : formatDate(row.contentItem.createdAt)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(row)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
