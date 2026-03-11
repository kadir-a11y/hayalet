"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, User, MoreVertical, Loader2, Users } from "lucide-react";
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
  DialogTrigger,
  DialogFooter,
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
  language: string | null;
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

const defaultFormData: CreateFormData = {
  name: "",
  displayName: "",
  bio: "",
  language: "tr",
  timezone: "Europe/Istanbul",
  activeHoursStart: 9,
  activeHoursEnd: 23,
  maxPostsPerDay: 5,
};

// ---------------------------------------------------------------------------
// Skeleton card for loading state
// ---------------------------------------------------------------------------

function PersonaCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-5 w-14 rounded-full bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Persona Card
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
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-12 w-12">
          {persona.avatarUrl && <AvatarImage src={persona.avatarUrl} alt={persona.name} />}
          <AvatarFallback>{getInitials(persona.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{persona.name}</CardTitle>
            <Badge variant={persona.isActive ? "default" : "secondary"}>
              {persona.isActive ? "Aktif" : "Pasif"}
            </Badge>
          </div>
          {persona.displayName && (
            <CardDescription>@{persona.displayName}</CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {persona.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {persona.bio}
          </p>
        )}
        {persona.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {persona.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{
                  borderColor: tag.color ?? undefined,
                  color: tag.color ?? undefined,
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
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
            : "Persona olusturulamadi."
        );
      }

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Persona Olustur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="create-name">
              Isim <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-name"
              placeholder="Persona ismi"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="create-displayName">Gorunen Ad</Label>
            <Input
              id="create-displayName"
              placeholder="@gorunenAd"
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
              placeholder="Kisa bir tanim..."
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
              disabled={isSubmitting}
            />
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
                  <SelectItem value="tr">Turkce</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Francais</SelectItem>
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
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-activeStart">Aktif Baslangic Saati</Label>
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
              <Label htmlFor="create-activeEnd">Aktif Bitis Saati</Label>
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
          </div>

          {/* Max Posts Per Day */}
          <div className="space-y-2">
            <Label htmlFor="create-maxPosts">Gunluk Maks. Gonderi</Label>
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
                  Olusturuluyor...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Olustur
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchPersonas = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/personas");
      if (!res.ok) throw new Error("Personas yuklenemedi.");
      const data = await res.json();
      setPersonas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  // Client-side search filtering
  const filteredPersonas = personas.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.displayName && p.displayName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personas</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              Toplam {personas.length} persona
            </p>
          )}
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Persona
        </Button>
      </div>

      <Separator />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Persona ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PersonaCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && personas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Henuz persona yok</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ilk personanizi olusturarak baslayabilirsiniz.
            </p>
            <Button className="mt-6" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Persona
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No search results */}
      {!isLoading && !error && personas.length > 0 && filteredPersonas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Sonuc bulunamadi</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              &ldquo;{search}&rdquo; icin eslesen persona bulunamadi.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Persona grid */}
      {!isLoading && !error && filteredPersonas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onClick={() => router.push(`/personas/${persona.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreatePersonaDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={() => {
          setIsLoading(true);
          fetchPersonas();
        }}
      />
    </div>
  );
}
