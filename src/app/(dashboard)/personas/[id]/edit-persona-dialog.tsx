"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { countries, getCitiesByCountry } from "@/lib/data/countries";
import type { Persona, EditFormData } from "./types";
import { languageNames } from "./utils";

export function EditPersonaDialog({
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
    bio: persona.bio || "",
    gender: persona.gender || "",
    birthDate: persona.birthDate || "",
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
      bio: persona.bio || "",
      gender: persona.gender || "",
      birthDate: persona.birthDate || "",
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
          bio: formData.bio.trim() || undefined,
          gender: formData.gender || undefined,
          birthDate: formData.birthDate || undefined,
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
            : "Güncelleme başarısız."
        );
      }

      onOpenChange(false);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Personay\u0131 D\u00FCzenle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Kullan\u0131c\u0131 Ad\u0131 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              disabled={isSubmitting}
            />
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

          {/* Gender & Birth Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cinsiyet</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData((f) => ({ ...f, gender: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="erkek">Erkek</SelectItem>
                  <SelectItem value="kadın">Kad\u0131n</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthdate">Do\u011Fum Tarihi</Label>
              <Input
                id="edit-birthdate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData((f) => ({ ...f, birthDate: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Country & City */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>\u00DClke</Label>
              <Select
                value={formData.country}
                onValueChange={(v) =>
                  setFormData((f) => ({ ...f, country: v, city: "" }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ülke seçin" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>\u015Eehir</Label>
              <Select
                value={formData.city}
                onValueChange={(v) =>
                  setFormData((f) => ({ ...f, city: v }))
                }
                disabled={isSubmitting || !formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Şehir seçin" />
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
            <Label>Ki\u015Filik \u00D6zellikleri</Label>
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
                placeholder="Yeni özellik ekle..."
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
            <Label>\u0130lgi Alanlar\u0131</Label>
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
                placeholder="Yeni ilgi alanı ekle..."
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
            <Label>Davran\u0131\u015Fsal Kal\u0131plar</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-writingStyle" className="text-xs text-muted-foreground">
                  Yaz\u0131m Stili
                </Label>
                <Input
                  id="edit-writingStyle"
                  placeholder="örneğin: resmi, samimi..."
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
                  placeholder="örneğin: ciddi, eğlenceli..."
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
                  Emoji Kullan\u0131m\u0131
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
                    <SelectItem value="none">Hi\u00E7</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Orta</SelectItem>
                    <SelectItem value="heavy">Yo\u011Fun</SelectItem>
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
                    <SelectItem value="none">Hi\u00E7</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Orta</SelectItem>
                    <SelectItem value="heavy">Yo\u011Fun</SelectItem>
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
              <Label htmlFor="edit-activeStart">Aktif Ba\u015Flang\u0131\u00E7</Label>
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
              <Label htmlFor="edit-activeEnd">Aktif Biti\u015F</Label>
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
              <Label htmlFor="edit-maxPosts">Maks. G\u00F6nderi</Label>
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
              \u0130ptal
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
