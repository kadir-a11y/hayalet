"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Send,
  Check,
  X,
  CheckCheck,
  Edit3,
  Globe,
  MessageSquare,
  User,
  Filter,
  Zap,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface FeedItem {
  id: string;
  platform: string;
  sourceUrl: string | null;
  sourceAuthor: string | null;
  content: string;
  sentiment: string;
  reachEstimate: number | null;
  engagementCount: number;
  detectedAt: string;
}

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
  language: string | null;
  country: string | null;
  gender: string | null;
  isActive: boolean;
  tags: { id: string; name: string; color: string }[];
  roles: { id: string; name: string }[];
}

interface WorkspaceResponse {
  id: string;
  personaId: string;
  generatedContent: string;
  editedContent: string | null;
  sentiment: string | null;
  platform: string;
  status: string;
  personaName: string;
  personaAvatar: string | null;
  personaLanguage: string | null;
  personaCountry: string | null;
  errorMessage: string | null;
  scheduledAt: string | null;
}

interface FilterOptions {
  countries: string[];
  languages: string[];
  tags: { id: string; name: string; color: string }[];
  roles: { id: string; name: string }[];
}

// ── Constants ──────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter/X",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  negative: "bg-red-100 text-red-800",
  neutral: "bg-gray-100 text-gray-800",
};

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  published: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "İnceleniyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  published: "Yayınlandı",
  failed: "Başarısız",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Main Component ─────────────────────────────────────────────────────

