"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, MoreHorizontal, Pencil, Trash2, CheckCircle2, Clock, AlertTriangle,
  Loader2, ListTodo, Play, RotateCcw, CalendarDays, X, Search, ChevronDown,
  Pause, Eye,
} from "lucide-react";

interface TaskData {
  id: string;
  taskCode: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  phase: string | null;
  category: string;
  assignedTo: string | null;
  createdBy: string | null;
  dueDate: string | null;
  dependency: string | null;
  solution: string | null;
  resultNote: string | null;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamTask {
  task: TaskData;
  assignedName: string | null;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  title: string | null;
}

const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Bekliyor", color: "bg-gray-100 text-gray-700", icon: Clock },
  in_progress: { label: "Devam Ediyor", color: "bg-blue-100 text-blue-700", icon: Play },
  completed: { label: "Tamamlandı", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  on_hold: { label: "Beklemede", color: "bg-orange-100 text-orange-700", icon: Pause },
  cancelled: { label: "İptal", color: "bg-gray-100 text-gray-500", icon: AlertTriangle },
};

const PRIORITY_CFG: Record<string, { label: string; color: string }> = {
  low: { label: "Düşük", color: "text-gray-500" },
  normal: { label: "Normal", color: "text-blue-600" },
  high: { label: "Yüksek", color: "text-orange-600" },
  urgent: { label: "Acil", color: "text-red-600 font-bold" },
};

const CATEGORY_CFG: Record<string, { label: string; color: string }> = {
  dev: { label: "Geliştirme", color: "bg-purple-100 text-purple-700" },
  team: { label: "Ekip", color: "bg-blue-100 text-blue-700" },
  bug: { label: "Hata", color: "bg-red-100 text-red-700" },
  ops: { label: "Operasyon", color: "bg-green-100 text-green-700" },
};

const PHASES = [
  "Faz 7: Altyapı Genişletme", "Faz 8: Sosyal Medya API", "Faz 9: Gelişmiş AI & İçerik",
  "Faz 10: Otomasyon", "Faz 11: Multi-tenant & Takım", "Faz 12: Güvenlik & Anti-Detection",
  "Faz 13: Gelişmiş Analitik", "Faz 14: SaaS & Ödeme",
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [teamUsers, setTeamUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Detail panel
  const [selectedTask, setSelectedTask] = useState<TeamTask | null>(null);

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formTaskCode, setFormTaskCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriority, setFormPriority] = useState("normal");
  const [formPhase, setFormPhase] = useState("");
  const [formCategory, setFormCategory] = useState("dev");
  const [formAssignee, setFormAssignee] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formDependency, setFormDependency] = useState("");
  const [formSolution, setFormSolution] = useState("");
  const [formResultNote, setFormResultNote] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState("");

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState<TeamTask | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/team-tasks");
      if (res.ok) setTasks(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setTeamUsers(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchTasks(); fetchUsers(); }, [fetchTasks, fetchUsers]);

