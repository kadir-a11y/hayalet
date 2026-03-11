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
  isActive: boolean | null;
  lastUsedAt: string | null;
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
}

interface EditFormData {
  name: string;
  displayName: string;
  bio: string;
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

const behavioralLabels: Record<string, string> = {
  writing_style: "Yazim Stili",
  tone: "Ton",
  emoji_usage: "Emoji Kullanimi",
  hashtag_style: "Hashtag Stili",
};

const usageLevelLabels: Record<string, string> = {
  none: "Hic",
  minimal: "Minimal",
  moderate: "Orta",
  heavy: "Yogun",
};

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

function platformIcon(platform: string): string {
  const icons: Record<string, string> = {
    twitter: "X",
    instagram: "IG",
    facebook: "FB",
    linkedin: "LI",
    tiktok: "TT",
    youtube: "YT",
  };
  return icons[platform.toLowerCase()] || platform.slice(0, 2).toUpperCase();
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

  // Re-sync form when persona changes
  useEffect(() => {
    setFormData({
      name: persona.name,
      displayName: persona.displayName || "",
      bio: persona.bio || "",
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
                Isim <span className="text-destructive">*</span>
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
                      behavioralPatterns: {
                        ...f.behavioralPatterns,
                        writing_style: e.target.value,
                      },
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
                      behavioralPatterns: {
                        ...f.behavioralPatterns,
                        tone: e.target.value,
                      },
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
                      behavioralPatterns: {
                        ...f.behavioralPatterns,
                        emoji_usage: v,
                      },
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
                      behavioralPatterns: {
                        ...f.behavioralPatterns,
                        hashtag_style: v,
                      },
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
                  <SelectItem value="tr">Turkce</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Francais</SelectItem>
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
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
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
                  setFormData((f) => ({
                    ...f,
                    activeHoursStart: parseInt(e.target.value) || 0,
                  }))
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
                  setFormData((f) => ({
                    ...f,
                    activeHoursEnd: parseInt(e.target.value) || 0,
                  }))
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
                  setFormData((f) => ({
                    ...f,
                    maxPostsPerDay: parseInt(e.target.value) || 1,
                  }))
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
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
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
          Henuz etiket olusturulmamis. Etiketler sayfasindan yeni etiket
          olusturabilirsiniz.
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
      console.error("Persona silinemedi.");
      setIsDeleting(false);
    }
  }

  // Loading
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Error
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
            <p className="mt-1 text-sm text-muted-foreground">
              Bu persona mevcut degil veya erisiminiz yok.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => router.push("/personas")}
            >
              Personas Listesine Don
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const traits = Array.isArray(persona.personalityTraits)
    ? persona.personalityTraits
    : [];
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
              {getInitials(persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{persona.name}</h2>
              <Badge variant={persona.isActive ? "default" : "secondary"}>
                {persona.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            {persona.displayName && (
              <p className="text-muted-foreground">@{persona.displayName}</p>
            )}
            {persona.bio && (
              <p className="mt-2 text-sm text-muted-foreground">{persona.bio}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Olusturulma: {formatDate(persona.createdAt)}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profil">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="etiketler">Etiketler</TabsTrigger>
          <TabsTrigger value="sosyal">Sosyal Hesaplar</TabsTrigger>
          <TabsTrigger value="ayarlar">Ayarlar</TabsTrigger>
        </TabsList>

        {/* ---- Profil Tab ---- */}
        <TabsContent value="profil" className="space-y-6">
          {/* Personality Traits */}
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
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Henuz kisilik ozelligi eklenmemis.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
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
                    <Badge key={i} variant="outline">
                      {i}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Henuz ilgi alani eklenmemis.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Behavioral Patterns */}
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
                  <p className="text-xs font-medium text-muted-foreground">
                    Emoji Kullanimi
                  </p>
                  <p className="text-sm">
                    {patterns.emoji_usage
                      ? usageLevelLabels[patterns.emoji_usage] || patterns.emoji_usage
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Hashtag Stili
                  </p>
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

        {/* ---- Etiketler Tab ---- */}
        <TabsContent value="etiketler">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Etiketler</CardTitle>
              <CardDescription>
                Personaya atanan etiketleri yonetin.
              </CardDescription>
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

        {/* ---- Sosyal Hesaplar Tab ---- */}
        <TabsContent value="sosyal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sosyal Hesaplar</CardTitle>
              <CardDescription>
                Personaya bagli sosyal medya hesaplari.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {persona.socialAccounts && persona.socialAccounts.length > 0 ? (
                <div className="space-y-3">
                  {persona.socialAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
                          {platformIcon(account.platform)}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {account.platform}
                          </p>
                          {account.platformUsername && (
                            <p className="text-xs text-muted-foreground">
                              @{account.platformUsername}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={account.isActive ? "default" : "secondary"}
                        >
                          {account.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                        {account.lastUsedAt && (
                          <span className="text-xs text-muted-foreground">
                            Son: {formatDate(account.lastUsedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">
                    Bagli sosyal hesap yok
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bu personaya henuz sosyal medya hesabi baglenmamis.
                  </p>
                </div>
              )}
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
                  <p className="text-sm">{persona.language || "tr"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Saat Dilimi
                  </p>
                  <p className="text-sm">{persona.timezone || "Europe/Istanbul"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Aktif Saatler
                  </p>
                  <p className="text-sm">
                    {persona.activeHoursStart ?? 9}:00 -{" "}
                    {persona.activeHoursEnd ?? 23}:00
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Gunluk Maks. Gonderi
                  </p>
                  <p className="text-sm">{persona.maxPostsPerDay ?? 5}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Durum</p>
                  <Badge variant={persona.isActive ? "default" : "secondary"}>
                    {persona.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Son Guncelleme
                  </p>
                  <p className="text-sm">{formatDate(persona.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      {persona && (
        <EditPersonaDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          persona={persona}
          onUpdated={fetchPersona}
        />
      )}
    </div>
  );
}
