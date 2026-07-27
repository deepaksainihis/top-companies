"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/api-client";
import { Status } from "@/lib/types";

interface StatusSwitchProps {
  status: Status;
  onToggle: (next: Status) => Promise<unknown>;
}

// Presentational + self-contained mutation state - used from small per-entity
// wrapper *components* (not called as a plain function) so each table row
// gets its own independent pending state without breaking hook rules.
export function StatusSwitch({ status, onToggle }: StatusSwitchProps) {
  const [pending, setPending] = useState(false);

  return (
    <Switch
      checked={status === "ACTIVE"}
      disabled={pending}
      onCheckedChange={async (checked) => {
        setPending(true);
        try {
          await onToggle(checked ? "ACTIVE" : "INACTIVE");
          toast.success("Status updated");
        } catch (error) {
          toast.error(getErrorMessage(error));
        } finally {
          setPending(false);
        }
      }}
    />
  );
}
