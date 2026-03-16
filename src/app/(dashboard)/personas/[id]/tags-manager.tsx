"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tag } from "./types";

export function TagsManager({
  personaId,
  personaTags,
  onUpdated,
}: {
  personaId: string;
  personaTags: Tag[];
  onUpdated: () => void;
}) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    new Set(personaTags.map((t) => t.id))
  );

  useEffect(() => {
    setSelectedTagIds(new Set(personaTags.map((t) => t.id)));
  }, [personaTags]);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setAllTags(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }

  async function saveTags() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: Array.from(selectedTagIds) }),
      });
      if (!res.ok) throw new Error();
      onUpdated();
    } catch {
      console.error("Etiketler kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges =
    selectedTagIds.size !== personaTags.length ||
    personaTags.some((t) => !selectedTagIds.has(t.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          Hen\u00FCz etiket olu\u015Fturulmam\u0131\u015F.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Bu personaya atamak istedi\u011Finiz etiketleri se\u00E7in.
      </p>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTagIds.has(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer select-none transition-colors"
              style={
                isSelected
                  ? { backgroundColor: tag.color ?? undefined }
                  : { borderColor: tag.color ?? undefined, color: tag.color ?? undefined }
              }
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
      {hasChanges && (
        <Button onClick={saveTags} disabled={isSaving} size="sm">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "De\u011Fi\u015Fiklikleri Kaydet"
          )}
        </Button>
      )}
    </div>
  );
}
