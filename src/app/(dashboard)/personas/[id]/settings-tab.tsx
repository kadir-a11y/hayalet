"use client";

import { useEffect, useState } from "react";
import { Edit, Loader2, Settings2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { countries, getCitiesByCountry } from "@/lib/data/countries";
import type { Persona } from "./types";
import { languageNames, formatDate } from "./utils";

export function SettingsTab({ persona, onUpdated }: { persona: Persona; onUpdated: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState({
    language: persona.language || "tr",
    gender: persona.gender || "",
    birthDate: persona.birthDate || "",
    country: persona.country || "",
    city: persona.city || "",
    timezone: persona.timezone || "Europe/Istanbul",
    activeHoursStart: persona.activeHoursStart ?? 9,
    activeHoursEnd: persona.activeHoursEnd ?? 23,
    maxPostsPerDay: persona.maxPostsPerDay ?? 5,
    isActive: persona.isActive ?? true,
    isVerified: persona.isVerified ?? false,
  });

  useEffect(() => {
    setData({
      language: persona.language || "tr",
      gender: persona.gender || "",
      birthDate: persona.birthDate || "",
      country: persona.country || "",
      city: persona.city || "",
      timezone: persona.timezone || "Europe/Istanbul",
      activeHoursStart: persona.activeHoursStart ?? 9,
      activeHoursEnd: persona.activeHoursEnd ?? 23,
      maxPostsPerDay: persona.maxPostsPerDay ?? 5,
      isActive: persona.isActive ?? true,
      isVerified: persona.isVerified ?? false,
    });
  }, [persona]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/personas/${persona.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  const cityList = data.country ? getCitiesByCountry(data.country) : [];

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" />
            Ayarlar \u2014 D\u00FCzenle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Dil</Label>
              <Select value={data.language} onValueChange={(v) => setData((d) => ({ ...d, language: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(languageNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cinsiyet</Label>
              <Select value={data.gender} onValueChange={(v) => setData((d) => ({ ...d, gender: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="erkek">Erkek</SelectItem>
                  <SelectItem value="kad\u0131n">Kad\u0131n</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Do\u011Fum Tarihi</Label>
              <Input className="h-8 text-sm" type="date" value={data.birthDate} onChange={(e) => setData((d) => ({ ...d, birthDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">\u00DClke</Label>
              <Select value={data.country} onValueChange={(v) => setData((d) => ({ ...d, country: v, city: "" }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Se\u00E7in" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">\u015Eehir</Label>
              {cityList.length > 0 ? (
                <Select value={data.city} onValueChange={(v) => setData((d) => ({ ...d, city: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Se\u00E7in" /></SelectTrigger>
                  <SelectContent>
                    {cityList.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input className="h-8 text-sm" value={data.city} onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))} placeholder="\u015Eehir" />
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Saat Dilimi</Label>
              <Input className="h-8 text-sm" value={data.timezone} onChange={(e) => setData((d) => ({ ...d, timezone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Aktif Saat Ba\u015Flang\u0131\u00E7</Label>
              <Input className="h-8 text-sm" type="number" min={0} max={23} value={data.activeHoursStart} onChange={(e) => setData((d) => ({ ...d, activeHoursStart: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Aktif Saat Biti\u015F</Label>
              <Input className="h-8 text-sm" type="number" min={0} max={23} value={data.activeHoursEnd} onChange={(e) => setData((d) => ({ ...d, activeHoursEnd: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">G\u00FCnl\u00FCk Maks. G\u00F6nderi</Label>
              <Input className="h-8 text-sm" type="number" min={1} max={50} value={data.maxPostsPerDay} onChange={(e) => setData((d) => ({ ...d, maxPostsPerDay: parseInt(e.target.value) || 1 }))} />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Switch checked={data.isActive} onCheckedChange={(v) => setData((d) => ({ ...d, isActive: v }))} />
              <Label className="text-xs">{data.isActive ? "Aktif" : "Pasif"}</Label>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Switch checked={data.isVerified} onCheckedChange={(v) => setData((d) => ({ ...d, isVerified: v }))} />
              <Label className="text-xs">{data.isVerified ? "Onayl\u0131 \u2713" : "Onays\u0131z"}</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>\u0130ptal</Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4" />
          Ayarlar
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Edit className="mr-1.5 h-3.5 w-3.5" />
          D\u00FCzenle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Dil</p>
            <p className="text-sm">{languageNames[persona.language || "tr"] || persona.language}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Cinsiyet</p>
            <p className="text-sm">{persona.gender === "erkek" ? "Erkek" : persona.gender === "kad\u0131n" ? "Kad\u0131n" : "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Do\u011Fum Tarihi</p>
            <p className="text-sm">{persona.birthDate || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Konum</p>
            <p className="text-sm">
              {[persona.city, persona.country].filter(Boolean).join(", ") || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Saat Dilimi</p>
            <p className="text-sm">{persona.timezone || "Europe/Istanbul"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Aktif Saatler</p>
            <p className="text-sm">
              {persona.activeHoursStart ?? 9}:00 - {persona.activeHoursEnd ?? 23}:00
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">G\u00FCnl\u00FCk Maks. G\u00F6nderi</p>
            <p className="text-sm">{persona.maxPostsPerDay ?? 5}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Durum</p>
            <div className="flex items-center gap-2">
              <Badge variant={persona.isActive ? "default" : "secondary"}>
                {persona.isActive ? "Aktif" : "Pasif"}
              </Badge>
              {persona.isVerified && (
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  \u2713 Onayl\u0131
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Son G\u00FCncelleme</p>
            <p className="text-sm">{formatDate(persona.updatedAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Olu\u015Fturulma</p>
            <p className="text-sm">{formatDate(persona.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
