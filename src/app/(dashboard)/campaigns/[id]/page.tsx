"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Megaphone,
  Calendar,
  Tag,
  FileText,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react";

// --- Types ---

interface CampaignDetail {
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
  contentStats: Array<{ status: string; count: number }>;
}

interface TagItem {
  id: string;
  name: string;
  color: string | null;
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
  paused: "Duraklatilmis",
  completed: "Tamamlandi",
  cancelled: "Iptal Edildi",
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const STAT_CARDS = [
  { status: "draft", label: "Taslak", icon: FileText, color: "text-gray-600" },
  { status: "scheduled", label: "Zamanlanmis", icon: Clock, color: "text-blue-600" },
  { status: "published", label: "Yayinda", icon: CheckCircle, color: "text-green-600" },
  { status: "failed", label: "Basarisiz", icon: AlertTriangle, color: "text-red-600" },
];

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: string; label: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data);
      } else if (res.status === 404) {
        router.push("/campaigns");
      }
    } catch (error) {
      console.error("Failed to fetch campaign:", error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

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
    fetchCampaign();
    fetchTags();
  }, [fetchCampaign, fetchTags]);

  async function handleExecute() {
    setExecuting(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/execute`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchCampaign();
      } else {
        console.error("Execute failed:", await res.text());
      }
    } catch (error) {
      console.error("Failed to execute campaign:", error);
    } finally {
      setExecuting(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setConfirmAction(null);
        await fetchCampaign();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(false);
    }
  }

  function getStatCount(status: string): number {
    if (!campaign?.contentStats) return 0;
    const stat = campaign.contentStats.find((s) => s.status === status);
    return stat?.count || 0;
  }

  function getTagNames(tagIds: string[]) {
    return tagIds
      .map((tid) => tags.find((t) => t.id === tid))
      .filter(Boolean) as TagItem[];
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
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

  if (!campaign) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Kampanya bulunamadi.</p>
      </div>
    );
  }

  const matchedTags = getTagNames(campaign.targetTagIds || []);
  const status = campaign.status || "draft";

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kampanyalara Dön
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
              <Badge
                variant="outline"
                className={CAMPAIGN_STATUS_COLORS[status]}
              >
                {CAMPAIGN_STATUS_LABELS[status] || status}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-muted-foreground max-w-2xl">{campaign.description}</p>
            )}
          </div>

          {/* Execute Action */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExecute}
              disabled={executing || status === "completed" || status === "cancelled"}
            >
              <Zap className="mr-2 h-4 w-4" />
              {executing ? "Çalıştırılıyor..." : "Çalıştır"}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Management Buttons */}
      <div className="flex flex-wrap gap-2">
        {status !== "active" && status !== "completed" && status !== "cancelled" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction({ action: "active", label: "Etkinleştir" })}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Etkinleştir
          </Button>
        )}
        {status === "active" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction({ action: "paused", label: "Duraklat" })}
          >
            <Pause className="mr-1.5 h-3.5 w-3.5" />
            Duraklat
          </Button>
        )}
        {status !== "completed" && status !== "cancelled" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction({ action: "completed", label: "Tamamla" })}
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Tamamla
          </Button>
        )}
        {status !== "cancelled" && status !== "completed" && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmAction({ action: "cancelled", label: "İptal Et" })}
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            İptal Et
          </Button>
        )}
      </div>

      <Separator />

      {/* Content Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">İçerik İstatistikleri</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {STAT_CARDS.map((stat) => (
            <Card key={stat.status}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getStatCount(stat.status)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Campaign Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kampanya Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform */}
            <div className="flex items-center gap-3">
              <Megaphone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Platform</p>
                <p className="text-sm text-muted-foreground">
                  {campaign.platform ? PLATFORM_LABELS[campaign.platform] || campaign.platform : "-"}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-start gap-3">
              <Tag className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Hedef Etiketler</p>
                {matchedTags.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {matchedTags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        <span
                          className="mr-1 inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: tag.color || "#6B7280" }}
                        />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Zamanlama</p>
                <p className="text-sm text-muted-foreground">
                  Başlangıç: {formatDate(campaign.scheduledStart)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Bitiş: {formatDate(campaign.scheduledEnd)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ayarlar ve Şablon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Min. Gecikme</p>
                <p className="text-sm text-muted-foreground">
                  {campaign.settings?.delayMin ?? 1} dk
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Max. Gecikme</p>
                <p className="text-sm text-muted-foreground">
                  {campaign.settings?.delayMax ?? 10} dk
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Persona Başına</p>
                <p className="text-sm text-muted-foreground">
                  {campaign.settings?.maxPerPersona ?? 1}
                </p>
              </div>
            </div>

            <Separator />

            {/* Content Template */}
            <div>
              <p className="text-sm font-medium mb-2">İçerik Şablonu</p>
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm whitespace-pre-wrap">
                  {campaign.contentTemplate || "-"}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Oluşturulma: {formatDate(campaign.createdAt)}</p>
              <p>Güncelleme: {formatDate(campaign.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Change Confirmation */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Durumu Değiştir</AlertDialogTitle>
            <AlertDialogDescription>
              Kampanyanın durumunu &ldquo;{confirmAction?.label}&rdquo; olarak değiştirmek
              istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && handleStatusChange(confirmAction.action)}
              disabled={actionLoading}
            >
              {actionLoading ? "İşleniyor..." : "Onayla"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
