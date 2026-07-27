import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Status } from "@/lib/types";

export function StatusBadge({ status }: { status: Status }) {
  const isActive = status === "ACTIVE";
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        isActive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-muted-foreground/20 bg-muted text-muted-foreground"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
