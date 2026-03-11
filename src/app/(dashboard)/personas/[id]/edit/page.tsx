"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/**
 * Edit page - redirects to the detail page where editing is handled via a dialog.
 */
export default function PersonaEditRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    router.replace(`/personas/${id}`);
  }, [router, id]);

  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-muted-foreground">Yonlendiriliyor...</p>
    </div>
  );
}
