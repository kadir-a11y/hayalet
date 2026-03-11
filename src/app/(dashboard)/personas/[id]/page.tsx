"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  X,
  Loader2,
  User,
  Globe,
  Clock,
  MessageSquare,
  Hash,
  Smile,
  Pen,
  Settings2,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Key,
  ExternalLink,
  BookOpen,
  StickyNote,
  Shield,
  Image,
  Film,
  FileIcon,
  Upload,
  Download,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import { countries, getCitiesByCountry } from "@/lib/data/countries";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface SocialAccount {
  id: string;
  platform: string;
  platformUserId: string | null;
  platformUsername: string | null;
  platformEmail: string | null;
  platformPhone: string | null;
  platformPassword: string | null;
  isActive: boolean | null;
  lastUsedAt: string | null;
  createdAt: string | null;
}

interface ForumAccount {
  id: string;
  portalName: string;
  portalUrl: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  password: string | null;
  notes: string | null;
  isActive: boolean | null;
  lastUsedAt: string | null;
  createdAt: string | null;
}

interface ContentItem {
  id: string;
  platform: string;
  contentType: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  aiGenerated: boolean;
  createdAt: string | null;
}

interface BehavioralPatterns {
  writing_style?: string;
  tone?: string;
  emoji_usage?: string;
  hashtag_style?: string;
}

interface Persona {
  id: string;
  name: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  personalityTraits: string[];
  interests: string[];
  behavioralPatterns: BehavioralPatterns;
  country: string | null;
  city: string | null;
  language: string | null;
  timezone: string | null;
  activeHoursStart: number | null;
  activeHoursEnd: number | null;
  maxPostsPerDay: number | null;
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  tags: Tag[];
  socialAccounts: SocialAccount[];
  forumAccounts: ForumAccount[];
}

