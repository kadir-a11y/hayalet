"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Trash2,
  Activity,
  Heart,
  Repeat2,
  MessageCircle,
  Share2,
  Bookmark,
  UserPlus,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface OrganicConfig {
  id: string;
  projectId: string;
  personaId: string | null;
  activityTypes: string[];
  platform: string;
  frequencyMin: number;
  frequencyMax: number;
  sentimentRange: string;
  isActive: boolean;
  createdAt: string;
  personaName: string | null;
  personaAvatar: string | null;
}

interface OrganicLog {
  id: string;
  activityType: string;
  platform: string;
  targetContent: string | null;
  generatedContent: string | null;
  status: string;
  executedAt: string | null;
  createdAt: string;
  personaName: string;
  personaAvatar: string | null;
}

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────

const ACTIVITY_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  like: { label: "Beğeni", icon: <Heart className="h-3.5 w-3.5" /> },
  retweet: { label: "Retweet", icon: <Repeat2 className="h-3.5 w-3.5" /> },
  positive_comment: { label: "Olumlu Yorum", icon: <MessageCircle className="h-3.5 w-3.5" /> },
  share: { label: "Paylaşım", icon: <Share2 className="h-3.5 w-3.5" /> },
  follow: { label: "Takip", icon: <UserPlus className="h-3.5 w-3.5" /> },
  bookmark: { label: "Kaydet", icon: <Bookmark className="h-3.5 w-3.5" /> },
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter/X",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ── Main Component ─────────────────────────────────────────────────────

export default function OrganicTab({ projectId }: { projectId: string }) {
  const [configs, setConfigs] = useState<OrganicConfig[]>([]);
  const [logs, setLogs] = useState<OrganicLog[]>([]);
  const [configsLoading, setConfigsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    personaId: "",
    platform: "twitter",
    activityTypes: ["like", "retweet", "positive_comment"] as string[],
    frequencyMin: 2,
    frequencyMax: 8,
    sentimentRange: "positive",
    isActive: false,
  });

  // ── Fetch Functions ────────────────────────────────────────────────

  const fetchConfigs = useCallback(async () => {
    setConfigsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/organic/config`);
      if (res.ok) setConfigs(await res.json());
    } catch (error) {
      console.error("Config fetch failed:", error);
    } finally {
      setConfigsLoading(false);
    }
  }, [projectId]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/organic/log?limit=30`);
      if (res.ok) setLogs(await res.json());
    } catch (error) {
      console.error("Logs fetch failed:", error);
    } finally {
      setLogsLoading(false);
    }
  }, [projectId]);

  const fetchPersonas = useCallback(async () => {
    try {
      const res = await fetch("/api/personas/filter?isActive=true");
      if (res.ok) setPersonas(await res.json());
    } catch (error) {
      console.error("Personas fetch failed:", error);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
    fetchLogs();
    fetchPersonas();
  }, [fetchConfigs, fetchLogs, fetchPersonas]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleCreate = async () => {
    setCreateLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/organic/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          personaId: formData.personaId || undefined,
        }),
      });
      if (res.ok) {
        setShowCreateDialog(false);
        fetchConfigs();
        setFormData({
          personaId: "",
          platform: "twitter",
          activityTypes: ["like", "retweet", "positive_comment"],
          frequencyMin: 2,
          frequencyMax: 8,
          sentimentRange: "positive",
          isActive: false,
        });
      }
    } catch (error) {
      console.error("Create failed:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleActive = async (configId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/organic/config/${configId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        setConfigs((prev) =>
          prev.map((c) => (c.id === configId ? { ...c, isActive } : c))
        );
      }
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  const handleDelete = async (configId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/organic/config/${configId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConfigs((prev) => prev.filter((c) => c.id !== configId));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const toggleActivityType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      activityTypes: prev.activityTypes.includes(type)
        ? prev.activityTypes.filter((t) => t !== type)
        : [...prev.activityTypes, type],
    }));
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Aktivite Konfigürasyonları</CardTitle>
              <Button size="sm" className="h-7" onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Yeni
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {configsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : configs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Henüz konfigürasyon yok.</p>
              </div>
            ) : (
              configs.map((config) => (
                <div key={config.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {config.personaName ? (
                        <>
                          <Avatar className="h-6 w-6">
                            {config.personaAvatar && (
                              <AvatarImage src={config.personaAvatar} />
                            )}
                            <AvatarFallback className="text-xs">
                              {getInitials(config.personaName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{config.personaName}</span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">
                          Tüm Personalar
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {PLATFORM_LABELS[config.platform]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.isActive}
                        onCheckedChange={(v) => handleToggleActive(config.id, v)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(config.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(config.activityTypes as string[]).map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs gap-1">
                        {ACTIVITY_TYPE_LABELS[type]?.icon}
                        {ACTIVITY_TYPE_LABELS[type]?.label || type}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sıklık: {config.frequencyMin}-{config.frequencyMax}/gün · Duygu: {config.sentimentRange}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Aktivite Geçmişi</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={fetchLogs}>
                Yenile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto space-y-2 pt-0">
            {logsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Henüz aktivite yok
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2 rounded border text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      {log.personaAvatar && <AvatarImage src={log.personaAvatar} />}
                      <AvatarFallback className="text-[10px]">
                        {getInitials(log.personaName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{log.personaName}</span>
                    <Badge variant="secondary" className="text-xs gap-1">
                      {ACTIVITY_TYPE_LABELS[log.activityType]?.icon}
                      {ACTIVITY_TYPE_LABELS[log.activityType]?.label || log.activityType}
                    </Badge>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {PLATFORM_LABELS[log.platform]}
                    </Badge>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[log.status] || ""}`}>
                      {log.status}
                    </span>
                  </div>
                  {log.generatedContent && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {log.generatedContent}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {log.executedAt
                      ? new Date(log.executedAt).toLocaleString("tr-TR")
                      : new Date(log.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Organik Aktivite Konfigürasyonu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Persona (opsiyonel)</Label>
              <Select value={formData.personaId} onValueChange={(v) => setFormData((f) => ({ ...f, personaId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Persona seçin (boş = tümü)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm Personalar</SelectItem>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={formData.platform} onValueChange={(v) => setFormData((f) => ({ ...f, platform: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Aktivite Tipleri</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ACTIVITY_TYPE_LABELS).map(([type, { label, icon }]) => (
                  <div
                    key={type}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      formData.activityTypes.includes(type)
                        ? "bg-primary/10 border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleActivityType(type)}
                  >
                    <Checkbox checked={formData.activityTypes.includes(type)} className="pointer-events-none" />
                    {icon}
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Sıklık/gün</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.frequencyMin}
                  onChange={(e) => setFormData((f) => ({ ...f, frequencyMin: parseInt(e.target.value) || 2 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Sıklık/gün</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.frequencyMax}
                  onChange={(e) => setFormData((f) => ({ ...f, frequencyMax: parseInt(e.target.value) || 8 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duygu Aralığı</Label>
              <Select value={formData.sentimentRange} onValueChange={(v) => setFormData((f) => ({ ...f, sentimentRange: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Pozitif</SelectItem>
                  <SelectItem value="neutral">Nötr</SelectItem>
                  <SelectItem value="mixed">Karışık</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData((f) => ({ ...f, isActive: v }))}
              />
              <Label>Hemen aktif et</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={createLoading}>
              İptal
            </Button>
            <Button onClick={handleCreate} disabled={createLoading || formData.activityTypes.length === 0}>
              {createLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
