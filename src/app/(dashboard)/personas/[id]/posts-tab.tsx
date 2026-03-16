"use client";

import { useEffect, useState } from "react";
import { FileText, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ContentItem } from "./types";
import { platformIcon, statusLabels, statusColors, formatShortDate } from "./utils";

export function PostsTab({ personaId }: { personaId: string }) {
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/personas/${personaId}/content`)
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setIsLoading(false));
  }, [personaId]);

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
        <h3 className="mt-4 text-sm font-semibold">Hen\u00FCz g\u00F6nderi yok</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Bu personaya hen\u00FCz i\u00E7erik olu\u015Fturulmam\u0131\u015F.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded-lg border p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {platformIcon(post.platform)}
              </div>
              <span className="text-xs font-medium capitalize text-muted-foreground">
                {post.platform}
              </span>
              {post.aiGenerated && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  AI
                </Badge>
              )}
            </div>
            <Badge
              variant={statusColors[post.status] as any || "secondary"}
            >
              {statusLabels[post.status] || post.status}
            </Badge>
          </div>
          <p className="text-sm whitespace-pre-wrap line-clamp-4">{post.content}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatShortDate(post.createdAt)}</span>
            {post.scheduledAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatShortDate(post.scheduledAt)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
