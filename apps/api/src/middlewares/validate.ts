import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { ValidationError } from "@/lib/errors";

type RequestPart = "body" | "query" | "params";

const zodErrorToFieldErrors = (error: ZodError): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
};

export const validate =
  (schema: ZodTypeAny, part: RequestPart = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      return next(new ValidationError("Validation failed", zodErrorToFieldErrors(result.error)));
    }

    req[part] = result.data;
    next();
  };
