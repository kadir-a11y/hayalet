"use client";

import { useEffect, useState, useMemo } from "react";
import { FileText, Clock, Loader2, ExternalLink, Filter, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContentItem } from "./types";
import { platformIcon, platformNames, statusLabels, statusColors, formatShortDate } from "./utils";

const PAGE_SIZE = 10;

export function PostsTab({ personaId }: { personaId: string }) {
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/personas/${personaId}/content`)
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setIsLoading(false));
  }, [personaId]);

  const filtered = useMemo(() => {
    let result = posts;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (platformFilter !== "all") {
      result = result.filter((p) => p.platform === platformFilter);
    }
    return result;
  }, [posts, statusFilter, platformFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const platforms = useMemo(() => {
    const set = new Set(posts.map((p) => p.platform));
    return Array.from(set);
  }, [posts]);

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    failed: posts.filter((p) => p.status === "failed").length,
  }), [posts]);

  useEffect(() => { setPage(1); }, [statusFilter, platformFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-semibold">Henüz gönderi yok</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Bu personaya henüz içerik oluşturulmamış.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Toplam</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold text-green-600">{stats.published}</p>
          <p className="text-xs text-muted-foreground">Yayınlanan</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold text-blue-600">{stats.scheduled}</p>
          <p className="text-xs text-muted-foreground">Zamanlanmış</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold text-red-600">{stats.failed}</p>
          <p className="text-xs text-muted-foreground">Başarısız</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Platformlar</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p} value={p}>{platformNames[p] || p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} gönderi
        </span>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {paginated.map((post) => (
          <div key={post.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {platformIcon(post.platform)}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {platformNames[post.platform] || post.platform}
                </span>
                {post.aiGenerated && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0">AI</Badge>
                )}
                {post.externalPostUrl && (
                  <a
                    href={post.externalPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <Badge variant={(statusColors[post.status] as "default" | "secondary" | "destructive" | "outline") || "secondary"}>
                {statusLabels[post.status] || post.status}
              </Badge>
            </div>

            <p className="text-sm whitespace-pre-wrap line-clamp-4">{post.content}</p>

            {post.status === "failed" && post.errorMessage && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                <p className="text-xs text-destructive">{post.errorMessage}</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatShortDate(post.createdAt)}</span>
              {post.scheduledAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatShortDate(post.scheduledAt)}
                </span>
              )}
              {post.publishedAt && (
                <span className="text-green-600">
                  Yayınlandı: {formatShortDate(post.publishedAt)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Önceki
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
