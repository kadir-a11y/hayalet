"use client";

import { useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  Globe,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Key,
  ExternalLink,
  BookOpen,
  StickyNote,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
import type { ForumAccount } from "./types";
import { formatShortDate } from "./utils";

export function AddForumAccountDialog({
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
  const [forumApiEndpoint, setForumApiEndpoint] = useState("");
  const [forumApiKey, setForumApiKey] = useState("");
  const [forumApiSecretKey, setForumApiSecretKey] = useState("");
  const [forumAccessToken, setForumAccessToken] = useState("");
  const [forumAccessTokenSecret, setForumAccessTokenSecret] = useState("");
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
    setForumApiEndpoint("");
    setForumApiKey("");
    setForumApiSecretKey("");
    setForumAccessToken("");
    setForumAccessTokenSecret("");
    setNotes("");
    setShowPassword(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!portalName.trim()) {
      setError("Portal adı zorunludur.");
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
          apiEndpoint: forumApiEndpoint.trim() || undefined,
          apiKey: forumApiKey.trim() || undefined,
          apiSecretKey: forumApiSecretKey.trim() || undefined,
          accessToken: forumAccessToken.trim() || undefined,
          accessTokenSecret: forumAccessTokenSecret.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Hesap eklenemedi.");

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
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Forum / Portal Hesab\u0131 Ekle</DialogTitle>
          <DialogDescription>Forum veya portal \u00FCyelik bilgilerini girin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Portal Ad\u0131 *</Label>
              <Input className="h-9 text-sm" placeholder="Technopat, r10.net" value={portalName} onChange={(e) => setPortalName(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Portal URL</Label>
              <Input className="h-9 text-sm" placeholder="https://forum.example.com" value={portalUrl} onChange={(e) => setPortalUrl(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kullan\u0131c\u0131 Ad\u0131</Label>
              <Input className="h-9 text-sm" placeholder="kullanıcıadı" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">\u015Eifre</Label>
              <div className="relative">
                <Input className="h-9 text-sm pr-8" type={showPassword ? "text" : "password"} placeholder="Hesap şifresi" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">E-posta</Label>
              <Input className="h-9 text-sm" type="email" placeholder="hesap@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Telefon</Label>
              <Input className="h-9 text-sm" placeholder="+90 5xx" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">API Bilgileri (opsiyonel)</p>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">API Endpoint</Label>
            <Input className="h-9 text-sm" placeholder="https://api.example.com" value={forumApiEndpoint} onChange={(e) => setForumApiEndpoint(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">API Key</Label>
              <Input className="h-9 text-sm" placeholder="API Key" value={forumApiKey} onChange={(e) => setForumApiKey(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">API Secret Key</Label>
              <Input className="h-9 text-sm" placeholder="API Secret Key" value={forumApiSecretKey} onChange={(e) => setForumApiSecretKey(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Token</Label>
              <Input className="h-9 text-sm" placeholder="Access Token" value={forumAccessToken} onChange={(e) => setForumAccessToken(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Token Secret</Label>
              <Input className="h-9 text-sm" placeholder="Access Token Secret" value={forumAccessTokenSecret} onChange={(e) => setForumAccessTokenSecret(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notlar</Label>
            <Textarea className="text-sm min-h-[60px]" placeholder="Ek notlar..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isSubmitting} />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              \u0130ptal
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

export function ForumAccountCard({
  account,
  onDelete,
  onUpdated,
}: {
  account: ForumAccount;
  onDelete: () => void;
  onUpdated: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    portalName: account.portalName || "",
    portalUrl: account.portalUrl || "",
    username: account.username || "",
    email: account.email || "",
    phone: account.phone || "",
    password: account.password || "",
    apiEndpoint: account.apiEndpoint || "",
    apiKey: account.apiKey || "",
    apiSecretKey: account.apiSecretKey || "",
    accessToken: account.accessToken || "",
    accessTokenSecret: account.accessTokenSecret || "",
    notes: account.notes || "",
  });

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

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/forum-accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portalName: editData.portalName.trim(),
          portalUrl: editData.portalUrl.trim() || undefined,
          username: editData.username.trim() || undefined,
          email: editData.email.trim() || undefined,
          phone: editData.phone.trim() || undefined,
          password: editData.password || undefined,
          apiEndpoint: editData.apiEndpoint.trim() || undefined,
          apiKey: editData.apiKey.trim() || undefined,
          apiSecretKey: editData.apiSecretKey.trim() || undefined,
          accessToken: editData.accessToken.trim() || undefined,
          accessTokenSecret: editData.accessTokenSecret.trim() || undefined,
          notes: editData.notes.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setIsEditing(false);
      onUpdated();
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <p className="text-sm font-medium">Forum / Portal \u2014 D\u00FCzenle</p>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Portal Ad\u0131</Label>
              <Input className="h-8 text-sm" value={editData.portalName} onChange={(e) => setEditData((d) => ({ ...d, portalName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Portal URL</Label>
              <Input className="h-8 text-sm" value={editData.portalUrl} onChange={(e) => setEditData((d) => ({ ...d, portalUrl: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Kullan\u0131c\u0131 Ad\u0131</Label>
              <Input className="h-8 text-sm" value={editData.username} onChange={(e) => setEditData((d) => ({ ...d, username: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">\u015Eifre</Label>
              <Input className="h-8 text-sm" value={editData.password} onChange={(e) => setEditData((d) => ({ ...d, password: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">E-posta</Label>
              <Input className="h-8 text-sm" value={editData.email} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input className="h-8 text-sm" value={editData.phone} onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))} />
            </div>
          </div>
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">API Bilgileri</p>
          <div className="space-y-1">
            <Label className="text-xs">API Endpoint</Label>
            <Input className="h-8 text-sm" value={editData.apiEndpoint} onChange={(e) => setEditData((d) => ({ ...d, apiEndpoint: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">API Key</Label>
              <Input className="h-8 text-sm" value={editData.apiKey} onChange={(e) => setEditData((d) => ({ ...d, apiKey: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">API Secret Key</Label>
              <Input className="h-8 text-sm" value={editData.apiSecretKey} onChange={(e) => setEditData((d) => ({ ...d, apiSecretKey: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Access Token</Label>
              <Input className="h-8 text-sm" value={editData.accessToken} onChange={(e) => setEditData((d) => ({ ...d, accessToken: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Access Token Secret</Label>
              <Input className="h-8 text-sm" value={editData.accessTokenSecret} onChange={(e) => setEditData((d) => ({ ...d, accessTokenSecret: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notlar</Label>
            <Input className="h-8 text-sm" value={editData.notes} onChange={(e) => setEditData((d) => ({ ...d, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>\u0130ptal</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
            Kaydet
          </Button>
        </div>
      </div>
    );
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hesab\u0131 silmek istedi\u011Finize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu forum/portal hesap bilgileri kal\u0131c\u0131 olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>\u0130ptal</AlertDialogCancel>
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

      {/* API Credentials */}
      {(account.apiKey || account.accessToken) && (
        <div className="grid gap-1.5 text-sm border-t pt-2">
          <p className="text-xs font-medium text-muted-foreground">API Bilgileri</p>
          {account.apiEndpoint && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-xs truncate">{account.apiEndpoint}</span>
            </div>
          )}
          {account.apiKey && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">API Key: </span>
              <span className="font-mono text-xs">{showPassword ? account.apiKey : "••••••••"}</span>
            </div>
          )}
          {account.apiSecretKey && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">API Secret: </span>
              <span className="font-mono text-xs">{showPassword ? account.apiSecretKey : "••••••••"}</span>
            </div>
          )}
          {account.accessToken && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Access Token: </span>
              <span className="font-mono text-xs">{showPassword ? account.accessToken : "••••••••"}</span>
            </div>
          )}
          {account.accessTokenSecret && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Token Secret: </span>
              <span className="font-mono text-xs">{showPassword ? account.accessTokenSecret : "••••••••"}</span>
            </div>
          )}
        </div>
      )}

      {account.lastUsedAt && (
        <p className="text-xs text-muted-foreground">
          Son kullan\u0131m: {formatShortDate(account.lastUsedAt)}
        </p>
      )}
    </div>
  );
}
