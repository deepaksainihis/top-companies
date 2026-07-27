import { createMasterQueries } from "@/lib/queries/masters";
import { TechStack } from "@/lib/types";

export const techStacksApi = createMasterQueries<TechStack>("tech-stacks", "tech-stacks");
