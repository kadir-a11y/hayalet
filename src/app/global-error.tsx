"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Bir hata oluştu
          </h2>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyin.
          </p>
          <button
            onClick={reset}
            style={{ padding: "0.5rem 1.5rem", borderRadius: "0.375rem", backgroundColor: "#000", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
