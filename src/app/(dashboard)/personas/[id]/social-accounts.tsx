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
import type { SocialAccount } from "./types";
import { platformNames, platformIcon, formatShortDate } from "./utils";

export function AddSocialAccountDialog({
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
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecretKey, setApiSecretKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessTokenSecret, setAccessTokenSecret] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyType, setProxyType] = useState("");
  const [proxyCountry, setProxyCountry] = useState("");
  const [proxyRotation, setProxyRotation] = useState(false);
  const [userAgent, setUserAgent] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setPlatform("twitter");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setApiEndpoint("");
    setApiKey("");
    setApiSecretKey("");
    setAccessToken("");
    setAccessTokenSecret("");
    setProxyUrl("");
    setProxyType("");
    setProxyCountry("");
    setProxyRotation(false);
    setUserAgent("");
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
          apiEndpoint: apiEndpoint.trim() || undefined,
          apiKey: apiKey.trim() || undefined,
          apiSecretKey: apiSecretKey.trim() || undefined,
          accessToken: accessToken.trim() || undefined,
          accessTokenSecret: accessTokenSecret.trim() || undefined,
          proxyUrl: proxyUrl.trim() || undefined,
          proxyType: proxyType || undefined,
          proxyCountry: proxyCountry.trim() || undefined,
          proxyRotation: proxyRotation || undefined,
          userAgent: userAgent.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Hesap eklenemedi.");

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olu\u015Ftu.");
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
          <DialogTitle>Sosyal Medya Hesab\u0131 Ekle</DialogTitle>
          <DialogDescription>Platform hesap bilgilerini girin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Platform</Label>
              <Select value={platform} onValueChange={setPlatform} disabled={isSubmitting}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(platformNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kullan\u0131c\u0131 Ad\u0131</Label>
              <Input className="h-9 text-sm" placeholder="@kullan\u0131c\u0131ad\u0131" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">\u015Eifre</Label>
              <div className="relative">
                <Input className="h-9 text-sm pr-8" type={showPassword ? "text" : "password"} placeholder="Hesap \u015Fifresi" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
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
            <Input className="h-9 text-sm" placeholder="https://api.example.com" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">API Key</Label>
              <Input className="h-9 text-sm" placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">API Secret Key</Label>
              <Input className="h-9 text-sm" placeholder="API Secret Key" value={apiSecretKey} onChange={(e) => setApiSecretKey(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Token</Label>
              <Input className="h-9 text-sm" placeholder="Access Token" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Token Secret</Label>
              <Input className="h-9 text-sm" placeholder="Access Token Secret" value={accessTokenSecret} onChange={(e) => setAccessTokenSecret(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Proxy / Anti-Detection (opsiyonel)</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Proxy URL</Label>
              <Input className="h-9 text-sm" placeholder="http://user:pass@ip:port" value={proxyUrl} onChange={(e) => setProxyUrl(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Proxy Tipi</Label>
              <Select value={proxyType} onValueChange={setProxyType} disabled={isSubmitting}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Se\u00E7in..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="https">HTTPS</SelectItem>
                  <SelectItem value="socks4">SOCKS4</SelectItem>
                  <SelectItem value="socks5">SOCKS5</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Proxy \u00DClke</Label>
              <Input className="h-9 text-sm" placeholder="TR, US, DE..." value={proxyCountry} onChange={(e) => setProxyCountry(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">User Agent</Label>
              <Input className="h-9 text-sm" placeholder="Mozilla/5.0 ..." value={userAgent} onChange={(e) => setUserAgent(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="proxyRotation" checked={proxyRotation} onChange={(e) => setProxyRotation(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-input" />
              <Label htmlFor="proxyRotation" className="text-xs font-medium">Proxy Rotasyonu</Label>
            </div>
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

export function SocialAccountCard({
  account,
  onDelete,
  onUpdated,
}: {
  account: SocialAccount;
  onDelete: () => void;
  onUpdated: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    platform: account.platform,
    platformUsername: account.platformUsername || "",
    platformEmail: account.platformEmail || "",
    platformPhone: account.platformPhone || "",
    platformPassword: account.platformPassword || "",
    apiEndpoint: account.apiEndpoint || "",
    apiKey: account.apiKey || "",
    apiSecretKey: account.apiSecretKey || "",
    accessToken: account.accessToken || "",
    accessTokenSecret: account.accessTokenSecret || "",
    proxyUrl: account.proxyUrl || "",
    proxyType: account.proxyType || "",
    proxyCountry: account.proxyCountry || "",
    proxyRotation: account.proxyRotation || false,
    userAgent: account.userAgent || "",
  });

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

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/social-accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: editData.platform,
          platformUsername: editData.platformUsername || undefined,
          platformEmail: editData.platformEmail || undefined,
          platformPhone: editData.platformPhone || undefined,
          platformPassword: editData.platformPassword || undefined,
          apiEndpoint: editData.apiEndpoint || undefined,
          apiKey: editData.apiKey || undefined,
          apiSecretKey: editData.apiSecretKey || undefined,
          accessToken: editData.accessToken || undefined,
          accessTokenSecret: editData.accessTokenSecret || undefined,
          proxyUrl: editData.proxyUrl || undefined,
          proxyType: editData.proxyType || undefined,
          proxyCountry: editData.proxyCountry || undefined,
          proxyRotation: editData.proxyRotation || undefined,
          userAgent: editData.userAgent || undefined,
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
              {platformIcon(editData.platform)}
            </div>
            <p className="text-sm font-medium">D\u00FCzenle</p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Platform</Label>
            <Select value={editData.platform} onValueChange={(v) => setEditData((d) => ({ ...d, platform: v }))}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(platformNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Kullan\u0131c\u0131 Ad\u0131</Label>
              <Input className="h-8 text-sm" value={editData.platformUsername} onChange={(e) => setEditData((d) => ({ ...d, platformUsername: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">\u015Eifre</Label>
              <Input className="h-8 text-sm" value={editData.platformPassword} onChange={(e) => setEditData((d) => ({ ...d, platformPassword: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">E-posta</Label>
              <Input className="h-8 text-sm" value={editData.platformEmail} onChange={(e) => setEditData((d) => ({ ...d, platformEmail: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input className="h-8 text-sm" value={editData.platformPhone} onChange={(e) => setEditData((d) => ({ ...d, platformPhone: e.target.value }))} />
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
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">Proxy / Anti-Detection</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Proxy URL</Label>
              <Input className="h-8 text-sm" placeholder="http://user:pass@ip:port" value={editData.proxyUrl} onChange={(e) => setEditData((d) => ({ ...d, proxyUrl: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Proxy Tipi</Label>
              <Select value={editData.proxyType} onValueChange={(v) => setEditData((d) => ({ ...d, proxyType: v }))}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Se\u00E7in..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="https">HTTPS</SelectItem>
                  <SelectItem value="socks4">SOCKS4</SelectItem>
                  <SelectItem value="socks5">SOCKS5</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Proxy \u00DClke</Label>
              <Input className="h-8 text-sm" placeholder="TR, US..." value={editData.proxyCountry} onChange={(e) => setEditData((d) => ({ ...d, proxyCountry: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">User Agent</Label>
              <Input className="h-8 text-sm" value={editData.userAgent} onChange={(e) => setEditData((d) => ({ ...d, userAgent: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" checked={editData.proxyRotation} onChange={(e) => setEditData((d) => ({ ...d, proxyRotation: e.target.checked }))} className="h-4 w-4 rounded border-input" />
              <Label className="text-xs">Proxy Rotasyonu</Label>
            </div>
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
                  Bu sosyal medya hesap bilgileri kal\u0131c\u0131 olarak silinecektir.
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
            <span className="text-xs">\u015Eifre: </span>
            <span className="font-mono text-xs">
              {showPassword ? account.platformPassword : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
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
              <span className="font-mono text-xs">{showPassword ? account.apiKey : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
            </div>
          )}
          {account.apiSecretKey && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">API Secret: </span>
              <span className="font-mono text-xs">{showPassword ? account.apiSecretKey : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
            </div>
          )}
          {account.accessToken && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Access Token: </span>
              <span className="font-mono text-xs">{showPassword ? account.accessToken : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
            </div>
          )}
          {account.accessTokenSecret && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Token Secret: </span>
              <span className="font-mono text-xs">{showPassword ? account.accessTokenSecret : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
            </div>
          )}
        </div>
      )}

      {/* Proxy Info */}
      {(account.proxyUrl || account.userAgent) && (
        <div className="grid gap-1.5 text-sm border-t pt-2">
          <p className="text-xs font-medium text-muted-foreground">Proxy / Anti-Detection</p>
          {account.proxyUrl && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-xs truncate">{showPassword ? account.proxyUrl : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
              {account.proxyType && <Badge variant="outline" className="text-[10px] h-4">{account.proxyType.toUpperCase()}</Badge>}
              {account.proxyCountry && <Badge variant="outline" className="text-[10px] h-4">{account.proxyCountry}</Badge>}
              {account.proxyRotation && <Badge variant="outline" className="text-[10px] h-4 bg-green-50">Rotasyon</Badge>}
            </div>
          )}
          {account.userAgent && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-xs truncate">{account.userAgent.substring(0, 60)}...</span>
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
