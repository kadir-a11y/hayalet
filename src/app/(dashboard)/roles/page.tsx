"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Loader2,
  Trash2,
  Edit,
  X,
  Shield,
  FolderOpen,
  ChevronDown,
  ChevronRight,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RoleCategory {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  createdAt: string | null;
}

// ---------------------------------------------------------------------------
// Color presets
// ---------------------------------------------------------------------------

const colorPresets = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
  "#6B7280", "#78716C",
];

// ---------------------------------------------------------------------------
// Category Dialog
// ---------------------------------------------------------------------------

function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: RoleCategory | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [color, setColor] = useState(category?.color || "#6B7280");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(category?.name || "");
    setDescription(category?.description || "");
    setColor(category?.color || "#6B7280");
    setError("");
  }, [category, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Kategori adi zorunludur.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const url = category
        ? `/api/role-categories/${category.id}`
        : "/api/role-categories";
      const res = await fetch(url, {
        method: category ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        }),
      });

      if (!res.ok) throw new Error("Kaydetme basarisiz.");

      onOpenChange(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Kategoriyi Duzenle" : "Yeni Kategori Olustur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori Adi *</Label>
            <Input
              placeholder="ornek: Siyasi, Spor, Teknoloji"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Aciklama</Label>
            <Textarea
              placeholder="Kategori aciklamasi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Renk</Label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-7 w-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "white" : "transparent",
                    boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {category ? "Kaydet" : "Olustur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Role Dialog
// ---------------------------------------------------------------------------

function RoleDialog({
  open,
  onOpenChange,
  role,
  categories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  categories: RoleCategory[];
  onSaved: () => void;
}) {
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [categoryId, setCategoryId] = useState(role?.categoryId || "");
  const [color, setColor] = useState(role?.color || "#6B7280");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(role?.name || "");
    setDescription(role?.description || "");
    setCategoryId(role?.categoryId || "");
    setColor(role?.color || "#6B7280");
    setError("");
  }, [role, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Rol adi zorunludur.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const url = role ? `/api/roles/${role.id}` : "/api/roles";
      const res = await fetch(url, {
        method: role ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId || null,
          color,
        }),
      });

      if (!res.ok) throw new Error("Kaydetme basarisiz.");

      onOpenChange(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {role ? "Rolu Duzenle" : "Yeni Rol Olustur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rol Adi *</Label>
            <Input
              placeholder="ornek: Futbolsever, Apolitik, Gamer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori secin (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kategorisiz</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color || "#6B7280" }}
                      />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Aciklama</Label>
            <Textarea
              placeholder="Bu rol ne anlama geliyor, AI iceriklerde nasil kullanilacak..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Renk</Label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-7 w-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "white" : "transparent",
                    boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {role ? "Kaydet" : "Olustur"}
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

export default function RolesPage() {
  const [categories, setCategories] = useState<RoleCategory[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RoleCategory | null>(null);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [catRes, rolesRes] = await Promise.all([
        fetch("/api/role-categories"),
        fetch("/api/roles"),
      ]);
      const cats = await catRes.json();
      const roles = await rolesRes.json();
      setCategories(Array.isArray(cats) ? cats : []);
      setAllRoles(Array.isArray(roles) ? roles : []);
      // Expand all categories by default
      setExpandedCategories(new Set(cats.map((c: RoleCategory) => c.id)));
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function toggleCategory(id: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function deleteCategory(id: string) {
    try {
      await fetch(`/api/role-categories/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      // silently fail
    }
  }

  async function deleteRole(id: string) {
    try {
      await fetch(`/api/roles/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      // silently fail
    }
  }

  // Group roles by category
  const rolesByCategory = new Map<string | null, Role[]>();
  for (const role of allRoles) {
    const key = role.categoryId || "__uncategorized__";
    const existing = rolesByCategory.get(key) || [];
    existing.push(role);
    rolesByCategory.set(key, existing);
  }

  const uncategorizedRoles = rolesByCategory.get("__uncategorized__") || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roller</h1>
          <p className="text-sm text-muted-foreground">
            Persona karakterlerini tanimlayin. AI icerik uretiminde bu roller dikkate alinir.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditingCategory(null);
              setCategoryDialogOpen(true);
            }}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Kategori Ekle
          </Button>
          <Button
            onClick={() => {
              setEditingRole(null);
              setRoleDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Rol Ekle
          </Button>
        </div>
      </div>

      {categories.length === 0 && allRoles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Henuz rol tanimlanmamis</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              Oncelikle kategoriler olusturun (Siyasi, Spor, Teknoloji vb.),
              sonra bu kategoriler altinda roller tanimlayin.
            </p>
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryDialogOpen(true);
                }}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Kategori Olustur
              </Button>
              <Button
                onClick={() => {
                  setEditingRole(null);
                  setRoleDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Rol Olustur
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Categories with their roles */}
          {categories.map((cat) => {
            const catRoles = rolesByCategory.get(cat.id) || [];
            const isExpanded = expandedCategories.has(cat.id);

            return (
              <Card key={cat.id}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <button
                      className="flex items-center gap-2 text-left"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color || "#6B7280" }}
                      />
                      <span className="font-semibold text-sm">{cat.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {catRoles.length}
                      </Badge>
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              &ldquo;{cat.name}&rdquo; kategorisini silmek istediginize emin misiniz?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Kategori silinir, altindaki roller kategorisiz olur.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Iptal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCategory(cat.id)}>
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {cat.description && isExpanded && (
                    <p className="text-xs text-muted-foreground ml-9">
                      {cat.description}
                    </p>
                  )}
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0 pb-3 px-4">
                    {catRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-2 ml-9">
                        {catRoles.map((role) => (
                          <div
                            key={role.id}
                            className="group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                          >
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: role.color || "#6B7280" }}
                            />
                            <span>{role.name}</span>
                            <button
                              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setEditingRole(role);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    &ldquo;{role.name}&rdquo; rolunu silmek istediginize emin misiniz?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bu rol tum personalardan kaldirilacaktir.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Iptal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteRole(role.id)}>
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground ml-9">
                        Bu kategoride henuz rol yok.
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}

          {/* Uncategorized roles */}
          {uncategorizedRoles.length > 0 && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Kategorisiz Roller
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-4">
                <div className="flex flex-wrap gap-2">
                  {uncategorizedRoles.map((role) => (
                    <div
                      key={role.id}
                      className="group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: role.color || "#6B7280" }}
                      />
                      <span>{role.name}</span>
                      <button
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setEditingRole(role);
                          setRoleDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              &ldquo;{role.name}&rdquo; rolunu silmek istediginize emin misiniz?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu rol tum personalardan kaldirilacaktir.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Iptal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRole(role.id)}>
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSaved={fetchData}
      />
      <RoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={editingRole}
        categories={categories}
        onSaved={fetchData}
      />
    </div>
  );
}
