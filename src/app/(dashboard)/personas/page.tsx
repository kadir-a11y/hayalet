"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Loader2,
  Users,
  Globe,
  MapPin,
  LayoutGrid,
  List,
  Upload,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countries, getCitiesByCountry } from "@/lib/data/countries";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface Persona {
  id: string;
  name: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  personalityTraits: string[];
  interests: string[];
  behavioralPatterns: Record<string, string>;
  gender: string | null;
  birthDate: string | null;
  language: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  activeHoursStart: number | null;
  activeHoursEnd: number | null;
  maxPostsPerDay: number | null;
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  tags: Tag[];
}

interface CreateFormData {
  name: string;
  displayName: string;
  bio: string;
  gender: string;
  birthDate: string;
  country: string;
  city: string;
  language: string;
  timezone: string;
  activeHoursStart: number;
  activeHoursEnd: number;
  maxPostsPerDay: number;
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

const languageLabels: Record<string, string> = {
  tr: "TR",
  en: "EN",
  de: "DE",
  fr: "FR",
  es: "ES",
  ar: "AR",
  ru: "RU",
  pt: "PT",
  ja: "JA",
  zh: "ZH",
  ko: "KO",
  it: "IT",
  nl: "NL",
  pl: "PL",
  sv: "SV",
  hi: "HI",
  bn: "BN",
  ur: "UR",
  fa: "FA",
  id: "ID",
  ms: "MS",
  th: "TH",
  vi: "VI",
  tl: "TL",
  el: "EL",
  cs: "CS",
  ro: "RO",
  hu: "HU",
  da: "DA",
  no: "NO",
  fi: "FI",
  uk: "UK",
  he: "HE",
  sw: "SW",
  az: "AZ",
  kk: "KK",
  uz: "UZ",
  ka: "KA",
  sr: "SR",
  hr: "HR",
  bg: "BG",
  sq: "SQ",
  ca: "CA",
  sk: "SK",
  lt: "LT",
  lv: "LV",
  et: "ET",
  sl: "SL",
  mk: "MK",
};

const languageNames: Record<string, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  ar: "العربية",
  ru: "Русский",
  pt: "Português",
  ja: "日本語",
  zh: "中文",
  ko: "한국어",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
  sv: "Svenska",
  hi: "हिन्दी",
  bn: "বাংলা",
  ur: "اردو",
  fa: "فارسی",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  th: "ไทย",
  vi: "Tiếng Việt",
  tl: "Filipino",
  el: "Ελληνικά",
  cs: "Čeština",
  ro: "Română",
  hu: "Magyar",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  uk: "Українська",
  he: "עברית",
  sw: "Kiswahili",
  az: "Azərbaycan",
  kk: "Қазақша",
  uz: "Oʻzbek",
  ka: "ქართული",
  sr: "Српски",
  hr: "Hrvatski",
  bg: "Български",
  sq: "Shqip",
  ca: "Català",
  sk: "Slovenčina",
  lt: "Lietuvių",
  lv: "Latviešu",
  et: "Eesti",
  sl: "Slovenščina",
  mk: "Македонски",
};

const defaultFormData: CreateFormData = {
  name: "",
  displayName: "",
  bio: "",
  gender: "",
  birthDate: "",
  country: "",
  city: "",
  language: "tr",
  timezone: "Europe/Istanbul",
  activeHoursStart: 9,
  activeHoursEnd: 23,
  maxPostsPerDay: 5,
};

// ---------------------------------------------------------------------------
// Compact Persona Row (Table View)
// ---------------------------------------------------------------------------

