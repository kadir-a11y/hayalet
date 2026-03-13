"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Calendar,
  Tag,
  Megaphone,
  Eye,
} from "lucide-react";

// --- Types ---

interface Campaign {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: string | null;
  targetTagIds: string[];
  contentTemplate: string | null;
  platform: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  settings: { delayMin?: number; delayMax?: number; maxPerPersona?: number } | null;
  createdAt: string;
  updatedAt: string;
}

interface TagItem {
  id: string;
  name: string;
  color: string | null;
  personaCount: number;
}

// --- Constants ---

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  active: "bg-green-100 text-green-700 border-green-200",
  paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  active: "Aktif",
  paused: "Duraklatılmış",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const PLATFORMS = ["twitter", "instagram", "facebook", "linkedin", "tiktok", "reddit"] as const;

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPlatform, setCreatePlatform] = useState("");
  const [createTargetTagIds, setCreateTargetTagIds] = useState<string[]>([]);
  const [createContentTemplate, setCreateContentTemplate] = useState("");
  const [createScheduledStart, setCreateScheduledStart] = useState("");
  const [createScheduledEnd, setCreateScheduledEnd] = useState("");
  const [createDelayMin, setCreateDelayMin] = useState("1");
  const [createDelayMax, setCreateDelayMax] = useState("10");
  const [createMaxPerPersona, setCreateMaxPerPersona] = useState("1");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [editTargetTagIds, setEditTargetTagIds] = useState<string[]>([]);
  const [editContentTemplate, setEditContentTemplate] = useState("");
  const [editScheduledStart, setEditScheduledStart] = useState("");
  const [editScheduledEnd, setEditScheduledEnd] = useState("");
  const [editDelayMin, setEditDelayMin] = useState("1");
  const [editDelayMax, setEditDelayMax] = useState("10");
  const [editMaxPerPersona, setEditMaxPerPersona] = useState("1");
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCampaign, setDeleteCampaign] = useState<Campaign | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchTags();
  }, [fetchCampaigns, fetchTags]);

  function resetCreateForm() {
    setCreateName("");
    setCreateDescription("");
    setCreatePlatform("");
    setCreateTargetTagIds([]);
    setCreateContentTemplate("");
    setCreateScheduledStart("");
    setCreateScheduledEnd("");
    setCreateDelayMin("1");
    setCreateDelayMax("10");
    setCreateMaxPerPersona("1");
  }

  async function handleCreate() {
    if (!createName.trim() || !createPlatform || createTargetTagIds.length === 0 || !createContentTemplate.trim()) return;
    setCreateLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: createName.trim(),
        description: createDescription.trim() || undefined,
        platform: createPlatform,
        targetTagIds: createTargetTagIds,
        contentTemplate: createContentTemplate.trim(),
        settings: {
          delayMin: Number(createDelayMin) || 1,
          delayMax: Number(createDelayMax) || 10,
          maxPerPersona: Number(createMaxPerPersona) || 1,
        },
      };
      if (createScheduledStart) {
        body.scheduledStart = new Date(createScheduledStart).toISOString();
      }
      if (createScheduledEnd) {
        body.scheduledEnd = new Date(createScheduledEnd).toISOString();
      }
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        resetCreateForm();
        setCreateOpen(false);
        await fetchCampaigns();
      }
    } catch (error) {
      console.error("Failed to create campaign:", error);
    } finally {
      setCreateLoading(false);
    }
  }

  function openEdit(campaign: Campaign) {
    setEditCampaign(campaign);
    setEditName(campaign.name);
    setEditDescription(campaign.description || "");
    setEditPlatform(campaign.platform || "");
    setEditTargetTagIds(campaign.targetTagIds || []);
    setEditContentTemplate(campaign.contentTemplate || "");
    setEditScheduledStart(
      campaign.scheduledStart ? new Date(campaign.scheduledStart).toISOString().slice(0, 16) : ""
    );
    setEditScheduledEnd(
      campaign.scheduledEnd ? new Date(campaign.scheduledEnd).toISOString().slice(0, 16) : ""
    );
    setEditDelayMin(String(campaign.settings?.delayMin ?? 1));
    setEditDelayMax(String(campaign.settings?.delayMax ?? 10));
    setEditMaxPerPersona(String(campaign.settings?.maxPerPersona ?? 1));
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editCampaign || !editName.trim() || !editPlatform || editTargetTagIds.length === 0 || !editContentTemplate.trim()) return;
    setEditLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        platform: editPlatform,
        targetTagIds: editTargetTagIds,
        contentTemplate: editContentTemplate.trim(),
        settings: {
          delayMin: Number(editDelayMin) || 1,
          delayMax: Number(editDelayMax) || 10,
          maxPerPersona: Number(editMaxPerPersona) || 1,
        },
      };
      if (editScheduledStart) {
        body.scheduledStart = new Date(editScheduledStart).toISOString();
      }
      if (editScheduledEnd) {
        body.scheduledEnd = new Date(editScheduledEnd).toISOString();
      }
      const res = await fetch(`/api/campaigns/${editCampaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditOpen(false);
        setEditCampaign(null);
        await fetchCampaigns();
      }
    } catch (error) {
      console.error("Failed to update campaign:", error);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleStatusChange(campaign: Campaign, newStatus: string) {
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchCampaigns();
      }
    } catch (error) {
      console.error("Failed to update campaign status:", error);
    }
  }

  function openDeleteDialog(campaign: Campaign) {
    setDeleteCampaign(campaign);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteCampaign) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${deleteCampaign.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setDeleteCampaign(null);
        await fetchCampaigns();
      }
    } catch (error) {
      console.error("Failed to delete campaign:", error);
    } finally {
      setDeleteLoading(false);
    }
  }

  function toggleTagSelection(tagId: string, selected: string[], setter: (ids: string[]) => void) {
    if (selected.includes(tagId)) {
      setter(selected.filter((id) => id !== tagId));
    } else {
      setter([...selected, tagId]);
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

  function getTagNames(tagIds: string[]) {
    return tagIds
      .map((id) => tags.find((t) => t.id === id))
      .filter(Boolean);
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
          <h1 className="text-3xl font-bold tracking-tight">Kampanyalar</h1>
          <p className="text-muted-foreground">
            Kampanyalarınızı oluşturun, yönetin ve takip edin.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kampanya
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Kampanya Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Kampanya Adı</Label>
                <Input
                  placeholder="Kampanya adını girin..."
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Textarea
                  placeholder="Kampanya açıklaması..."
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  rows={2}
                />
              </div>
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
                <Label>Hedef Etiketler</Label>
                <div className="flex flex-wrap gap-2 rounded-md border p-3">
                  {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Henüz etiket oluşturulmamış.</p>
                  ) : (
                    tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTagSelection(tag.id, createTargetTagIds, setCreateTargetTagIds)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
                          createTargetTagIds.includes(tag.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: tag.color || "#6B7280" }}
                        />
                        {tag.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>İçerik Şablonu</Label>
                <Textarea
                  placeholder="İçerik şablonunu girin..."
                  value={createContentTemplate}
                  onChange={(e) => setCreateContentTemplate(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Başlangıç Tarihi</Label>
                  <Input
                    type="datetime-local"
                    value={createScheduledStart}
                    onChange={(e) => setCreateScheduledStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bitiş Tarihi</Label>
                  <Input
                    type="datetime-local"
                    value={createScheduledEnd}
                    onChange={(e) => setCreateScheduledEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ayarlar</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Min. Gecikme (dk)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={createDelayMin}
                      onChange={(e) => setCreateDelayMin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Max. Gecikme (dk)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={createDelayMax}
                      onChange={(e) => setCreateDelayMax(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Persona Başına Max</Label>
                    <Input
                      type="number"
                      min="1"
                      value={createMaxPerPersona}
                      onChange={(e) => setCreateMaxPerPersona(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
                İptal
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  createLoading ||
                  !createName.trim() ||
                  !createPlatform ||
                  createTargetTagIds.length === 0 ||
                  !createContentTemplate.trim()
                }
              >
                {createLoading ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Henüz kampanya yok</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              İlk kampanyanızı oluşturarak başlayın.
            </p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kampanya
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const matchedTags = getTagNames(campaign.targetTagIds || []);
            return (
              <Card key={campaign.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{campaign.name}</CardTitle>
                      {campaign.description && (
                        <CardDescription className="line-clamp-2">
                          {campaign.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`ml-2 shrink-0 ${CAMPAIGN_STATUS_COLORS[campaign.status || "draft"]}`}
                    >
                      {CAMPAIGN_STATUS_LABELS[campaign.status || "draft"] || campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {/* Platform */}
                  {campaign.platform && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Megaphone className="h-4 w-4 shrink-0" />
                      <span>{PLATFORM_LABELS[campaign.platform] || campaign.platform}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {matchedTags.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {matchedTags.map((tag) => (
                          <Badge key={tag!.id} variant="outline" className="text-xs">
                            <span
                              className="mr-1 inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: tag!.color || "#6B7280" }}
                            />
                            {tag!.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  {(campaign.scheduledStart || campaign.scheduledEnd) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {formatDate(campaign.scheduledStart)}
                        {campaign.scheduledEnd && ` - ${formatDate(campaign.scheduledEnd)}`}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex w-full items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Detay
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(campaign)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {campaign.status === "active" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStatusChange(campaign, "paused")}
                        title="Duraklat"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </Button>
                    ) : campaign.status === "paused" || campaign.status === "draft" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStatusChange(campaign, "active")}
                        title="Etkinleştir"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(campaign)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kampanyayı Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kampanya Adı</Label>
              <Input
                placeholder="Kampanya adını girin..."
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                placeholder="Kampanya açıklaması..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={editPlatform} onValueChange={setEditPlatform}>
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
              <Label>Hedef Etiketler</Label>
              <div className="flex flex-wrap gap-2 rounded-md border p-3">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Henüz etiket oluşturulmamış.</p>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTagSelection(tag.id, editTargetTagIds, setEditTargetTagIds)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
                        editTargetTagIds.includes(tag.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: tag.color || "#6B7280" }}
                      />
                      {tag.name}
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>İçerik Şablonu</Label>
              <Textarea
                placeholder="İçerik şablonunu girin..."
                value={editContentTemplate}
                onChange={(e) => setEditContentTemplate(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="datetime-local"
                  value={editScheduledStart}
                  onChange={(e) => setEditScheduledStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="datetime-local"
                  value={editScheduledEnd}
                  onChange={(e) => setEditScheduledEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ayarlar</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min. Gecikme (dk)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editDelayMin}
                    onChange={(e) => setEditDelayMin(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max. Gecikme (dk)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editDelayMax}
                    onChange={(e) => setEditDelayMax(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Persona Başına Max</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editMaxPerPersona}
                    onChange={(e) => setEditMaxPerPersona(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleEdit}
              disabled={
                editLoading ||
                !editName.trim() ||
                !editPlatform ||
                editTargetTagIds.length === 0 ||
                !editContentTemplate.trim()
              }
            >
              {editLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kampanyayı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteCampaign?.name}&rdquo; kampanyasını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
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
    </div>
  );
}
