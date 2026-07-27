import { createMasterQueries } from "@/lib/queries/masters";
import { Country } from "@/lib/types";

export const countriesApi = createMasterQueries<Country>("countries", "countries");