export default function WorkspaceTab({ projectId }: { projectId: string }) {
  // Feed state
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedPlatform, setFeedPlatform] = useState("all");
  const [platformCounts, setPlatformCounts] = useState<{ platform: string; count: number }[]>([]);
  const [feedTotal, setFeedTotal] = useState(0);

  // Selection state
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null);

  // AI command state
  const [aiCommand, setAiCommand] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("twitter");

  // Persona selection state
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personasLoading, setPersonasLoading] = useState(false);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<Set<string>>(new Set());
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [responses, setResponses] = useState<WorkspaceResponse[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Publishing state
  const [publishing, setPublishing] = useState(false);

  // ── Fetch Functions ────────────────────────────────────────────────

  const fetchFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const params = new URLSearchParams();
      if (feedPlatform !== "all") params.set("platform", feedPlatform);
      params.set("limit", "30");

      const res = await fetch(`/api/projects/${projectId}/feed?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFeed(data.items);
        setFeedTotal(data.total);
        setPlatformCounts(data.platformCounts?.platforms || []);
      }
    } catch (error) {
      console.error("Feed fetch failed:", error);
    } finally {
      setFeedLoading(false);
    }
  }, [projectId, feedPlatform]);

  const fetchPersonas = useCallback(async () => {
    setPersonasLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCountry !== "all") params.set("country", filterCountry);
      if (filterLanguage !== "all") params.set("language", filterLanguage);
      params.set("isActive", "true");

      const res = await fetch(`/api/personas/filter?${params}`);
      if (res.ok) {
        setPersonas(await res.json());
      }
    } catch (error) {
      console.error("Personas fetch failed:", error);
    } finally {
      setPersonasLoading(false);
    }
  }, [filterCountry, filterLanguage]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/personas/filter?options=true");
      if (res.ok) {
        setFilterOptions(await res.json());
      }
    } catch (error) {
      console.error("Filter options fetch failed:", error);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    fetchPersonas();
    fetchFilterOptions();
  }, [fetchPersonas, fetchFilterOptions]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!aiCommand.trim() || selectedPersonaIds.size === 0) return;
    setGenerating(true);

    try {
      // Create session
      const sessionRes = await fetch(`/api/projects/${projectId}/workspace/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContentId: selectedFeedItem?.id || undefined,
          aiCommand,
          selectedPersonaIds: Array.from(selectedPersonaIds),
          platform: selectedPlatform,
        }),
      });

      if (!sessionRes.ok) throw new Error("Session creation failed");
      const session = await sessionRes.json();
      setActiveSessionId(session.id);

      // Generate responses
      const genRes = await fetch(
        `/api/projects/${projectId}/workspace/sessions/${session.id}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: "reply",
          }),
        }
      );

      if (genRes.ok) {
        const generatedResponses = await genRes.json();
        setResponses(generatedResponses);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (responseId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/workspace/responses/${responseId}/approve`,
        { method: "POST" }
      );
      if (res.ok) {
        setResponses((prev) =>
          prev.map((r) => (r.id === responseId ? { ...r, status: "approved" } : r))
        );
      }
    } catch (error) {
      console.error("Approve failed:", error);
    }
  };

  const handleReject = async (responseId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/workspace/responses/${responseId}/reject`,
        { method: "POST" }
      );
      if (res.ok) {
        setResponses((prev) =>
          prev.map((r) => (r.id === responseId ? { ...r, status: "rejected" } : r))
        );
      }
    } catch (error) {
      console.error("Reject failed:", error);
    }
  };

  const handleBulkApprove = async () => {
    const pendingIds = responses
      .filter((r) => r.status === "pending_review")
      .map((r) => r.id);
    if (pendingIds.length === 0) return;

    try {
      const res = await fetch(
        `/api/projects/${projectId}/workspace/responses/bulk-approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responseIds: pendingIds }),
        }
      );
      if (res.ok) {
        setResponses((prev) =>
          prev.map((r) =>
            pendingIds.includes(r.id) ? { ...r, status: "approved" } : r
          )
        );
      }
    } catch (error) {
      console.error("Bulk approve failed:", error);
    }
  };

  const handleSaveEdit = async (responseId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/workspace/responses/${responseId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editedContent: editContent }),
        }
      );
      if (res.ok) {
        setResponses((prev) =>
          prev.map((r) =>
            r.id === responseId ? { ...r, editedContent: editContent } : r
          )
        );
        setEditingId(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("Save edit failed:", error);
    }
  };

  const handlePublish = async () => {
    if (!activeSessionId) return;
    setPublishing(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/workspace/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          staggerMinutes: 5,
        }),
      });

      if (res.ok) {
        const results = await res.json();
        setResponses((prev) =>
          prev.map((r) => {
            const published = results.find(
              (p: { responseId: string }) => p.responseId === r.id
            );
            if (published) {
              return {
                ...r,
                status: "published",
                scheduledAt: published.scheduledAt,
              };
            }
            return r;
          })
        );
      }
    } catch (error) {
      console.error("Publish failed:", error);
    } finally {
      setPublishing(false);
    }
  };

  const handleAddMockData = async () => {
    try {
      await fetch(`/api/projects/${projectId}/feed/mock`, { method: "POST" });
      fetchFeed();
    } catch (error) {
      console.error("Mock data failed:", error);
    }
  };

  const togglePersona = (personaId: string) => {
    setSelectedPersonaIds((prev) => {
      const next = new Set(prev);
      if (next.has(personaId)) {
        next.delete(personaId);
      } else {
        next.add(personaId);
      }
      return next;
    });
  };

  const selectAllPersonas = () => {
    if (selectedPersonaIds.size === personas.length) {
      setSelectedPersonaIds(new Set());
    } else {
      setSelectedPersonaIds(new Set(personas.map((p) => p.id)));
    }
  };

  // ── Computed ───────────────────────────────────────────────────────

  const approvedCount = responses.filter((r) => r.status === "approved").length;
  const pendingCount = responses.filter((r) => r.status === "pending_review").length;

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Top: Content Feed + Workspace Panel ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Content Feed */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">İçerik Akışı</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleAddMockData}>
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Mock
                </Button>
              </div>
              {/* Platform Filter Tabs */}
              <div className="flex flex-wrap gap-1 mt-2">
                <Button
                  variant={feedPlatform === "all" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setFeedPlatform("all")}
                >
                  Tümü ({feedTotal})
                </Button>
                {platformCounts.map((pc) => (
                  <Button
                    key={pc.platform}
                    variant={feedPlatform === pc.platform ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setFeedPlatform(pc.platform)}
                  >
                    {PLATFORM_LABELS[pc.platform] || pc.platform} ({pc.count})
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto space-y-2 pt-0">
              {feedLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : feed.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Henüz içerik yok.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleAddMockData}
                  >
                    Mock veri ekle
                  </Button>
                </div>
              ) : (
                feed.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFeedItem?.id === item.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedFeedItem(item)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {PLATFORM_LABELS[item.platform] || item.platform}
                      </Badge>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          SENTIMENT_COLORS[item.sentiment] || SENTIMENT_COLORS.neutral
                        }`}
                      >
                        {item.sentiment}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(item.detectedAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{item.content}</p>
                    {item.sourceAuthor && (
                      <p className="text-xs text-muted-foreground mt-1">
                        @{item.sourceAuthor}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Workspace Panel (3 sections) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Source Content + AI Command */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {selectedFeedItem ? "Kaynak İçerik" : "AI Komutu"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedFeedItem && (
                  <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {PLATFORM_LABELS[selectedFeedItem.platform]}
                      </Badge>
                      {selectedFeedItem.sourceAuthor && (
                        <span className="text-xs text-muted-foreground">
                          @{selectedFeedItem.sourceAuthor}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 w-6 p-0"
                        onClick={() => setSelectedFeedItem(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm">{selectedFeedItem.content}</p>
                  </div>
                )}

                <Textarea
                  placeholder="AI'ya talimat verin... (ör: Bu içeriğe olumlu ve destekleyici yanıt yazın)"
                  value={aiCommand}
                  onChange={(e) => setAiCommand(e.target.value)}
                  rows={3}
                  className="resize-none"
                />

                <div className="flex gap-2">
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-[140px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !aiCommand.trim() || selectedPersonaIds.size === 0}
                    className="flex-1 h-8"
                    size="sm"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Üretiliyor... ({selectedPersonaIds.size} persona)
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-3.5 w-3.5" />
                        Üret ({selectedPersonaIds.size} persona)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Persona Selector */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Persona Seçimi ({selectedPersonaIds.size}/{personas.length})
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllPersonas}>
                    {selectedPersonaIds.size === personas.length ? "Hiçbirini Seçme" : "Tümünü Seç"}
                  </Button>
                </div>
                {/* Filters */}
                <div className="flex gap-2 mt-2">
                  <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger className="h-7 text-xs flex-1">
                      <SelectValue placeholder="Ülke" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Ülkeler</SelectItem>
                      {filterOptions?.countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                    <SelectTrigger className="h-7 text-xs flex-1">
                      <SelectValue placeholder="Dil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Diller</SelectItem>
                      {filterOptions?.languages.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto space-y-1 pt-0">
                {personasLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : personas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aktif persona bulunamadı
                  </p>
                ) : (
                  personas.map((persona) => (
                    <div
                      key={persona.id}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedPersonaIds.has(persona.id)
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => togglePersona(persona.id)}
                    >
                      <Checkbox
                        checked={selectedPersonaIds.has(persona.id)}
                        className="pointer-events-none"
                      />
                      <Avatar className="h-7 w-7">
                        {persona.avatarUrl && (
                          <AvatarImage src={persona.avatarUrl} alt={persona.name} />
                        )}
                        <AvatarFallback className="text-xs">
                          {getInitials(persona.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{persona.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {persona.language} {persona.country && `· ${persona.country}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Response Review Panel */}
          {responses.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Üretilen Yanıtlar ({responses.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    {pendingCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handleBulkApprove}
                      >
                        <CheckCheck className="mr-1 h-3.5 w-3.5" />
                        Tümünü Onayla ({pendingCount})
                      </Button>
                    )}
                    {approvedCount > 0 && (
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handlePublish}
                        disabled={publishing}
                      >
                        {publishing ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="mr-1 h-3.5 w-3.5" />
                        )}
                        Yayınla ({approvedCount})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className={`p-3 rounded-lg border ${
                      response.status === "approved"
                        ? "border-green-200 bg-green-50/50"
                        : response.status === "rejected"
                        ? "border-red-200 bg-red-50/50 opacity-60"
                        : response.status === "published"
                        ? "border-blue-200 bg-blue-50/50"
                        : response.status === "failed"
                        ? "border-red-200 bg-red-50/50"
                        : ""
                    }`}
                  >
                    {/* Response Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        {response.personaAvatar && (
                          <AvatarImage
                            src={response.personaAvatar}
                            alt={response.personaName}
                          />
                        )}
                        <AvatarFallback className="text-xs">
                          {getInitials(response.personaName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {response.personaName}
                      </span>
                      {response.personaLanguage && (
                        <span className="text-xs text-muted-foreground">
                          ({response.personaLanguage})
                        </span>
                      )}
                      {response.personaCountry && (
                        <span className="text-xs text-muted-foreground">
                          · {response.personaCountry}
                        </span>
                      )}
                      <Badge
                        className={`ml-auto text-xs ${
                          STATUS_COLORS[response.status] || ""
                        }`}
                      >
                        {STATUS_LABELS[response.status] || response.status}
                      </Badge>
                    </div>

                    {/* Response Content */}
                    {editingId === response.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="resize-none text-sm"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleSaveEdit(response.id)}
                          >
                            Kaydet
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditingId(null);
                              setEditContent("");
                            }}
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {response.editedContent || response.generatedContent}
                      </p>
                    )}

                    {response.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">{response.errorMessage}</p>
                    )}

                    {response.scheduledAt && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(response.scheduledAt).toLocaleString("tr-TR")}
                      </p>
                    )}

                    {/* Response Actions */}
                    {response.status === "pending_review" && (
                      <div className="flex gap-1 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleApprove(response.id)}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Onayla
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleReject(response.id)}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Reddet
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setEditingId(response.id);
                            setEditContent(
                              response.editedContent || response.generatedContent
                            );
                          }}
                        >
                          <Edit3 className="mr-1 h-3 w-3" />
                          Düzenle
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