interface EditFormData {
  name: string;
  displayName: string;
  bio: string;
  country: string;
  city: string;
  language: string;
  timezone: string;
  activeHoursStart: number;
  activeHoursEnd: number;
  maxPostsPerDay: number;
  isActive: boolean;
  personalityTraits: string[];
  interests: string[];
  behavioralPatterns: BehavioralPatterns;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const languageNames: Record<string, string> = {
  tr: "Turkce", en: "English", de: "Deutsch", fr: "Francais",
  es: "Espanol", ar: "Arabic", ru: "Russian", pt: "Portugues",
  ja: "Japanese", zh: "Chinese", ko: "Korean", it: "Italiano",
  nl: "Nederlands", pl: "Polski", sv: "Svenska",
};

const usageLevelLabels: Record<string, string> = {
  none: "Hic",
  minimal: "Minimal",
  moderate: "Orta",
  heavy: "Yogun",
};

const statusLabels: Record<string, string> = {
  draft: "Taslak",
  scheduled: "Zamanlanmis",
  published: "Yayinlanmis",
  failed: "Basarisiz",
};

const statusColors: Record<string, string> = {
  draft: "secondary",
  scheduled: "outline",
  published: "default",
  failed: "destructive",
};

const platformNames: Record<string, string> = {
  twitter: "X (Twitter)",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  threads: "Threads",
  pinterest: "Pinterest",
};

function platformIcon(platform: string): string {
  const icons: Record<string, string> = {
    twitter: "X", instagram: "IG", facebook: "FB", linkedin: "LI",
    tiktok: "TT", youtube: "YT", threads: "TH", pinterest: "PI",
  };
  return icons[platform.toLowerCase()] || platform.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
// Edit Dialog
// ---------------------------------------------------------------------------

function EditPersonaDialog({
  open,
  onOpenChange,
  persona,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona;
  onUpdated: () => void;
}) {
  const [formData, setFormData] = useState<EditFormData>({
    name: persona.name,
    displayName: persona.displayName || "",
    bio: persona.bio || "",
    country: persona.country || "",
    city: persona.city || "",
    language: persona.language || "tr",
    timezone: persona.timezone || "Europe/Istanbul",
    activeHoursStart: persona.activeHoursStart ?? 9,
    activeHoursEnd: persona.activeHoursEnd ?? 23,
    maxPostsPerDay: persona.maxPostsPerDay ?? 5,
    isActive: persona.isActive ?? true,
    personalityTraits: persona.personalityTraits || [],
    interests: persona.interests || [],
    behavioralPatterns: persona.behavioralPatterns || {},
  });
  const [newTrait, setNewTrait] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      name: persona.name,
      displayName: persona.displayName || "",
      bio: persona.bio || "",
      country: persona.country || "",
      city: persona.city || "",
      language: persona.language || "tr",
      timezone: persona.timezone || "Europe/Istanbul",
      activeHoursStart: persona.activeHoursStart ?? 9,
      activeHoursEnd: persona.activeHoursEnd ?? 23,
      maxPostsPerDay: persona.maxPostsPerDay ?? 5,
      isActive: persona.isActive ?? true,
      personalityTraits: persona.personalityTraits || [],
      interests: persona.interests || [],
      behavioralPatterns: persona.behavioralPatterns || {},
    });
  }, [persona]);

  function addTrait() {
    const v = newTrait.trim();
    if (v && !formData.personalityTraits.includes(v)) {
      setFormData((f) => ({ ...f, personalityTraits: [...f.personalityTraits, v] }));
      setNewTrait("");
    }
  }

  function removeTrait(t: string) {
    setFormData((f) => ({
      ...f,
      personalityTraits: f.personalityTraits.filter((x) => x !== t),
    }));
  }

  function addInterest() {
    const v = newInterest.trim();
    if (v && !formData.interests.includes(v)) {
      setFormData((f) => ({ ...f, interests: [...f.interests, v] }));
      setNewInterest("");
    }
  }

  function removeInterest(i: string) {
    setFormData((f) => ({
      ...f,
      interests: f.interests.filter((x) => x !== i),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Persona ismi zorunludur.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/personas/${persona.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          displayName: formData.displayName.trim() || undefined,
          bio: formData.bio.trim() || undefined,
          country: formData.country.trim() || undefined,
          city: formData.city.trim() || undefined,
          language: formData.language,
          timezone: formData.timezone,
          activeHoursStart: formData.activeHoursStart,
          activeHoursEnd: formData.activeHoursEnd,
          maxPostsPerDay: formData.maxPostsPerDay,
          isActive: formData.isActive,
          personalityTraits: formData.personalityTraits,
          interests: formData.interests,
          behavioralPatterns: formData.behavioralPatterns,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error?.fieldErrors
            ? Object.values(data.error.fieldErrors).flat().join(", ")
            : "Guncelleme basarisiz."
        );
      }

      onOpenChange(false);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Personayi Duzenle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Kullanici Adi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-displayName">Gorunen Ad</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, displayName: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bio">Biyografi</Label>
            <Textarea
              id="edit-bio"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* Country & City */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Ulke</Label>
              <Select
                value={formData.country}
                onValueChange={(v) =>
                  setFormData((f) => ({ ...f, country: v, city: "" }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ulke secin" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sehir</Label>
              <Select
                value={formData.city}
                onValueChange={(v) =>
                  setFormData((f) => ({ ...f, city: v }))
                }
                disabled={isSubmitting || !formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sehir secin" />
                </SelectTrigger>
                <SelectContent>
                  {getCitiesByCountry(formData.country).map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <Switch
              id="edit-active"
              checked={formData.isActive}
              onCheckedChange={(v) => setFormData((f) => ({ ...f, isActive: v }))}
              disabled={isSubmitting}
            />
            <Label htmlFor="edit-active">
              {formData.isActive ? "Aktif" : "Pasif"}
            </Label>
          </div>

          <Separator />

          {/* Personality Traits */}
          <div className="space-y-2">
            <Label>Kisilik Ozellikleri</Label>
            <div className="flex flex-wrap gap-1.5">
              {formData.personalityTraits.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTrait(t)}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Yeni ozellik ekle..."
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTrait();
                  }
                }}
                disabled={isSubmitting}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTrait}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label>Ilgi Alanlari</Label>
            <div className="flex flex-wrap gap-1.5">
              {formData.interests.map((i) => (
                <Badge key={i} variant="outline" className="gap-1">
                  {i}
                  <button
                    type="button"
                    onClick={() => removeInterest(i)}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Yeni ilgi alani ekle..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
                disabled={isSubmitting}
              />
              <Button type="button" variant="outline" size="icon" onClick={addInterest}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Behavioral patterns */}
          <div className="space-y-3">
            <Label>Davranissal Kaliplar</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-writingStyle" className="text-xs text-muted-foreground">
                  Yazim Stili
                </Label>
                <Input
                  id="edit-writingStyle"
                  placeholder="ornegin: resmi, samimi..."
                  value={formData.behavioralPatterns.writing_style || ""}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      behavioralPatterns: { ...f.behavioralPatterns, writing_style: e.target.value },
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tone" className="text-xs text-muted-foreground">
                  Ton
                </Label>
                <Input
                  id="edit-tone"
                  placeholder="ornegin: ciddi, eglenceli..."
                  value={formData.behavioralPatterns.tone || ""}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      behavioralPatterns: { ...f.behavioralPatterns, tone: e.target.value },
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-emojiUsage" className="text-xs text-muted-foreground">
                  Emoji Kullanimi
                </Label>
                <Select
                  value={formData.behavioralPatterns.emoji_usage || "none"}
                  onValueChange={(v) =>
                    setFormData((f) => ({
                      ...f,
                      behavioralPatterns: { ...f.behavioralPatterns, emoji_usage: v },
                    }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="edit-emojiUsage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Hic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Orta</SelectItem>
                    <SelectItem value="heavy">Yogun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hashtagStyle" className="text-xs text-muted-foreground">
                  Hashtag Stili
                </Label>
                <Select
                  value={formData.behavioralPatterns.hashtag_style || "none"}
                  onValueChange={(v) =>
                    setFormData((f) => ({
                      ...f,
                      behavioralPatterns: { ...f.behavioralPatterns, hashtag_style: v },
                    }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="edit-hashtagStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Hic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Orta</SelectItem>
                    <SelectItem value="heavy">Yogun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-language">Dil</Label>
              <Select
                value={formData.language}
                onValueChange={(v) => setFormData((f) => ({ ...f, language: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-timezone">Saat Dilimi</Label>
              <Select
                value={formData.timezone}
                onValueChange={(v) => setFormData((f) => ({ ...f, timezone: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Istanbul">Europe/Istanbul</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="edit-activeStart">Aktif Baslangic</Label>
              <Input
                id="edit-activeStart"
                type="number"
                min={0}
                max={23}
                value={formData.activeHoursStart}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, activeHoursStart: parseInt(e.target.value) || 0 }))
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-activeEnd">Aktif Bitis</Label>
              <Input
                id="edit-activeEnd"
                type="number"
                min={0}
                max={23}
                value={formData.activeHoursEnd}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, activeHoursEnd: parseInt(e.target.value) || 0 }))
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxPosts">Maks. Gonderi</Label>
              <Input
                id="edit-maxPosts"
                type="number"
                min={1}
                max={100}
                value={formData.maxPostsPerDay}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, maxPostsPerDay: parseInt(e.target.value) || 1 }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Iptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Kaydet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Add Social Account Dialog
// ---------------------------------------------------------------------------

function AddSocialAccountDialog({
  open,
  onOpenChange,
  personaId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaId: string;
  onCreated: () => void;
}) {
  const [platform, setPlatform] = useState("twitter");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setPlatform("twitter");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setShowPassword(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/social-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          platform,
          platformUsername: username.trim() || undefined,
          platformEmail: email.trim() || undefined,
          platformPhone: phone.trim() || undefined,
          platformPassword: password || undefined,
        }),
      });

      if (!res.ok) throw new Error("Hesap eklenemedi.");

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sosyal Medya Hesabi Ekle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(platformNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-username">Kullanici Adi</Label>
            <Input
              id="social-username"
              placeholder="@kullaniciadi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-email">E-posta</Label>
            <Input
              id="social-email"
              type="email"
              placeholder="hesap@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-phone">Telefon</Label>
            <Input
              id="social-phone"
              placeholder="+90 5xx xxx xx xx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-password">Sifre</Label>
            <div className="relative">
              <Input
                id="social-password"
                type={showPassword ? "text" : "password"}
                placeholder="Hesap sifresi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Iptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Ekle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Tags management sub-component
// ---------------------------------------------------------------------------

function TagsManager({
  personaId,
  personaTags,
  onUpdated,
}: {
  personaId: string;
  personaTags: Tag[];
  onUpdated: () => void;
}) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    new Set(personaTags.map((t) => t.id))
  );

  useEffect(() => {
    setSelectedTagIds(new Set(personaTags.map((t) => t.id)));
  }, [personaTags]);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setAllTags(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }

  async function saveTags() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: Array.from(selectedTagIds) }),
      });
      if (!res.ok) throw new Error();
      onUpdated();
    } catch {
      console.error("Etiketler kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges =
    selectedTagIds.size !== personaTags.length ||
    personaTags.some((t) => !selectedTagIds.has(t.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          Henuz etiket olusturulmamis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Bu personaya atamak istediginiz etiketleri secin.
      </p>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTagIds.has(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer select-none transition-colors"
              style={
                isSelected
                  ? { backgroundColor: tag.color ?? undefined }
                  : { borderColor: tag.color ?? undefined, color: tag.color ?? undefined }
              }
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
      {hasChanges && (
        <Button onClick={saveTags} disabled={isSaving} size="sm">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Degisiklikleri Kaydet"
          )}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Posts Tab Content
// ---------------------------------------------------------------------------

function PostsTab({ personaId }: { personaId: string }) {
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/personas/${personaId}/content`)
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setIsLoading(false));
  }, [personaId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-semibold">Henuz gonderi yok</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Bu personaya henuz icerik olusturulmamis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded-lg border p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {platformIcon(post.platform)}
              </div>
              <span className="text-xs font-medium capitalize text-muted-foreground">
                {post.platform}
              </span>
              {post.aiGenerated && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  AI
                </Badge>
              )}
            </div>
            <Badge
              variant={statusColors[post.status] as any || "secondary"}
            >
              {statusLabels[post.status] || post.status}
            </Badge>
          </div>
          <p className="text-sm whitespace-pre-wrap line-clamp-4">{post.content}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatShortDate(post.createdAt)}</span>
            {post.scheduledAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatShortDate(post.scheduledAt)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Social Account Card with credentials
// ---------------------------------------------------------------------------

function SocialAccountCard({
  account,
  onDelete,
}: {
  account: SocialAccount;
  onDelete: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/social-accounts/${account.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onDelete();
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {platformIcon(account.platform)}
          </div>
          <div>
            <p className="text-sm font-medium">
              {platformNames[account.platform] || account.platform}
            </p>
            {account.platformUsername && (
              <p className="text-xs text-muted-foreground">
                @{account.platformUsername}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={account.isActive ? "default" : "secondary"}>
            {account.isActive ? "Aktif" : "Pasif"}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hesabi silmek istediginize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu sosyal medya hesap bilgileri kalici olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Iptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Credentials */}
      <div className="grid gap-2 text-sm">
        {account.platformEmail && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span>{account.platformEmail}</span>
          </div>
        )}
        {account.platformPhone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{account.platformPhone}</span>
          </div>
        )}
        {account.platformPassword && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Key className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-xs">
              {showPassword ? account.platformPassword : "••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>

      {account.lastUsedAt && (
        <p className="text-xs text-muted-foreground">
          Son kullanim: {formatShortDate(account.lastUsedAt)}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Forum Account Dialog
// ---------------------------------------------------------------------------

function AddForumAccountDialog({
  open,
  onOpenChange,
  personaId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaId: string;
  onCreated: () => void;
}) {
  const [portalName, setPortalName] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setPortalName("");
    setPortalUrl("");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setNotes("");
    setShowPassword(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!portalName.trim()) {
      setError("Portal adi zorunludur.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/forum-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          portalName: portalName.trim(),
          portalUrl: portalUrl.trim() || undefined,
          username: username.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          password: password || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Hesap eklenemedi.");

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forum / Portal Hesabi Ekle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forum-name">Portal Adi *</Label>
            <Input
              id="forum-name"
              placeholder="ornek: Technopat, r10.net, Eksi Sozluk"
              value={portalName}
              onChange={(e) => setPortalName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-url">Portal URL</Label>
            <Input
              id="forum-url"
              placeholder="https://forum.example.com"
              value={portalUrl}
              onChange={(e) => setPortalUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-username">Kullanici Adi</Label>
            <Input
              id="forum-username"
              placeholder="kullaniciadi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-email">E-posta</Label>
            <Input
              id="forum-email"
              type="email"
              placeholder="hesap@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-phone">Telefon</Label>
            <Input
              id="forum-phone"
              placeholder="+90 5xx xxx xx xx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-password">Sifre</Label>
            <div className="relative">
              <Input
                id="forum-password"
                type={showPassword ? "text" : "password"}
                placeholder="Hesap sifresi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-notes">Notlar</Label>
            <Textarea
              id="forum-notes"
              placeholder="Ek notlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Iptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Ekle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Forum Account Card with credentials
// ---------------------------------------------------------------------------

function ForumAccountCard({
  account,
  onDelete,
}: {
  account: ForumAccount;
  onDelete: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/forum-accounts/${account.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onDelete();
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{account.portalName}</p>
            {account.username && (
              <p className="text-xs text-muted-foreground">@{account.username}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {account.portalUrl && (
            <a
              href={account.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Badge variant={account.isActive ? "default" : "secondary"}>
            {account.isActive ? "Aktif" : "Pasif"}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hesabi silmek istediginize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu forum/portal hesap bilgileri kalici olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Iptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Credentials */}
      <div className="grid gap-2 text-sm">
        {account.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span>{account.email}</span>
          </div>
        )}
        {account.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{account.phone}</span>
          </div>
        )}
        {account.password && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Key className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-xs">
              {showPassword ? account.password : "••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
        {account.notes && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="text-xs">{account.notes}</span>
          </div>
        )}
      </div>

      {account.lastUsedAt && (
        <p className="text-xs text-muted-foreground">
          Son kullanim: {formatShortDate(account.lastUsedAt)}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Media Tab
// ---------------------------------------------------------------------------

interface MediaItem {
  id: string;
  type: string;
  filename: string;
  r2Key: string;
  url: string;
  contentType: string | null;
  size: number | null;
  createdAt: string | null;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function MediaTab({ personaId }: { personaId: string }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video" | "document">("all");

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch(`/api/media?personaId=${personaId}`);
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch {
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, [personaId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("personaId", personaId);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Yukleme basarisiz.");
        }
      }
      fetchMedia();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Yukleme basarisiz.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      // silently fail
    }
  }

  const filtered = filter === "all" ? media : media.filter((m) => m.type === filter);

  const counts = {
    all: media.length,
    image: media.filter((m) => m.type === "image").length,
    video: media.filter((m) => m.type === "video").length,
    document: media.filter((m) => m.type === "document").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload & Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1">
          {(["all", "image", "video", "document"] as const).map((t) => (
            <Button
              key={t}
              variant={filter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(t)}
              className="text-xs"
            >
              {t === "all" && "Tumu"}
              {t === "image" && "Gorseller"}
              {t === "video" && "Videolar"}
              {t === "document" && "Belgeler"}
              {counts[t] > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                  {counts[t]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        <div>
          <input
            type="file"
            id="media-upload"
            className="hidden"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <Button
            size="sm"
            onClick={() => document.getElementById("media-upload")?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            Yukle
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Image className="h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 text-sm font-semibold">
            {media.length === 0 ? "Henuz medya yok" : "Bu filtrede medya yok"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Gorsel, video veya belge yukleyin.
          </p>
          {media.length === 0 && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => document.getElementById("media-upload")?.click()}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Dosya Yukle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border overflow-hidden"
            >
              {/* Preview */}
              {item.type === "image" ? (
                <div className="aspect-video bg-muted">
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {item.type === "video" ? (
                    <Film className="h-10 w-10 text-muted-foreground" />
                  ) : (
                    <FileIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
              )}

              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="text-xs font-medium truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{formatShortDate(item.createdAt)}</span>
                </div>
              </div>

              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Dosyayi silmek istediginize emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{item.filename}&rdquo; kalici olarak silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Iptal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Roles Manager (for persona detail)
// ---------------------------------------------------------------------------

interface RoleItem {
  roleId: string;
  roleName: string;
  roleColor: string | null;
  roleDescription: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

interface AvailableRole {
  id: string;
  name: string;
  color: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

function RolesManager({
  personaId,
  onUpdated,
}: {
  personaId: string;
  onUpdated: () => void;
}) {
  const [assignedRoles, setAssignedRoles] = useState<RoleItem[]>([]);
  const [allRoles, setAllRoles] = useState<AvailableRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch(`/api/personas/${personaId}/roles`).then((r) => r.json()),
      fetch("/api/roles").then((r) => r.json()),
    ])
      .then(([assigned, all]) => {
        const assignedArr = Array.isArray(assigned) ? assigned : [];
        setAssignedRoles(assignedArr);
        setSelectedRoleIds(new Set(assignedArr.map((r: RoleItem) => r.roleId)));
        setAllRoles(Array.isArray(all) ? all : []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [personaId]);

  function toggleRole(roleId: string) {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  }

  async function saveRoles() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: Array.from(selectedRoleIds) }),
      });
      if (!res.ok) throw new Error();
      // Refresh assigned roles
      const updated = await fetch(`/api/personas/${personaId}/roles`).then((r) =>
        r.json()
      );
      setAssignedRoles(Array.isArray(updated) ? updated : []);
      onUpdated();
    } catch {
      console.error("Roller kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges =
    selectedRoleIds.size !== assignedRoles.length ||
    assignedRoles.some((r) => !selectedRoleIds.has(r.roleId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allRoles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-8 w-8 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-semibold">Henuz rol tanimlanmamis</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Oncelikle &ldquo;Roller&rdquo; sayfasindan rol ve kategori olusturun.
        </p>
      </div>
    );
  }

  // Group roles by category for display
  const grouped = new Map<string, { categoryName: string; categoryColor: string | null; roles: AvailableRole[] }>();
  const uncategorized: AvailableRole[] = [];

  for (const role of allRoles) {
    if (role.categoryId && role.categoryName) {
      const existing = grouped.get(role.categoryId);
      if (existing) {
        existing.roles.push(role);
      } else {
        grouped.set(role.categoryId, {
          categoryName: role.categoryName,
          categoryColor: role.categoryColor,
          roles: [role],
        });
      }
    } else {
      uncategorized.push(role);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Bu personaya atamak istediginiz rolleri secin. AI icerik uretiminde bu roller dikkate alinacaktir.
      </p>

      {Array.from(grouped.entries()).map(([catId, group]) => (
        <div key={catId} className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: group.categoryColor || "#6B7280" }}
            />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.categoryName}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.roles.map((role) => {
              const isSelected = selectedRoleIds.has(role.id);
              return (
                <Badge
                  key={role.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer select-none transition-colors"
                  style={
                    isSelected
                      ? { backgroundColor: role.color ?? undefined }
                      : { borderColor: role.color ?? undefined, color: role.color ?? undefined }
                  }
                  onClick={() => toggleRole(role.id)}
                >
                  {role.name}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      ))}

      {uncategorized.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Diger
          </span>
          <div className="flex flex-wrap gap-2">
            {uncategorized.map((role) => {
              const isSelected = selectedRoleIds.has(role.id);
              return (
                <Badge
                  key={role.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer select-none transition-colors"
                  style={
                    isSelected
                      ? { backgroundColor: role.color ?? undefined }
                      : { borderColor: role.color ?? undefined, color: role.color ?? undefined }
                  }
                  onClick={() => toggleRole(role.id)}
                >
                  {role.name}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {hasChanges && (
        <Button onClick={saveRoles} disabled={isSaving} size="sm">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Degisiklikleri Kaydet"
          )}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PersonaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addSocialOpen, setAddSocialOpen] = useState(false);
  const [addForumOpen, setAddForumOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPersona = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`/api/personas/${id}`);
      if (res.status === 404) {
        setError("Persona bulunamadi.");
        return;
      }
      if (!res.ok) throw new Error("Persona yuklenemedi.");
      const data = await res.json();
      setPersona(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
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
      if (!res.ok) throw new Error("Silme basarisiz.");
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
              {error || "Persona bulunamadi"}
            </h3>
            <Button variant="outline" className="mt-6" onClick={() => router.push("/personas")}>
              Personas Listesine Don
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
            Duzenle
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
                <AlertDialogTitle>Personayi silmek istediginize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu islem geri alinamaz. &ldquo;{persona.name}&rdquo; personasi ve iliskili
                  tum verileri kalici olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Iptal</AlertDialogCancel>
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
              {getInitials(persona.displayName || persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{persona.displayName || persona.name}</h2>
              <Badge variant={persona.isActive ? "default" : "secondary"}>
                {persona.isActive ? "Aktif" : "Pasif"}
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
          <TabsTrigger value="forumlar">Forum & Portallar</TabsTrigger>
          <TabsTrigger value="roller">Roller</TabsTrigger>
          <TabsTrigger value="medya">Medya</TabsTrigger>
          <TabsTrigger value="gonderiler">Gonderiler</TabsTrigger>
          <TabsTrigger value="etiketler">Etiketler</TabsTrigger>
          <TabsTrigger value="ayarlar">Ayarlar</TabsTrigger>
        </TabsList>

        {/* ---- Profil Tab ---- */}
        <TabsContent value="profil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Kisilik Ozellikleri
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
                <p className="text-sm text-muted-foreground">Henuz kisilik ozelligi eklenmemis.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Ilgi Alanlari
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
                <p className="text-sm text-muted-foreground">Henuz ilgi alani eklenmemis.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Pen className="h-4 w-4" />
                Davranissal Kaliplar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Yazim Stili</p>
                  <p className="text-sm">{patterns.writing_style || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Ton</p>
                  <p className="text-sm">{patterns.tone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Emoji Kullanimi</p>
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
                  Personaya bagli sosyal medya hesaplari ve kimlik bilgileri.
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
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Bagli sosyal hesap yok</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bu personaya henuz sosyal medya hesabi baglenmamis.
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

        {/* ---- Forum & Portallar Tab ---- */}
        <TabsContent value="forumlar">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Forum & Portal Uyelikleri</CardTitle>
                <CardDescription>
                  Personanin uye oldugu forum ve portallardaki hesap bilgileri.
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
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Bagli forum/portal hesabi yok</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bu personaya henuz forum veya portal hesabi eklenmemis.
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
                Personanin karakter ozelliklerini belirleyen roller. AI icerik uretiminde kullanilir.
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
                Medya Kutuphanesi
              </CardTitle>
              <CardDescription>
                Personanin gorsel, video ve belge dosyalari. Icerik paylasimlarinda kullanilir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaTab personaId={persona.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Gonderiler Tab ---- */}
        <TabsContent value="gonderiler">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Gonderiler
              </CardTitle>
              <CardDescription>
                Bu personanin tum icerikleri ve gonderileri.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostsTab personaId={persona.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Etiketler Tab ---- */}
        <TabsContent value="etiketler">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Etiketler</CardTitle>
              <CardDescription>Personaya atanan etiketleri yonetin.</CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4" />
                Ayarlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Dil</p>
                  <p className="text-sm">{languageNames[persona.language || "tr"] || persona.language}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Konum</p>
                  <p className="text-sm">
                    {[persona.city, persona.country].filter(Boolean).join(", ") || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Saat Dilimi</p>
                  <p className="text-sm">{persona.timezone || "Europe/Istanbul"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Aktif Saatler</p>
                  <p className="text-sm">
                    {persona.activeHoursStart ?? 9}:00 - {persona.activeHoursEnd ?? 23}:00
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Gunluk Maks. Gonderi</p>
                  <p className="text-sm">{persona.maxPostsPerDay ?? 5}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Durum</p>
                  <Badge variant={persona.isActive ? "default" : "secondary"}>
                    {persona.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Son Guncelleme</p>
                  <p className="text-sm">{formatDate(persona.updatedAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Olusturulma</p>
                  <p className="text-sm">{formatDate(persona.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
        </>
      )}
    </div>
  );
}
