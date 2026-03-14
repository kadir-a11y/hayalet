"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import {
  Bug,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2,
} from "lucide-react";

interface BugReport {
  id: string;
  userId: string;
  userName: string | null;
  page: string;
  description: string;
  priority: string | null;
  status: string | null;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tumu" },
  { value: "acik", label: "Acik" },
  { value: "inceleniyor", label: "Inceleniyor" },
  { value: "cozuldu", label: "Cozuldu" },
  { value: "kapandi", label: "Kapandi" },
];

const PRIORITY_COLORS: Record<string, string> = {
  kritik: "bg-red-100 text-red-800 border-red-200",
  yuksek: "bg-orange-100 text-orange-800 border-orange-200",
  normal: "bg-blue-100 text-blue-800 border-blue-200",
  dusuk: "bg-gray-100 text-gray-800 border-gray-200",
};

const PRIORITY_LABELS: Record<string, string> = {
  kritik: "Kritik",
  yuksek: "Yuksek",
  normal: "Normal",
  dusuk: "Dusuk",
};

const STATUS_COLORS: Record<string, string> = {
  acik: "bg-yellow-100 text-yellow-800 border-yellow-200",
  inceleniyor: "bg-blue-100 text-blue-800 border-blue-200",
  cozuldu: "bg-green-100 text-green-800 border-green-200",
  kapandi: "bg-gray-100 text-gray-800 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  acik: "Acik",
  inceleniyor: "Inceleniyor",
  cozuldu: "Cozuldu",
  kapandi: "Kapandi",
};

export default function BugReportsContent({ embedded = false }: { embedded?: boolean }) {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/bug-reports${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/bug-reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReports((prev) =>
          prev.map((r) => (r.id === id ? updated : r))
        );
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/bug-reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: noteText }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReports((prev) =>
          prev.map((r) => (r.id === id ? updated : r))
        );
        setNoteEditId(null);
        setNoteText("");
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/bug-reports/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== deleteId));
      }
    } catch {
      // silently fail
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bug className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Bug Bildirimleri</h1>
            <Badge variant="secondary">{reports.length}</Badge>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtre:</span>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={filter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Hic bug bildirimi bulunamadi.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_2fr_100px_100px_140px_100px] gap-2 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
            <div>Sayfa</div>
            <div>Aciklama</div>
            <div>Oncelik</div>
            <div>Durum</div>
            <div>Tarih</div>
            <div>Aksiyonlar</div>
          </div>

          {/* Table Rows */}
          {reports.map((report) => (
            <div key={report.id} className="border-t">
              {/* Main Row */}
              <div
                className="grid grid-cols-[1fr_2fr_100px_100px_140px_100px] gap-2 px-4 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === report.id ? null : report.id)
                }
              >
                <div className="text-sm truncate font-mono" title={report.page}>
                  {report.page}
                </div>
                <div className="text-sm truncate">{report.description}</div>
                <div>
                  <Badge
                    variant="outline"
                    className={
                      PRIORITY_COLORS[report.priority || "normal"]
                    }
                  >
                    {PRIORITY_LABELS[report.priority || "normal"]}
                  </Badge>
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={STATUS_COLORS[report.status || "acik"]}
                  >
                    {STATUS_LABELS[report.status || "acik"]}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(report.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  {expandedId === report.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedId === report.id && (
                <div className="px-4 py-4 bg-muted/10 border-t space-y-4">
                  <div>
                    <span className="text-sm font-medium">Kullanici:</span>{" "}
                    <span className="text-sm">
                      {report.userName || "Bilinmiyor"}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Tam Aciklama:</span>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {report.description}
                    </p>
                  </div>

                  {/* Status Change */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Durum Degistir:</span>
                    <Select
                      value={report.status || "acik"}
                      onValueChange={(val) =>
                        handleStatusChange(report.id, val)
                      }
                      disabled={saving}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acik">Acik</SelectItem>
                        <SelectItem value="inceleniyor">Inceleniyor</SelectItem>
                        <SelectItem value="cozuldu">Cozuldu</SelectItem>
                        <SelectItem value="kapandi">Kapandi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Admin Note */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Admin Notu:</span>
                    {report.adminNote && noteEditId !== report.id && (
                      <p className="text-sm bg-muted/50 p-2 rounded">
                        {report.adminNote}
                      </p>
                    )}
                    {noteEditId === report.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Admin notu ekleyin..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNote(report.id)}
                            disabled={saving}
                          >
                            {saving && (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            )}
                            Kaydet
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setNoteEditId(null);
                              setNoteText("");
                            }}
                          >
                            Iptal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNoteEditId(report.id);
                          setNoteText(report.adminNote || "");
                        }}
                      >
                        <MessageSquare className="mr-1 h-3 w-3" />
                        {report.adminNote ? "Notu Duzenle" : "Not Ekle"}
                      </Button>
                    )}
                  </div>

                  {/* Resolved At */}
                  {report.resolvedAt && (
                    <div>
                      <span className="text-sm font-medium">
                        Cozulme Tarihi:
                      </span>{" "}
                      <span className="text-sm">
                        {formatDate(report.resolvedAt)}
                      </span>
                    </div>
                  )}

                  {/* Delete */}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(report.id);
                      }}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Sil
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bug bildirimini silmek istediginize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu islem geri alinamaz. Bug bildirimi kalici olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Iptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
