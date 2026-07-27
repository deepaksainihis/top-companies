import { createHash, randomBytes } from "crypto";

// Refresh JWTs and password-reset tokens are bearer secrets, not passwords,
// so a fast SHA-256 digest (rather than bcrypt) is the right tool: it lets us
// store/compare them without keeping the raw secret in the database.
export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const generateRawToken = (): string => randomBytes(32).toString("hex");
