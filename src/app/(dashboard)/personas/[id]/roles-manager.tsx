"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoleItem {
  roleId: string;
  roleName: string;
  roleColor: string | null;
  roleDescription: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

interface AvailableRole {
  id: string;
  name: string;
  color: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

export function RolesManager({
  personaId,
  onUpdated,
}: {
  personaId: string;
  onUpdated: () => void;
}) {
  const [assignedRoles, setAssignedRoles] = useState<RoleItem[]>([]);
  const [allRoles, setAllRoles] = useState<AvailableRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch(`/api/personas/${personaId}/roles`).then((r) => r.json()),
      fetch("/api/roles").then((r) => r.json()),
    ])
      .then(([assigned, all]) => {
        const assignedArr = Array.isArray(assigned) ? assigned : [];
        setAssignedRoles(assignedArr);
        setSelectedRoleIds(new Set(assignedArr.map((r: RoleItem) => r.roleId)));
        setAllRoles(Array.isArray(all) ? all : []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [personaId]);

  function toggleRole(roleId: string) {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  }

  async function saveRoles() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: Array.from(selectedRoleIds) }),
      });
      if (!res.ok) throw new Error();
      // Refresh assigned roles
      const updated = await fetch(`/api/personas/${personaId}/roles`).then((r) =>
        r.json()
      );
      setAssignedRoles(Array.isArray(updated) ? updated : []);
      onUpdated();
    } catch {
      console.error("Roller kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges =
    selectedRoleIds.size !== assignedRoles.length ||
    assignedRoles.some((r) => !selectedRoleIds.has(r.roleId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allRoles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-8 w-8 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-semibold">Hen\u00FCz rol tan\u0131mlanmam\u0131\u015F</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          \u00D6ncelikle &ldquo;Roller&rdquo; sayfas\u0131ndan rol ve kategori olu\u015Fturun.
        </p>
      </div>
    );
  }

  // Group roles by category for display
  const grouped = new Map<string, { categoryName: string; categoryColor: string | null; roles: AvailableRole[] }>();
  const uncategorized: AvailableRole[] = [];

  for (const role of allRoles) {
    if (role.categoryId && role.categoryName) {
      const existing = grouped.get(role.categoryId);
      if (existing) {
        existing.roles.push(role);
      } else {
        grouped.set(role.categoryId, {
          categoryName: role.categoryName,
          categoryColor: role.categoryColor,
          roles: [role],
        });
      }
    } else {
      uncategorized.push(role);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Bu personaya atamak istedi\u011Finiz rolleri se\u00E7in. AI i\u00E7erik \u00FCretiminde bu roller dikkate al\u0131nacakt\u0131r.
      </p>

      {Array.from(grouped.entries()).map(([catId, group]) => (
        <div key={catId} className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: group.categoryColor || "#6B7280" }}
            />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.categoryName}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.roles.map((role) => {
              const isSelected = selectedRoleIds.has(role.id);
              return (
                <Badge
                  key={role.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer select-none transition-colors"
                  style={
                    isSelected
                      ? { backgroundColor: role.color ?? undefined }
                      : { borderColor: role.color ?? undefined, color: role.color ?? undefined }
                  }
                  onClick={() => toggleRole(role.id)}
                >
                  {role.name}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      ))}

      {uncategorized.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Di\u011Fer
          </span>
          <div className="flex flex-wrap gap-2">
            {uncategorized.map((role) => {
              const isSelected = selectedRoleIds.has(role.id);
              return (
                <Badge
                  key={role.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer select-none transition-colors"
                  style={
                    isSelected
                      ? { backgroundColor: role.color ?? undefined }
                      : { borderColor: role.color ?? undefined, color: role.color ?? undefined }
                  }
                  onClick={() => toggleRole(role.id)}
                >
                  {role.name}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {hasChanges && (
        <Button onClick={saveRoles} disabled={isSaving} size="sm">
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