  // Filter logic
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter === "active" && ["completed", "cancelled"].includes(t.task.status)) return false;
      if (statusFilter !== "active" && statusFilter !== "all" && t.task.status !== statusFilter) return false;
      if (categoryFilter !== "all" && t.task.category !== categoryFilter) return false;
      if (phaseFilter !== "all" && t.task.phase !== phaseFilter) return false;
      if (assigneeFilter === "unassigned" && t.task.assignedTo !== null) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && t.task.assignedTo !== assigneeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.task.title.toLowerCase().includes(q) ||
          (t.task.taskCode && t.task.taskCode.toLowerCase().includes(q)) ||
          (t.task.description && t.task.description.toLowerCase().includes(q)) ||
          (t.assignedName && t.assignedName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tasks, statusFilter, categoryFilter, phaseFilter, assigneeFilter, search]);

  // Stats
  const stats = useMemo(() => ({
    pending: tasks.filter((t) => t.task.status === "pending").length,
    inProgress: tasks.filter((t) => t.task.status === "in_progress").length,
    completed: tasks.filter((t) => t.task.status === "completed").length,
    onHold: tasks.filter((t) => t.task.status === "on_hold").length,
    total: tasks.length,
  }), [tasks]);

  const phases = useMemo(() => [...new Set(tasks.map((t) => t.task.phase).filter(Boolean) as string[])].sort(), [tasks]);

  // Form helpers
  function resetForm() {
    setFormTaskCode(""); setFormTitle(""); setFormDesc(""); setFormPriority("normal");
    setFormPhase(""); setFormCategory("dev"); setFormAssignee(""); setFormDueDate("");
    setFormDependency(""); setFormSolution(""); setFormResultNote(""); setEditingId("");
  }

  function openCreate() {
    resetForm();
    setDialogMode("create");
    setDialogOpen(true);
  }

  function openEdit(t: TeamTask) {
    setDialogMode("edit");
    setEditingId(t.task.id);
    setFormTaskCode(t.task.taskCode || "");
    setFormTitle(t.task.title);
    setFormDesc(t.task.description || "");
    setFormPriority(t.task.priority);
    setFormPhase(t.task.phase || "");
    setFormCategory(t.task.category);
    setFormAssignee(t.task.assignedTo || "");
    setFormDueDate(t.task.dueDate ? new Date(t.task.dueDate).toISOString().slice(0, 16) : "");
    setFormDependency(t.task.dependency || "");
    setFormSolution(t.task.solution || "");
    setFormResultNote(t.task.resultNote || "");
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!formTitle.trim()) return;
    setFormLoading(true);
    try {
      const body: Record<string, unknown> = {
        taskCode: formTaskCode.trim() || undefined,
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        priority: formPriority,
        phase: formPhase || undefined,
        category: formCategory,
        assignedTo: formAssignee || undefined,
        dependency: formDependency.trim() || undefined,
      };
      if (formDueDate) body.dueDate = new Date(formDueDate).toISOString();

      if (dialogMode === "edit") {
        body.solution = formSolution.trim() || null;
        body.resultNote = formResultNote.trim() || null;
        if (!formDueDate) body.dueDate = null;
        await fetch(`/api/team-tasks/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/team-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      setDialogOpen(false);
      resetForm();
      await fetchTasks();
    } catch { /* ignore */ } finally { setFormLoading(false); }
  }

  async function handleStatusChange(taskId: string, status: string) {
    await fetch(`/api/team-tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchTasks();
  }

  async function handleDelete() {
    if (!deleteTask) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/team-tasks/${deleteTask.task.id}`, { method: "DELETE" });
      setDeleteOpen(false); setDeleteTask(null);
      if (selectedTask?.task.id === deleteTask.task.id) setSelectedTask(null);
      await fetchTasks();
    } catch { /* ignore */ } finally { setDeleteLoading(false); }
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  }
  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }
  const userColors = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700"];
  const ucMap: Record<string, string> = {};
  teamUsers.forEach((u, i) => { ucMap[u.id] = userColors[i % userColors.length]; });

  const activeFilterCount = [statusFilter !== "active" ? statusFilter : null, categoryFilter, phaseFilter, assigneeFilter].filter((f) => f && f !== "all" && f !== "active").length + (search ? 1 : 0);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Görevler</h1>
          <span className="text-xs text-muted-foreground">({stats.total})</span>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> Yeni Görev
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: "pending", ...stats, count: stats.pending, icon: Clock, label: "Bekliyor" },
          { key: "in_progress", count: stats.inProgress, icon: Play, label: "Devam Ediyor", color: "border-blue-200 text-blue-700" },
          { key: "on_hold", count: stats.onHold, icon: Pause, label: "Beklemede", color: "border-orange-200 text-orange-700" },
          { key: "completed", count: stats.completed, icon: CheckCircle2, label: "Tamamlandı", color: "border-green-200 text-green-700" },
        ].map((s) => (
          <button key={s.key} onClick={() => setStatusFilter(statusFilter === s.key ? "active" : s.key)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${statusFilter === s.key ? "bg-primary text-primary-foreground border-primary" : s.color || ""}`}>
            <s.icon className="h-3 w-3" /> {s.count} {s.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="h-8 w-48 pl-7 text-xs" placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {Object.entries(CATEGORY_CFG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Faz" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Fazlar</SelectItem>
            {phases.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Atanan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Herkes</SelectItem>
            <SelectItem value="unassigned">Atanmamış</SelectItem>
            {teamUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="h-8 text-xs"
            onClick={() => { setStatusFilter("active"); setCategoryFilter("all"); setPhaseFilter("all"); setAssigneeFilter("all"); setSearch(""); }}>
            <X className="mr-1 h-3 w-3" /> Temizle ({activeFilterCount})
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} görev</span>
      </div>

      {/* Table + Detail split */}
      <div className="flex gap-4">
        {/* Table */}
        <div className={`${selectedTask ? "flex-1 min-w-0" : "w-full"}`}>
          {filtered.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Görev bulunamadı</p>
            </CardContent></Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-16">Kod</TableHead>
                    <TableHead>Görev</TableHead>
                    <TableHead className="w-20">Durum</TableHead>
                    <TableHead className="w-16">Öncelik</TableHead>
                    <TableHead className="w-20">Kategori</TableHead>
                    <TableHead className="w-36">Faz</TableHead>
                    <TableHead className="w-24">Atanan</TableHead>
                    <TableHead className="w-16">Tarih</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => {
                    const st = STATUS_CFG[t.task.status] || STATUS_CFG.pending;
                    const pr = PRIORITY_CFG[t.task.priority] || PRIORITY_CFG.normal;
                    const cat = CATEGORY_CFG[t.task.category] || CATEGORY_CFG.dev;
                    const done = t.task.status === "completed";
                    const isDue = t.task.dueDate && new Date(t.task.dueDate) < new Date() && !done;
                    const isSelected = selectedTask?.task.id === t.task.id;

                    return (
                      <TableRow key={t.task.id}
                        className={`cursor-pointer text-xs ${done ? "opacity-50" : ""} ${isSelected ? "bg-muted" : "hover:bg-muted/50"}`}
                        onClick={() => setSelectedTask(isSelected ? null : t)}>
                        <TableCell className="font-mono text-[10px] text-muted-foreground">
                          {t.task.taskCode || "—"}
                        </TableCell>
                        <TableCell>
                          <p className={`font-medium truncate ${done ? "line-through text-muted-foreground" : ""}`}>
                            {t.task.title}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] h-5 ${st.color}`}>{st.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-medium ${pr.color}`}>{pr.label}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] h-5 ${cat.color}`}>{cat.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {t.task.phase?.replace("Faz ", "F").replace(": ", " ") || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {t.assignedName ? (
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className={`text-[8px] ${ucMap[t.task.assignedTo || ""]}`}>
                                  {getInitials(t.assignedName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate text-[11px]">{t.assignedName.split(" ")[0]}</span>
                            </div>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] ${isDue ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                            {t.task.dueDate ? formatDate(t.task.dueDate) : "—"}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(t)}><Pencil className="mr-2 h-3.5 w-3.5" /> Düzenle</DropdownMenuItem>
                              {t.task.status === "pending" && <DropdownMenuItem onClick={() => handleStatusChange(t.task.id, "in_progress")}><Play className="mr-2 h-3.5 w-3.5" /> Başla</DropdownMenuItem>}
                              {["pending", "in_progress"].includes(t.task.status) && <DropdownMenuItem onClick={() => handleStatusChange(t.task.id, "on_hold")}><Pause className="mr-2 h-3.5 w-3.5" /> Beklet</DropdownMenuItem>}
                              {["pending", "in_progress"].includes(t.task.status) && <DropdownMenuItem onClick={() => handleStatusChange(t.task.id, "completed")}><CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Tamamla</DropdownMenuItem>}
                              {t.task.status === "on_hold" && <DropdownMenuItem onClick={() => handleStatusChange(t.task.id, "pending")}><RotateCcw className="mr-2 h-3.5 w-3.5" /> Devam Et</DropdownMenuItem>}
                              {done && <DropdownMenuItem onClick={() => handleStatusChange(t.task.id, "pending")}><RotateCcw className="mr-2 h-3.5 w-3.5" /> Yeniden Aç</DropdownMenuItem>}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteTask(t); setDeleteOpen(true); }}><Trash2 className="mr-2 h-3.5 w-3.5" /> Sil</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedTask && (
          <div className="w-80 shrink-0 rounded-lg border p-4 space-y-4 bg-card sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Detay</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedTask(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {selectedTask.task.taskCode && (
              <p className="text-xs font-mono text-muted-foreground">{selectedTask.task.taskCode}</p>
            )}
            <p className="font-medium text-sm">{selectedTask.task.title}</p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Durum</p>
                <Badge variant="outline" className={`${STATUS_CFG[selectedTask.task.status]?.color}`}>
                  {STATUS_CFG[selectedTask.task.status]?.label}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Öncelik</p>
                <span className={PRIORITY_CFG[selectedTask.task.priority]?.color}>
                  {PRIORITY_CFG[selectedTask.task.priority]?.label}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Kategori</p>
                <Badge variant="outline" className={CATEGORY_CFG[selectedTask.task.category]?.color}>
                  {CATEGORY_CFG[selectedTask.task.category]?.label}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Atanan</p>
                <span>{selectedTask.assignedName || "—"}</span>
              </div>
            </div>

            {selectedTask.task.phase && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Faz</p>
                <p>{selectedTask.task.phase}</p>
              </div>
            )}

            {selectedTask.task.description && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Açıklama</p>
                <p className="whitespace-pre-wrap text-foreground">{selectedTask.task.description}</p>
              </div>
            )}

            {selectedTask.task.dependency && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Bağımlılık</p>
                <p className="text-orange-700">{selectedTask.task.dependency}</p>
              </div>
            )}

            {selectedTask.task.solution && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Çözüm Notu</p>
                <div className="rounded-md border border-green-200 bg-green-50 p-2">
                  <p className="text-green-800 whitespace-pre-wrap">{selectedTask.task.solution}</p>
                </div>
              </div>
            )}

            {selectedTask.task.resultNote && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Sonuç</p>
                <p className="text-green-700">{selectedTask.task.resultNote}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openEdit(selectedTask)}>
                <Pencil className="mr-1 h-3 w-3" /> Düzenle
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Yeni Görev" : "Görevi Düzenle"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 overflow-y-auto flex-1 pr-1 py-2">
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Görev Kodu</Label>
                <Input className="h-8 text-xs" placeholder="MON-2" value={formTaskCode} onChange={(e) => setFormTaskCode(e.target.value)} />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Başlık *</Label>
                <Input className="h-8 text-xs" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Açıklama</Label>
              <Textarea className="text-xs" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Kategori</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CFG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Öncelik</Label>
                <Select value={formPriority} onValueChange={setFormPriority}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Atanan</Label>
                <Select value={formAssignee || "none"} onValueChange={(v) => setFormAssignee(v === "none" ? "" : v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Atanmamış</SelectItem>
                    {teamUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Faz</Label>
                <Select value={formPhase || "none"} onValueChange={(v) => setFormPhase(v === "none" ? "" : v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Faz Yok</SelectItem>
                    {PHASES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Son Tarih</Label>
                <Input type="datetime-local" className="h-8 text-xs" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bağımlılık</Label>
              <Input className="h-8 text-xs" placeholder="Ör: API bağlama gerekli" value={formDependency} onChange={(e) => setFormDependency(e.target.value)} />
            </div>
            {dialogMode === "edit" && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">Çözüm Notu</Label>
                  <Textarea className="text-xs" value={formSolution} onChange={(e) => setFormSolution(e.target.value)} rows={2} placeholder="Ne yapıldı, hangi commit..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sonuç Notu</Label>
                  <Textarea className="text-xs" value={formResultNote} onChange={(e) => setFormResultNote(e.target.value)} rows={2} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setDialogOpen(false); resetForm(); }}>İptal</Button>
            <Button size="sm" onClick={handleSubmit} disabled={formLoading || !formTitle.trim()}>
              {formLoading ? "Kaydediliyor..." : dialogMode === "create" ? "Oluştur" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { if (!deleteLoading) { setDeleteOpen(o); if (!o) setDeleteTask(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Görevi Sil</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bu görevi silmek istediğinize emin misiniz?</p>
          {deleteTask && <div className="rounded-md border bg-muted/50 p-3 text-sm font-medium">{deleteTask.task.title}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteTask(null); }} disabled={deleteLoading}>Vazgeç</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Siliniyor..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
