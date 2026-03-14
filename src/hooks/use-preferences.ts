"use client";

import { useState, useEffect, useCallback } from "react";

type PreferenceValue = unknown;

export function usePreferences(page: string) {
  const [prefs, setPrefs] = useState<Record<string, PreferenceValue>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/preferences?page=${encodeURIComponent(page)}`)
      .then((res) => res.json())
      .then((data) => {
        setPrefs(data[page] || {});
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [page]);

  const get = useCallback(
    <T = PreferenceValue>(key: string, defaultValue?: T): T => {
      return (prefs[key] as T) ?? (defaultValue as T);
    },
    [prefs]
  );

  const set = useCallback(
    async (key: string, value: PreferenceValue) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, key, value }),
      });
    },
    [page]
  );

  const remove = useCallback(
    async (key: string) => {
      setPrefs((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      await fetch(
        `/api/preferences?page=${encodeURIComponent(page)}&key=${encodeURIComponent(key)}`,
        { method: "DELETE" }
      );
    },
    [page]
  );

  const getAll = useCallback(
    (prefix: string): Record<string, PreferenceValue> => {
      const result: Record<string, PreferenceValue> = {};
      for (const [k, v] of Object.entries(prefs)) {
        if (k.startsWith(prefix)) {
          result[k.slice(prefix.length)] = v;
        }
      }
      return result;
    },
    [prefs]
  );

  return { get, set, remove, getAll, loaded };
}
