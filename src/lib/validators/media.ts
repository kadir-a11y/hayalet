import { z } from "zod";

export const mediaUploadSchema = z.object({
  personaId: z.string().uuid(),
  type: z.enum(["image", "video", "document"]),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;

// Max file sizes
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
];
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4", "video/webm", "video/quicktime",
];
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf", "text/plain", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function getMediaType(contentType: string): "image" | "video" | "document" | null {
  if (ALLOWED_IMAGE_TYPES.includes(contentType)) return "image";
  if (ALLOWED_VIDEO_TYPES.includes(contentType)) return "video";
  if (ALLOWED_DOCUMENT_TYPES.includes(contentType)) return "document";
  return null;
}

export function getMaxSize(type: string): number {
  switch (type) {
    case "image": return MAX_IMAGE_SIZE;
    case "video": return MAX_VIDEO_SIZE;
    case "document": return MAX_DOCUMENT_SIZE;
    default: return MAX_IMAGE_SIZE;
  }
}
