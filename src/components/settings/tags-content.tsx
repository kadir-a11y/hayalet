"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Tag, Users } from "lucide-react";

const PREDEFINED_COLORS = [
  { value: "#EF4444", label: "Kırmızı" },
  { value: "#F97316", label: "Turuncu" },
  { value: "#EAB308", label: "Sarı" },
  { value: "#22C55E", label: "Yeşil" },
  { value: "#3B82F6", label: "Mavi" },
  { value: "#8B5CF6", label: "Mor" },
  { value: "#EC4899", label: "Pembe" },
  { value: "#6B7280", label: "Gri" },
];

interface TagWithCount {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
  personaCount: number;
}

export default function TagsContent({ embedded = false }: { embedded?: boolean }) {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createColor, setCreateColor] = useState("#6B7280");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editTag, setEditTag] = useState<TagWithCount | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#6B7280");
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTag, setDeleteTag] = useState<TagWithCount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  async function handleCreate() {
    if (!createName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim(), color: createColor }),
      });
      if (res.ok) {
        setCreateName("");
        setCreateColor("#6B7280");
        setCreateOpen(false);
        await fetchTags();
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setCreateLoading(false);
    }
  }

  function openEdit(tag: TagWithCount) {
    setEditTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color || "#6B7280");
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editTag || !editName.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/tags/${editTag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });
      if (res.ok) {
        setEditOpen(false);
        setEditTag(null);
        await fetchTags();
      }
    } catch (error) {
      console.error("Failed to update tag:", error);
    } finally {
      setEditLoading(false);
    }
  }

  function openDelete(tag: TagWithCount) {
    setDeleteTag(tag);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteTag) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/tags/${deleteTag.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setDeleteTag(null);
        await fetchTags();
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
    } finally {
      setDeleteLoading(false);
    }
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
      <div className={`flex items-center ${embedded ? "justify-end" : "justify-between"}`}>
        {!embedded && (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Etiketler</h1>
            <p className="text-muted-foreground">
              Personalarınızı organize etmek için etiketler oluşturun ve yönetin.
            </p>
          </div>
        )}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Etiket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Etiket Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Etiket Adı</Label>
                <Input
                  id="create-name"
                  placeholder="Etiket adını girin..."
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Renk</Label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        createColor === color.value
                          ? "border-foreground scale-110"
                          : "border-transparent hover:border-muted-foreground/50"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setCreateColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                İptal
              </Button>
              <Button onClick={handleCreate} disabled={createLoading || !createName.trim()}>
                {createLoading ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Henüz etiket yok</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Personalarınızı gruplandırmak için ilk etiketinizi oluşturun.
            </p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Etiket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="group relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color || "#6B7280" }}
                    />
                    <CardTitle className="text-base">{tag.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(tag)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => openDelete(tag)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {tag.personaCount} persona
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Etiketi Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Etiket Adı</Label>
              <Input
                id="edit-name"
                placeholder="Etiket adını girin..."
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdit();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Renk</Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      editColor === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent hover:border-muted-foreground/50"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEditColor(color.value)}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEdit} disabled={editLoading || !editName.trim()}>
              {editLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Etiketi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTag?.name}&rdquo; etiketini silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz ve bu etikete bağlı tüm persona ilişkileri kaldırılır.
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
