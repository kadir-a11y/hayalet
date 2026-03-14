"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  KeyRound,
  Shield,
  ShieldOff,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function UsersContent({ embedded }: { embedded?: boolean }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createIsAdmin, setCreateIsAdmin] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Password dialog
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreate() {
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) return;
    setCreateLoading(true);
    setCreateError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          isAdmin: createIsAdmin,
        }),
      });
      if (res.ok) {
        setCreateOpen(false);
        resetCreateForm();
        await fetchUsers();
      } else {
        const data = await res.json();
        setCreateError(typeof data.error === "string" ? data.error : "Bir hata oluştu");
      }
    } catch {
      setCreateError("Bir hata oluştu");
    } finally {
      setCreateLoading(false);
    }
  }

  function resetCreateForm() {
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateIsAdmin(true);
    setCreateError("");
  }

  function openEdit(user: User) {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditIsAdmin(user.isAdmin);
    setEditError("");
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editUser || !editName.trim() || !editEmail.trim()) return;
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          isAdmin: editIsAdmin,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        setEditUser(null);
        await fetchUsers();
      } else {
        const data = await res.json();
        setEditError(typeof data.error === "string" ? data.error : "Bir hata oluştu");
      }
    } catch {
      setEditError("Bir hata oluştu");
    } finally {
      setEditLoading(false);
    }
  }

  function openPasswordChange(user: User) {
    setPasswordUser(user);
    setNewPassword("");
    setPasswordOpen(true);
  }

  async function handlePasswordChange() {
    if (!passwordUser || !newPassword.trim()) return;
    setPasswordLoading(true);
    try {
      const res = await fetch(`/api/users/${passwordUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setPasswordOpen(false);
        setPasswordUser(null);
      }
    } catch {
      // ignore
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteOpen(false);
        setDeleteUser(null);
        await fetchUsers();
      }
    } catch {
      // ignore
    } finally {
      setDeleteLoading(false);
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const Wrapper = embedded ? "div" : Card;
  const HeaderWrapper = embedded ? "div" : CardHeader;
  const ContentWrapper = embedded ? "div" : CardContent;

  return (
    <>
      <Wrapper>
        <HeaderWrapper className={embedded ? "mb-4" : undefined}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kullanıcılar</CardTitle>
              <CardDescription className="mt-1">
                Ekip üyelerini yönetin. {users.length} kullanıcı
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => { resetCreateForm(); setCreateOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Kullanıcı Ekle
            </Button>
          </div>
        </HeaderWrapper>
        <ContentWrapper className={embedded ? "space-y-3" : "space-y-3"}>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.name}</p>
                    {user.isAdmin && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(user)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openPasswordChange(user)}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Şifre Değiştir
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => { setDeleteUser(user); setDeleteOpen(true); }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </ContentWrapper>
      </Wrapper>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Örn: Ahmet Yılmaz" />
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} placeholder="ornek@hayalet.dev" />
            </div>
            <div className="space-y-2">
              <Label>Şifre</Label>
              <Input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="En az 6 karakter" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Admin Yetkisi</Label>
              <Switch checked={createIsAdmin} onCheckedChange={setCreateIsAdmin} />
            </div>
            {createError && (
              <p className="text-sm text-destructive">{createError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>İptal</Button>
            <Button onClick={handleCreate} disabled={createLoading || !createName.trim() || !createEmail.trim() || !createPassword.trim()}>
              {createLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Admin Yetkisi</Label>
              <Switch checked={editIsAdmin} onCheckedChange={setEditIsAdmin} />
            </div>
            {editError && (
              <p className="text-sm text-destructive">{editError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>İptal</Button>
            <Button onClick={handleEdit} disabled={editLoading || !editName.trim() || !editEmail.trim()}>
              {editLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={(open) => { setPasswordOpen(open); if (!open) setPasswordUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{passwordUser?.name} - Şifre Değiştir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Yeni Şifre</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="En az 6 karakter" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>İptal</Button>
            <Button onClick={handlePasswordChange} disabled={passwordLoading || newPassword.length < 6}>
              {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Şifreyi Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteUser?.name}</strong> kullanıcısını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
