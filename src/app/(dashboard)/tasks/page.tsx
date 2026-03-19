"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ListTodo,
  Play,
  RotateCcw,
  CalendarDays,
  X,
} from "lucide-react";

interface TeamTask {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assignedTo: string | null;
    createdBy: string | null;
    dueDate: string | null;
    resultNote: string | null;
    completedAt: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  };
  assignedName: string | null;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  title: string | null;
  responsibilities: string | null;
  isAdmin: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Bekliyor", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
  in_progress: { label: "Devam Ediyor", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Play },
  completed: { label: "Tamamlandı", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "İptal", color: "bg-gray-100 text-gray-500 border-gray-200", icon: AlertTriangle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Düşük", color: "bg-gray-50 text-gray-600 border-gray-200" },
  normal: { label: "Normal", color: "bg-blue-50 text-blue-600 border-blue-200" },
  high: { label: "Yüksek", color: "bg-orange-50 text-orange-600 border-orange-200" },
  urgent: { label: "Acil", color: "bg-red-50 text-red-600 border-red-200" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [teamUsers, setTeamUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createPriority, setCreatePriority] = useState("normal");
  const [createAssignee, setCreateAssignee] = useState("");
  const [createDueDate, setCreateDueDate] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<TeamTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState("normal");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editResultNote, setEditResultNote] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeTask, setCompleteTask] = useState<TeamTask | null>(null);
  const [completeNote, setCompleteNote] = useState("");
  const [completeLoading, setCompleteLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState<TeamTask | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/team-tasks");
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setTeamUsers(await res.json());
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === "active" && ["completed", "cancelled"].includes(t.task.status)) return false;
    if (statusFilter !== "active" && statusFilter !== "all" && t.task.status !== statusFilter) return false;
    if (assigneeFilter === "unassigned" && t.task.assignedTo !== null) return false;
    if (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && t.task.assignedTo !== assigneeFilter) return false;
    return true;
  });

  const pendingCount = tasks.filter((t) => t.task.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.task.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.task.status === "completed").length;

  function resetCreate() {
    setCreateTitle(""); setCreateDesc(""); setCreatePriority("normal"); setCreateAssignee(""); setCreateDueDate("");
  }

  async function handleCreate() {
    if (!createTitle.trim()) return;
    setCreateLoading(true);
    try {
      const body: Record<string, unknown> = {
        title: createTitle.trim(),
        description: createDesc.trim() || undefined,
        priority: createPriority,
        assignedTo: createAssignee || undefined,
      };
      if (createDueDate) body.dueDate = new Date(createDueDate).toISOString();
      const res = await fetch("/api/team-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { resetCreate(); setCreateOpen(false); await fetchTasks(); }
    } catch (err) {
      console.error("Create error:", err);
    } finally {
      setCreateLoading(false);
    }
  }

  function openEdit(t: TeamTask) {
    setEditTask(t);
    setEditTitle(t.task.title);
    setEditDesc(t.task.description || "");
    setEditPriority(t.task.priority);
    setEditAssignee(t.task.assignedTo || "");
    setEditDueDate(t.task.dueDate ? new Date(t.task.dueDate).toISOString().slice(0, 16) : "");
    setEditResultNote(t.task.resultNote || "");
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editTask || !editTitle.trim()) return;
    setEditLoading(true);
    try {
      const body: Record<string, unknown> = {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        priority: editPriority,
        assignedTo: editAssignee || null,
        resultNote: editResultNote.trim() || null,
      };
      if (editDueDate) body.dueDate = new Date(editDueDate).toISOString();
      else body.dueDate = null;
      const res = await fetch(`/api/team-tasks/${editTask.task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setEditOpen(false); setEditTask(null); await fetchTasks(); }
    } catch (err) {
      console.error("Edit error:", err);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, status: string, extra?: Record<string, unknown>) {
    try {
      await fetch(`/api/team-tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      await fetchTasks();
    } catch (err) {
      console.error("Status change error:", err);
    }
  }

  function openCompleteDialog(t: TeamTask) {
    setCompleteTask(t);
    setCompleteNote(t.task.resultNote || "");
    setCompleteOpen(true);
  }

  async function handleComplete() {
    if (!completeTask) return;
    setCompleteLoading(true);
    try {
      await fetch(`/api/team-tasks/${completeTask.task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", resultNote: completeNote.trim() || null }),
      });
      setCompleteOpen(false);
      setCompleteTask(null);
      setCompleteNote("");
      await fetchTasks();
    } catch (err) {
      console.error("Complete error:", err);
    } finally {
      setCompleteLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTask) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/team-tasks/${deleteTask.task.id}`, { method: "DELETE" });
      if (res.ok) { setDeleteOpen(false); setDeleteTask(null); await fetchTasks(); }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  }

  function formatDate(d: string | null) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  const userColors = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700"];
  const userColorMap: Record<string, string> = {};
  teamUsers.forEach((u, i) => { userColorMap[u.id] = userColors[i % userColors.length]; });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header — compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Görevler</h1>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="gap-1 h-6">
              <Clock className="h-3 w-3" /> {pendingCount}
            </Badge>
            <Badge variant="outline" className="gap-1 h-6 border-blue-200 text-blue-700">
              <Play className="h-3 w-3" /> {inProgressCount}
            </Badge>
            <Badge variant="outline" className="gap-1 h-6 border-green-200 text-green-700">
              <CheckCircle2 className="h-3 w-3" /> {completedCount}
            </Badge>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Yeni Görev
        </Button>
      </div>

      {/* Team — compact inline bar */}
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg border bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground shrink-0">Ekip:</span>
        {teamUsers.map((user) => {
          const active = tasks.filter((t) => t.task.assignedTo === user.id && ["pending", "in_progress"].includes(t.task.status)).length;
          return (
            <button
              key={user.id}
              onClick={() => setAssigneeFilter(assigneeFilter === user.id ? "all" : user.id)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${assigneeFilter === user.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className={`text-[9px] font-medium ${userColorMap[user.id] || ""}`}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.name.split(" ")[0]}</span>
              {active > 0 && (
                <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold ${assigneeFilter === user.id ? "bg-primary-foreground text-primary" : "bg-blue-100 text-blue-700"}`}>
                  {active}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktif Görevler</SelectItem>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Bekliyor</SelectItem>
            <SelectItem value="in_progress">Devam Ediyor</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter !== "active" || assigneeFilter !== "all") && (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground"
            onClick={() => { setStatusFilter("active"); setAssigneeFilter("all"); }}>
            <X className="mr-1 h-3 w-3" /> Temizle
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filteredTasks.length} görev</span>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Görev bulunamadı</p>
            <p className="text-xs mt-1">Yeni görev ekleyerek başlayabilirsiniz.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Görev</TableHead>
                <TableHead className="w-24">Durum</TableHead>
                <TableHead className="w-20">Öncelik</TableHead>
                <TableHead className="w-32">Atanan</TableHead>
                <TableHead className="w-24">Tarih</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((t) => {
                const statusCfg = STATUS_CONFIG[t.task.status] || STATUS_CONFIG.pending;
                const priorityCfg = PRIORITY_CONFIG[t.task.priority] || PRIORITY_CONFIG.normal;
                const isCompleted = t.task.status === "completed";
                const isPending = t.task.status === "pending";
                const isInProgress = t.task.status === "in_progress";
                const isDue = t.task.dueDate && new Date(t.task.dueDate) < new Date() && !isCompleted;

                return (
                  <TableRow key={t.task.id} className={isCompleted ? "opacity-50" : ""}>
                    <TableCell className="pr-0">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => {
                          if (isCompleted) handleStatusChange(t.task.id, "pending");
                          else openCompleteDialog(t);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                          {t.task.title}
                        </p>
                        {t.task.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{t.task.description}</p>
                        )}
                        {t.task.resultNote && (
                          <p className="text-xs text-green-700 mt-0.5 truncate">Sonuç: {t.task.resultNote}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] h-5 ${statusCfg.color}`}>
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] h-5 ${priorityCfg.color}`}>
                        {priorityCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.assignedName ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className={`text-[9px] ${userColorMap[t.task.assignedTo || ""] || ""}`}>
                              {getInitials(t.assignedName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs truncate">{t.assignedName.split(" ")[0]}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs ${isDue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                        {t.task.dueDate ? formatDate(t.task.dueDate) : "—"}
                        {isDue && " !"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(t)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Düzenle
                          </DropdownMenuItem>
                          {isPending && (
                            <DropdownMenuItem onClick={() => handleStatusChange(t.task.id, "in_progress")}>
                              <Play className="mr-2 h-3.5 w-3.5" /> Başla
                            </DropdownMenuItem>
                          )}
                          {(isPending || isInProgress) && (
                            <DropdownMenuItem onClick={() => openCompleteDialog(t)}>
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Tamamla
                            </DropdownMenuItem>
                          )}
                          {isCompleted && (
                            <DropdownMenuItem onClick={() => handleStatusChange(t.task.id, "pending")}>
                              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Yeniden Aç
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"
                            onClick={() => { setDeleteTask(t); setDeleteOpen(true); }}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Sil
                          </DropdownMenuItem>
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetCreate(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Yeni Görev</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Görev Başlığı</Label>
              <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="Görev başlığını girin..." />
            </div>
            <div className="space-y-2">
              <Label>Açıklama (opsiyonel)</Label>
              <Textarea value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} rows={3} placeholder="Detaylı açıklama..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Atanan Kişi</Label>
                <Select value={createAssignee || "none"} onValueChange={(v) => setCreateAssignee(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Kişi seçin..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Atanmamış</SelectItem>
                    {teamUsers.map((u) => (<SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Select value={createPriority} onValueChange={setCreatePriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Son Tarih (opsiyonel)</Label>
              <Input type="datetime-local" value={createDueDate} onChange={(e) => setCreateDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreate(); }}>İptal</Button>
            <Button onClick={handleCreate} disabled={createLoading || !createTitle.trim()}>
              {createLoading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditTask(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Görevi Düzenle</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Görev Başlığı</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Atanan Kişi</Label>
                <Select value={editAssignee || "none"} onValueChange={(v) => setEditAssignee(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Kişi seçin..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Atanmamış</SelectItem>
                    {teamUsers.map((u) => (<SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Son Tarih</Label>
              <Input type="datetime-local" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sonuç Notu</Label>
              <Textarea value={editResultNote} onChange={(e) => setEditResultNote(e.target.value)} rows={2} placeholder="Görev sonucu hakkında not..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditTask(null); }}>İptal</Button>
            <Button onClick={handleEdit} disabled={editLoading || !editTitle.trim()}>
              {editLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation */}
      <Dialog open={completeOpen} onOpenChange={(o) => { setCompleteOpen(o); if (!o) { setCompleteTask(null); setCompleteNote(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Görevi Tamamla</DialogTitle></DialogHeader>
          {completeTask && (
            <div className="space-y-4 py-2">
              <div className="rounded-md border bg-muted/50 p-3">
                <p className="font-medium text-sm">{completeTask.task.title}</p>
              </div>
              <div className="space-y-2">
                <Label>Sonuç Notu (opsiyonel)</Label>
                <Textarea value={completeNote} onChange={(e) => setCompleteNote(e.target.value)} rows={3} placeholder="Görev sonucu hakkında not..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCompleteOpen(false); setCompleteTask(null); setCompleteNote(""); }}>Vazgeç</Button>
            <Button onClick={handleComplete} disabled={completeLoading} className="bg-green-600 hover:bg-green-700 text-white">
              {completeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Tamamla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { if (!deleteLoading) { setDeleteOpen(o); if (!o) setDeleteTask(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Görevi Sil</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bu görevi silmek istediğinize emin misiniz?</p>
          {deleteTask && (
            <div className="rounded-md border bg-muted/50 p-3 text-sm">
              <p className="font-medium">{deleteTask.task.title}</p>
            </div>
          )}
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
