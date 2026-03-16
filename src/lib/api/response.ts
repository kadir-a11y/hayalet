import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard API response helpers.
 *
 * Success: NextResponse.json(data)  — keep existing pattern, no wrapper
 * Error:   apiError("message", 400) — always { error: "message" }
 * Zod:     apiValidationError(zodError) — { error: "Validation failed", details: [...] }
 */

export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiValidationError(error: ZodError) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    },
    { status: 400 }
  );
}
