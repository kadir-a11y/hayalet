"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Trash2,
  Loader2,
  Image,
  Film,
  FileIcon,
  Upload,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { formatShortDate } from "./utils";

interface MediaItem {
  id: string;
  type: string;
  filename: string;
  r2Key: string;
  url: string;
  contentType: string | null;
  size: number | null;
  createdAt: string | null;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

export function MediaTab({ personaId }: { personaId: string }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video" | "document">("all");

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch(`/api/media?personaId=${personaId}`);
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch {
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, [personaId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("personaId", personaId);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Y\u00FCkleme ba\u015Far\u0131s\u0131z.");
        }
      }
      fetchMedia();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Y\u00FCkleme ba\u015Far\u0131s\u0131z.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      // silently fail
    }
  }

  const filtered = filter === "all" ? media : media.filter((m) => m.type === filter);

  const counts = {
    all: media.length,
    image: media.filter((m) => m.type === "image").length,
    video: media.filter((m) => m.type === "video").length,
    document: media.filter((m) => m.type === "document").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload & Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1">
          {(["all", "image", "video", "document"] as const).map((t) => (
            <Button
              key={t}
              variant={filter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(t)}
              className="text-xs"
            >
              {t === "all" && "T\u00FCm\u00FC"}
              {t === "image" && "G\u00F6rseller"}
              {t === "video" && "Videolar"}
              {t === "document" && "Belgeler"}
              {counts[t] > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                  {counts[t]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        <div>
          <input
            type="file"
            id="media-upload"
            className="hidden"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <Button
            size="sm"
            onClick={() => document.getElementById("media-upload")?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            Y\u00FCkle
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Image className="h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 text-sm font-semibold">
            {media.length === 0 ? "Hen\u00FCz medya yok" : "Bu filtrede medya yok"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            G\u00F6rsel, video veya belge y\u00FCkleyin.
          </p>
          {media.length === 0 && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => document.getElementById("media-upload")?.click()}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Dosya Y\u00FCkle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border overflow-hidden"
            >
              {/* Preview */}
              {item.type === "image" ? (
                <div className="aspect-video bg-muted">
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {item.type === "video" ? (
                    <Film className="h-10 w-10 text-muted-foreground" />
                  ) : (
                    <FileIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
              )}

              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="text-xs font-medium truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{formatShortDate(item.createdAt)}</span>
                </div>
              </div>

              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Dosyay\u0131 silmek istedi\u011Finize emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{item.filename}&rdquo; kal\u0131c\u0131 olarak silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>\u0130ptal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
