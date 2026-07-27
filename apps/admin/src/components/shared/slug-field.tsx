"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { slugifyPreview } from "@/lib/slugify";

interface SlugFieldProps {
  value: string;
  onChange: (value: string) => void;
  deriveFrom: string;
}

// Auto-fills the slug from `deriveFrom` (the name field) until the admin
// manually edits it directly - after that it stops auto-syncing so their
// edits are never clobbered as they keep typing the name.
export function SlugField({ value, onChange, deriveFrom }: SlugFieldProps) {
  const editedRef = useRef(false);

  useEffect(() => {
    if (!editedRef.current) {
      onChange(slugifyPreview(deriveFrom));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deriveFrom]);

  return (
    <div className="space-y-1">
      <Input
        value={value}
        onChange={(e) => {
          editedRef.current = true;
          onChange(slugifyPreview(e.target.value));
        }}
        placeholder="auto-generated-from-name"
      />
      <p className="truncate text-xs text-muted-foreground">/{value || "..."}</p>
    </div>
  );
}
