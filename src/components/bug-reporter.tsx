"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bug, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BugReporter() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          description: description.trim(),
          priority,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setDescription("");
          setPriority("normal");
          setSuccess(false);
        }, 1500);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        variant="outline"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Bug Bildir"
      >
        <Bug className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Bug Bildir
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="py-8 text-center">
              <p className="text-lg font-medium text-green-600">
                Bug bildirimi gonderildi!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Tesekkurler, en kisa surede incelenecektir.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bug-page">Sayfa</Label>
                <Input
                  id="bug-page"
                  value={pathname}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bug-description">Aciklama *</Label>
                <Textarea
                  id="bug-description"
                  placeholder="Hatayı detaylı bir sekilde aciklayiniz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bug-priority">Oncelik</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dusuk">Dusuk</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="yuksek">Yuksek</SelectItem>
                    <SelectItem value="kritik">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {!success && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Iptal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!description.trim() || loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gonder
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
