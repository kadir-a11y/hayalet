"use client";

import { useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Key,
  StickyNote,
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
import type { EmailAccount } from "./types";

const emailProviderNames: Record<string, string> = {
  hotmail: "Hotmail / Outlook",
  gmail: "Gmail",
  yandex: "Yandex",
  protonmail: "ProtonMail",
  icloud: "iCloud",
  other: "Diğer",
};

export function AddEmailAccountDialog({
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
  const [provider, setProvider] = useState("hotmail");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setProvider("hotmail");
    setEmail("");
    setPassword("");
    setPhone("");
    setRecoveryEmail("");
    setNotes("");
    setShowPassword(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("E-posta adresi zorunludur.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/email-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          provider,
          email: email.trim(),
          password: password || undefined,
          phone: phone.trim() || undefined,
          recoveryEmail: recoveryEmail.trim() || undefined,
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
          <DialogTitle>E-posta Hesab\u0131 Ekle</DialogTitle>
          <DialogDescription>E-posta hesap bilgilerini girin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sa\u011Flay\u0131c\u0131</Label>
              <Select value={provider} onValueChange={setProvider} disabled={isSubmitting}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotmail">Hotmail / Outlook</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="yandex">Yandex</SelectItem>
                  <SelectItem value="protonmail">ProtonMail</SelectItem>
                  <SelectItem value="icloud">iCloud</SelectItem>
                  <SelectItem value="other">Di\u011Fer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">E-posta Adresi *</Label>
              <Input className="h-9 text-sm" type="email" placeholder="hesap@hotmail.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">\u015Eifre</Label>
              <div className="relative">
                <Input className="h-9 text-sm pr-8" type={showPassword ? "text" : "password"} placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Telefon</Label>
              <Input className="h-9 text-sm" placeholder="+90 5xx" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kurtarma E-postas\u0131</Label>
              <Input className="h-9 text-sm" type="email" placeholder="recovery@email.com" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} disabled={isSubmitting} />
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

export function EmailAccountCard({
  account,
  onDelete,
  onUpdated,
}: {
  account: EmailAccount;
  onDelete: () => void;
  onUpdated: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    provider: account.provider || "hotmail",
    email: account.email || "",
    password: account.password || "",
    phone: account.phone || "",
    recoveryEmail: account.recoveryEmail || "",
    notes: account.notes || "",
  });

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/email-accounts/${account.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete();
    } catch {
      setIsDeleting(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/email-accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: editData.provider,
          email: editData.email.trim(),
          password: editData.password || undefined,
          phone: editData.phone.trim() || undefined,
          recoveryEmail: editData.recoveryEmail.trim() || undefined,
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
        <p className="text-sm font-medium">E-posta Hesab\u0131 \u2014 D\u00FCzenle</p>
        <div className="grid gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Sa\u011Flay\u0131c\u0131</Label>
            <Select value={editData.provider} onValueChange={(v) => setEditData((d) => ({ ...d, provider: v }))}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotmail">Hotmail / Outlook</SelectItem>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="yandex">Yandex</SelectItem>
                <SelectItem value="protonmail">ProtonMail</SelectItem>
                <SelectItem value="icloud">iCloud</SelectItem>
                <SelectItem value="other">Di\u011Fer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">E-posta</Label>
              <Input className="h-8 text-sm" value={editData.email} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">\u015Eifre</Label>
              <Input className="h-8 text-sm" value={editData.password} onChange={(e) => setEditData((d) => ({ ...d, password: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input className="h-8 text-sm" value={editData.phone} onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kurtarma E-postas\u0131</Label>
              <Input className="h-8 text-sm" value={editData.recoveryEmail} onChange={(e) => setEditData((d) => ({ ...d, recoveryEmail: e.target.value }))} />
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
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{emailProviderNames[account.provider] || account.provider}</p>
            <p className="text-xs text-muted-foreground">{account.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
                  Bu e-posta hesap bilgileri kal\u0131c\u0131 olarak silinecektir.
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

      <div className="grid gap-2 text-sm">
        {account.password && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Key className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">\u015Eifre: </span>
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
        {account.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{account.phone}</span>
          </div>
        )}
        {account.recoveryEmail && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">Kurtarma: {account.recoveryEmail}</span>
          </div>
        )}
        {account.notes && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="text-xs">{account.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
