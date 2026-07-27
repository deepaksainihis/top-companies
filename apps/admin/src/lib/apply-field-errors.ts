import { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function applyFieldErrors<T extends FieldValues>(
  errors: Record<string, string[]> | undefined,
  setError: UseFormSetError<T>
) {
  if (!errors) return;
  for (const [field, messages] of Object.entries(errors)) {
    setError(field as Path<T>, { type: "server", message: messages[0] });
  }
}