function PersonaRow({
  persona,
  onClick,
}: {
  persona: Persona;
  onClick: () => void;
}) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={onClick}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {persona.avatarUrl && (
              <AvatarImage src={persona.avatarUrl} alt={persona.name} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(persona.displayName || persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{persona.displayName || persona.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{persona.name}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs">
          {persona.gender === "erkek" ? "Erkek" : persona.gender === "kadın" ? "Kadın" : "-"}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">
          {persona.birthDate || "-"}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium">
            {languageLabels[persona.language || "tr"] || persona.language}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {(persona.country || persona.city) ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {[persona.city, persona.country].filter(Boolean).join(", ")}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant={persona.isActive ? "default" : "secondary"}
          className="text-xs"
        >
          {persona.isActive ? "Aktif" : "Pasif"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {persona.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs px-1.5 py-0"
              style={{
                borderColor: tag.color ?? undefined,
                color: tag.color ?? undefined,
              }}
            >
              {tag.name}
            </Badge>
          ))}
          {persona.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{persona.tags.length - 3}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Compact Card (Grid View)
// ---------------------------------------------------------------------------

function PersonaCard({
  persona,
  onClick,
}: {
  persona: Persona;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            {persona.avatarUrl && (
              <AvatarImage src={persona.avatarUrl} alt={persona.name} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(persona.displayName || persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">
                {persona.displayName || persona.name}
              </p>
              <Badge
                variant={persona.isActive ? "default" : "secondary"}
                className="shrink-0 text-xs"
              >
                {persona.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">@{persona.name}</p>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
              {persona.gender && (
                <span>{persona.gender === "erkek" ? "Erkek" : "Kadın"}</span>
              )}
              <span className="font-medium">
                {languageLabels[persona.language || "tr"] || persona.language}
              </span>
              {(persona.country || persona.city) && (
                <span className="flex items-center gap-0.5 truncate">
                  <MapPin className="h-3 w-3" />
                  {[persona.city, persona.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
            {persona.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {persona.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs px-1.5 py-0"
                    style={{
                      borderColor: tag.color ?? undefined,
                      color: tag.color ?? undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {persona.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{persona.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create Persona Dialog
// ---------------------------------------------------------------------------

function CreatePersonaDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [formData, setFormData] = useState<CreateFormData>({ ...defaultFormData });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setFormData({ ...defaultFormData });
    setError("");
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
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          displayName: formData.displayName.trim() || undefined,
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
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error?.fieldErrors
            ? Object.values(data.error.fieldErrors).flat().join(", ")
            : "Persona oluşturulamadı."
        );
      }

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Persona Oluştur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="create-name">
              Kullanıcı Adı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-name"
              placeholder="ornek_kullanıcı"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="create-displayName">Görünen Ad</Label>
            <Input
              id="create-displayName"
              placeholder="Ahmet Yılmaz"
              value={formData.displayName}
              onChange={(e) =>
                setFormData((f) => ({ ...f, displayName: e.target.value }))
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="create-bio">Biyografi</Label>
            <Textarea
              id="create-bio"
              placeholder="Kısa bir tanım..."
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* Gender & Birth Date */}
          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="kadın">Kadın</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-birthdate">Doğum Tarihi</Label>
              <Input
                id="create-birthdate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData((f) => ({ ...f, birthDate: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ülke</Label>
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
              <Label>Şehir</Label>
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

          {/* Language & Timezone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-language">Dil</Label>
              <Select
                value={formData.language}
                onValueChange={(v) => setFormData((f) => ({ ...f, language: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="create-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-timezone">Saat Dilimi</Label>
              <Select
                value={formData.timezone}
                onValueChange={(v) => setFormData((f) => ({ ...f, timezone: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="create-timezone">
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

          {/* Active Hours */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-activeStart">Aktif Başlangıç</Label>
              <Input
                id="create-activeStart"
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
              <Label htmlFor="create-activeEnd">Aktif Bitiş</Label>
              <Input
                id="create-activeEnd"
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
              <Label htmlFor="create-maxPosts">Maks. Gönderi</Label>
              <Input
                id="create-maxPosts"
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
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Bulk Create Dialog
// ---------------------------------------------------------------------------

interface BulkPersonaEntry {
  name: string;
  displayName: string;
  bio: string;
  country: string;
  city: string;
  language: string;
}

function BulkCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [entries, setEntries] = useState<BulkPersonaEntry[]>([
    { name: "", displayName: "", bio: "", country: "", city: "", language: "tr" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ success: number; total: number } | null>(null);

  function resetForm() {
    setEntries([{ name: "", displayName: "", bio: "", country: "", city: "", language: "tr" }]);
    setError("");
    setResult(null);
  }

  function addRow() {
    setEntries((prev) => [
      ...prev,
      { name: "", displayName: "", bio: "", country: "", city: "", language: "tr" },
    ]);
  }

  function removeRow(index: number) {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof BulkPersonaEntry, value: string) {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    const validEntries = entries.filter((e) => e.name.trim());
    if (validEntries.length === 0) {
      setError("En az bir persona ismi gerekli.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/personas/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personas: validEntries.map((e) => ({
            name: e.name.trim(),
            displayName: e.displayName.trim() || undefined,
            bio: e.bio.trim() || undefined,
            country: e.country.trim() || undefined,
            city: e.city.trim() || undefined,
            language: e.language,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Toplu oluşturma başarısız.");
      }

      const data = await res.json();
      setResult({ success: data.successCount, total: data.totalCount });

      if (data.successCount > 0) {
        onCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Toplu Persona Oluştur</DialogTitle>
          <DialogDescription>
            Birden fazla persona aynı anda oluşturabilirsiniz. Maks. 50 adet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Kullanıcı Adı *</TableHead>
                  <TableHead className="w-[160px]">Görünen Ad</TableHead>
                  <TableHead className="w-[200px]">Biyografi</TableHead>
                  <TableHead className="w-[120px]">Ülke</TableHead>
                  <TableHead className="w-[100px]">Şehir</TableHead>
                  <TableHead className="w-[80px]">Dil</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="p-1.5">
                      <Input
                        placeholder="kullanıcı_adı"
                        value={entry.name}
                        onChange={(e) => updateRow(index, "name", e.target.value)}
                        disabled={isSubmitting}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        placeholder="Görünen Ad"
                        value={entry.displayName}
                        onChange={(e) => updateRow(index, "displayName", e.target.value)}
                        disabled={isSubmitting}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        placeholder="Kısa bio..."
                        value={entry.bio}
                        onChange={(e) => updateRow(index, "bio", e.target.value)}
                        disabled={isSubmitting}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={entry.country}
                        onValueChange={(v) => {
                          updateRow(index, "country", v);
                          updateRow(index, "city", "");
                        }}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Ülke" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={entry.city}
                        onValueChange={(v) => updateRow(index, "city", v)}
                        disabled={isSubmitting || !entry.country}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Şehir" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCitiesByCountry(entry.country).map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={entry.language}
                        onValueChange={(v) => updateRow(index, "language", v)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(languageNames).map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              {code.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeRow(index)}
                        disabled={entries.length <= 1 || isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={entries.length >= 50 || isSubmitting}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Satır Ekle
          </Button>

          {result && (
            <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">
              {result.success}/{result.total} persona başarıyla oluşturuldu.
            </div>
          )}

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
              Kapat
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {entries.filter((e) => e.name.trim()).length} Persona Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PersonasPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const fetchPersonas = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/personas");
      if (!res.ok) throw new Error("Personas yüklenemedi.");
      const data = await res.json();
      setPersonas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  // Client-side filtering and sorting
  const filteredPersonas = personas
    .filter((p) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.displayName && p.displayName.toLowerCase().includes(q)) ||
          (p.country && p.country.toLowerCase().includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.language && p.language.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Gender filter
      if (filterGender !== "all" && p.gender !== filterGender) return false;
      // Status filter
      if (filterStatus === "active" && !p.isActive) return false;
      if (filterStatus === "inactive" && p.isActive) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.createdAt || "").localeCompare(a.createdAt || "");
        case "oldest":
          return (a.createdAt || "").localeCompare(b.createdAt || "");
        case "name_asc":
          return (a.displayName || a.name).localeCompare(b.displayName || b.name, "tr");
        case "name_desc":
          return (b.displayName || b.name).localeCompare(a.displayName || a.name, "tr");
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personas</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              Toplam {personas.length} persona
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Toplu Oluştur
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Persona
          </Button>
        </div>
      </div>

      <Separator />

      {/* Search + Filters + View Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Persona, ülke, şehir veya dil ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterGender} onValueChange={setFilterGender}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Cinsiyet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="erkek">Erkek</SelectItem>
            <SelectItem value="kadın">Kadın</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sıralama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">En Yeni</SelectItem>
            <SelectItem value="oldest">En Eski</SelectItem>
            <SelectItem value="name_asc">İsim (A-Z)</SelectItem>
            <SelectItem value="name_desc">İsim (Z-A)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex rounded-lg border">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setIsLoading(true);
                fetchPersonas();
              }}
            >
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && personas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Henüz persona yok</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              İlk personanızı oluşturarak başlayabilirsiniz.
            </p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Toplu Oluştur
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Persona
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No search results */}
      {!isLoading && !error && personas.length > 0 && filteredPersonas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Sonuç bulunamadı</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              &ldquo;{search}&rdquo; için eşleşen persona bulunamadı.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {!isLoading && !error && filteredPersonas.length > 0 && viewMode === "table" && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Persona</TableHead>
                <TableHead className="w-[70px]">Cinsiyet</TableHead>
                <TableHead className="w-[100px]">Doğum Tarihi</TableHead>
                <TableHead className="w-[60px]">Dil</TableHead>
                <TableHead className="w-[160px]">Konum</TableHead>
                <TableHead className="w-[80px]">Durum</TableHead>
                <TableHead className="w-[200px]">Etiketler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonas.map((persona) => (
                <PersonaRow
                  key={persona.id}
                  persona={persona}
                  onClick={() => router.push(`/personas/${persona.id}`)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && !error && filteredPersonas.length > 0 && viewMode === "grid" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onClick={() => router.push(`/personas/${persona.id}`)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreatePersonaDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={() => {
          setIsLoading(true);
          fetchPersonas();
        }}
      />
      <BulkCreateDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onCreated={() => {
          setIsLoading(true);
          fetchPersonas();
        }}
      />
    </div>
  );
}
