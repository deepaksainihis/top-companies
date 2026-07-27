import { createMasterQueries } from "@/lib/queries/masters";
import { EmployeeRange } from "@/lib/types";

export const employeeRangesApi = createMasterQueries<EmployeeRange>("employee-ranges", "employee-ranges");
