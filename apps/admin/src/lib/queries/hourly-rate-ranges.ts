import { createMasterQueries } from "@/lib/queries/masters";
import { HourlyRateRange } from "@/lib/types";

// Path spelled "hour-rate-ranges" to match the PRD's literal API list.
export const hourlyRateRangesApi = createMasterQueries<HourlyRateRange>("hour-rate-ranges", "hourly-rate-ranges");
