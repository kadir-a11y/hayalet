"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Loader2,
  User,
  Globe,
  Clock,
  MessageSquare,
  Mail,
  Pen,
  MapPin,
  FileText,
  BookOpen,
  Shield,
  Image,
  Sparkles,
  Copy,
  Save,
  Star,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Persona } from "./types";
import {
  getInitials,
  languageNames,
  usageLevelLabels,
  platformNames,
} from "./utils";
import { EditPersonaDialog } from "./edit-persona-dialog";
import { AddSocialAccountDialog, SocialAccountCard } from "./social-accounts";
import { AddForumAccountDialog, ForumAccountCard } from "./forum-accounts";
import { AddEmailAccountDialog, EmailAccountCard } from "./email-accounts";
import { TagsManager } from "./tags-manager";
import { PostsTab } from "./posts-tab";
import { MediaTab } from "./media-tab";
import { RolesManager } from "./roles-manager";
import { SettingsTab } from "./settings-tab";

// ---------------------------------------------------------------------------
// Profile skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded bg-muted" />
        <div className="h-6 w-40 rounded bg-muted" />
      </div>
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/3 rounded bg-muted" />
            <div className="h-4 w-1/4 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </CardHeader>
      </Card>
      <div className="h-10 w-full rounded bg-muted" />
      <Card className="animate-pulse">
        <CardContent className="space-y-4 pt-6">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
          <div className="h-4 w-3/5 rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PersonaDetailPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addSocialOpen, setAddSocialOpen] = useState(false);
  const [addForumOpen, setAddForumOpen] = useState(false);
  const [addEmailOpen, setAddEmailOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Content Generation
  const [aiPlatform, setAiPlatform] = useState("twitter");
  const [aiContentType, setAiContentType] = useState("post");
  const [aiLanguage, setAiLanguage] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiCount, setAiCount] = useState("1");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<string[]>([]);

  async function handleAiGenerate() {
    if (!persona) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: persona.id,
          platform: aiPlatform,
          contentType: aiContentType,
          language: aiLanguage || undefined,
          topic: aiTopic || undefined,
          additionalInstructions: aiInstructions || undefined,
          count: parseInt(aiCount),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResults(data.results || []);
        toast({ title: "İçerik üretildi", description: `${(data.results || []).length} içerik başarıyla oluşturuldu.` });
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("AI generation failed:", err);
        toast({ title: "İçerik üretilemedi", description: err.details || err.error || "Bir hata oluştu. Lütfen tekrar deneyin.", variant: "destructive" });
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({ title: "Bağlantı hatası", description: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  }

  const fetchPersona = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`/api/personas/${id}`);
      if (res.status === 404) {
        setError("Persona bulunamadı.");
        return;
      }
      if (!res.ok) throw new Error("Persona yüklenemedi.");
      const data = await res.json();
      setPersona(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPersona();
  }, [fetchPersona]);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/personas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme başarısız.");
      router.push("/personas");
    } catch {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <ProfileSkeleton />;

  if (error || !persona) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/personas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {error || "Persona bulunamadı"}
            </h3>
            <Button variant="outline" className="mt-6" onClick={() => router.push("/personas")}>
              Personas Listesine Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const traits = Array.isArray(persona.personalityTraits) ? persona.personalityTraits : [];
  const interests = Array.isArray(persona.interests) ? persona.interests : [];
  const patterns =
    persona.behavioralPatterns && typeof persona.behavioralPatterns === "object"
      ? persona.behavioralPatterns
      : {};

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => router.push("/personas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Personayı silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. &ldquo;{persona.name}&rdquo; persanası ve ilişkili
                  tüm verileri kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Profile header card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            {persona.avatarUrl && (
              <AvatarImage src={persona.avatarUrl} alt={persona.name} />
            )}
            <AvatarFallback className="text-xl">
              {getInitials(persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{persona.name}</h2>
              <Badge variant={persona.isActive ? "default" : "secondary"}>
                {persona.isActive ? "Aktif" : "Pasif"}
              </Badge>
              <button
                className="p-1 rounded hover:bg-muted transition-colors"
                onClick={async () => {
                  const prev = persona.isFavorite;
                  setPersona({ ...persona, isFavorite: !prev });
                  try {
                    const res = await fetch(`/api/personas/${persona.id}/favorite`, { method: "PATCH" });
                    if (!res.ok) throw new Error();
                  } catch {
                    setPersona({ ...persona, isFavorite: prev });
                  }
                }}
              >
                <Star className={`h-5 w-5 ${persona.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/40 hover:text-yellow-400"}`} />
              </button>
              <Badge
                variant="outline"
                className={`text-xs ${
                  (persona.influenceScore ?? 0) >= 81 ? "border-purple-500 text-purple-600 bg-purple-50" :
                  (persona.influenceScore ?? 0) >= 51 ? "border-orange-500 text-orange-600 bg-orange-50" :
                  (persona.influenceScore ?? 0) >= 21 ? "border-blue-500 text-blue-600 bg-blue-50" :
                  "border-muted-foreground text-muted-foreground"
                }`}
              >
                {(persona.influenceScore ?? 0) >= 81 ? "Elit" :
                 (persona.influenceScore ?? 0) >= 51 ? "Yuksek" :
                 (persona.influenceScore ?? 0) >= 21 ? "Orta" : "Dusuk"}
                {" "}{persona.influenceScore ?? 0}
                </Badge>
            </div>
            <p className="text-muted-foreground">@{persona.name}</p>
            {persona.bio && (
              <p className="mt-1 text-sm text-muted-foreground">{persona.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {languageNames[persona.language || "tr"] || persona.language}
              </span>
              {persona.gender && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {persona.gender === "erkek" ? "Erkek" : "Kadın"}
                </span>
              )}
              {persona.birthDate && (
                <span className="flex items-center gap-1">
                  {persona.birthDate}
                </span>
              )}
              {(persona.country || persona.city) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[persona.city, persona.country].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {persona.activeHoursStart ?? 9}:00 - {persona.activeHoursEnd ?? 23}:00
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profil">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="sosyal">Sosyal Hesaplar</TabsTrigger>
          <TabsTrigger value="eposta">E-posta</TabsTrigger>
          <TabsTrigger value="forumlar">Forum & Portallar</TabsTrigger>
          <TabsTrigger value="roller">Roller</TabsTrigger>
          <TabsTrigger value="medya">Medya</TabsTrigger>
          <TabsTrigger value="gonderiler">Gönderiler</TabsTrigger>
          <TabsTrigger value="ai-icerik">AI İçerik</TabsTrigger>
          <TabsTrigger value="etiketler">Etiketler</TabsTrigger>
          <TabsTrigger value="ayarlar">Ayarlar</TabsTrigger>
        </TabsList>

        {/* ---- Profil Tab ---- */}
        <TabsContent value="profil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Kişilik Özellikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {traits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {traits.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Henüz kişilik özelliği eklenmemiş.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                İlgi Alanları
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => (
                    <Badge key={i} variant="outline">{i}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Henüz ilgi alanı eklenmemiş.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Pen className="h-4 w-4" />
                Davranışsal Kalıplar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Yazım Stili</p>
                  <p className="text-sm">{patterns.writing_style || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Ton</p>
                  <p className="text-sm">{patterns.tone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Emoji Kullanımı</p>
                  <p className="text-sm">
                    {patterns.emoji_usage
                      ? usageLevelLabels[patterns.emoji_usage] || patterns.emoji_usage
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Hashtag Stili</p>
                  <p className="text-sm">
                    {patterns.hashtag_style
                      ? usageLevelLabels[patterns.hashtag_style] || patterns.hashtag_style
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Sosyal Hesaplar Tab ---- */}
        <TabsContent value="sosyal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Sosyal Hesaplar</CardTitle>
                <CardDescription>
                  Personaya bağlı sosyal medya hesapları ve kimlik bilgileri.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddSocialOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Hesap Ekle
              </Button>
            </CardHeader>
            <CardContent>
              {persona.socialAccounts && persona.socialAccounts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {persona.socialAccounts.map((account) => (
                    <SocialAccountCard
                      key={account.id}
                      account={account}
                      onDelete={fetchPersona}
                      onUpdated={fetchPersona}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Bağlı sosyal hesap yok</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bu personaya henüz sosyal medya hesabı bağlanmamış.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => setAddSocialOpen(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Hesap Ekle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- E-posta Hesapları Tab ---- */}
        <TabsContent value="eposta">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">E-posta Hesapları</CardTitle>
                <CardDescription>
                  Personaya bağlı e-posta hesapları ve giriş bilgileri.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddEmailOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Hesap Ekle
              </Button>
            </CardHeader>
            <CardContent>
              {persona.emailAccounts && persona.emailAccounts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {persona.emailAccounts.map((account) => (
                    <EmailAccountCard
                      key={account.id}
                      account={account}
                      onDelete={fetchPersona}
                      onUpdated={fetchPersona}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Bağlı e-posta hesabı yok</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bu personaya henüz e-posta hesabı eklenmemiş.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => setAddEmailOpen(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Hesap Ekle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Forum & Portallar Tab ---- */}
        <TabsContent value="forumlar">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Forum & Portal Üyelikleri</CardTitle>
                <CardDescription>
                  Personanın üye olduğu forum ve portallardaki hesap bilgileri.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddForumOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Hesap Ekle
              </Button>
            </CardHeader>
            <CardContent>
              {persona.forumAccounts && persona.forumAccounts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {persona.forumAccounts.map((account) => (
                    <ForumAccountCard
                      key={account.id}
                      account={account}
                      onDelete={fetchPersona}
                      onUpdated={fetchPersona}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Bağlı forum/portal hesabı yok</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bu personaya henüz forum veya portal hesabı eklenmemiş.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => setAddForumOpen(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Hesap Ekle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Roller Tab ---- */}
        <TabsContent value="roller">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Roller
              </CardTitle>
              <CardDescription>
                Personanın karakter özelliklerini belirleyen roller. AI içerik üretiminde kullanılır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolesManager personaId={persona.id} onUpdated={fetchPersona} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Medya Tab ---- */}
        <TabsContent value="medya">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-4 w-4" />
                Medya Kütüphanesi
              </CardTitle>
              <CardDescription>
                Personanın görsel, video ve belge dosyaları. İçerik paylaşımlarında kullanılır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaTab personaId={persona.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Gönderiler Tab ---- */}
        <TabsContent value="gonderiler">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Gönderiler
              </CardTitle>
              <CardDescription>
                Bu personanın tüm içerikleri ve gönderleri.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostsTab personaId={persona.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- AI İçerik Tab ---- */}
        <TabsContent value="ai-icerik" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4" />
                AI İçerik Üretici
              </CardTitle>
              <CardDescription>
                Persona profiline uygun yapay zeka destekli içerik üretin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={aiPlatform} onValueChange={setAiPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="reddit">Reddit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>İçerik Türü</Label>
                  <Select value={aiContentType} onValueChange={setAiContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Gönderi</SelectItem>
                      <SelectItem value="reply">Yanıt</SelectItem>
                      <SelectItem value="comment">Yorum</SelectItem>
                      <SelectItem value="story">Hikaye</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dil</Label>
                  <Select value={aiLanguage} onValueChange={setAiLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Persona Dili" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">Persona Dili</SelectItem>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="nl">Nederlands</SelectItem>
                      <SelectItem value="pl">Polski</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Konu (Opsiyonel)</Label>
                <Input
                  placeholder="İçeriğin konusu veya teması..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ek Talimatlar (Opsiyonel)</Label>
                <Textarea
                  placeholder="İçerik üretimi için ek yönergeler..."
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label>Adet</Label>
                  <Select value={aiCount} onValueChange={setAiCount}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAiGenerate} disabled={aiLoading}>
                  {aiLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  İçerik Üret
                </Button>
              </div>
            </CardContent>
          </Card>

          {aiResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                Üretilen İçerikler ({aiResults.length})
              </h3>
              {aiResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <p className="whitespace-pre-wrap text-sm">{result}</p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(result);
                        }}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Kopyala
                      </Button>
                      <Button variant="outline" size="sm">
                        <Save className="mr-2 h-3.5 w-3.5" />
                        Kaydet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ---- Etiketler Tab ---- */}
        <TabsContent value="etiketler">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Etiketler</CardTitle>
              <CardDescription>Personaya atanan etiketleri yönetin.</CardDescription>
            </CardHeader>
            <CardContent>
              <TagsManager
                personaId={persona.id}
                personaTags={persona.tags}
                onUpdated={fetchPersona}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Ayarlar Tab ---- */}
        <TabsContent value="ayarlar">
          <SettingsTab persona={persona} onUpdated={fetchPersona} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {persona && (
        <>
          <EditPersonaDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            persona={persona}
            onUpdated={fetchPersona}
          />
          <AddSocialAccountDialog
            open={addSocialOpen}
            onOpenChange={setAddSocialOpen}
            personaId={persona.id}
            onCreated={fetchPersona}
          />
          <AddForumAccountDialog
            open={addForumOpen}
            onOpenChange={setAddForumOpen}
            personaId={persona.id}
            onCreated={fetchPersona}
          />
          <AddEmailAccountDialog
            open={addEmailOpen}
            onOpenChange={setAddEmailOpen}
            personaId={persona.id}
            onCreated={fetchPersona}
          />
        </>
      )}
    </div>
  );
}
