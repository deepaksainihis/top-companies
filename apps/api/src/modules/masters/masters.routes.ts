import { Router } from "express";
import countriesRouter from "@/modules/masters/countries.routes";
import techStacksRouter from "@/modules/masters/tech-stacks.routes";
import employeeRangesRouter from "@/modules/masters/employee-ranges.routes";
import hourlyRateRangesRouter from "@/modules/masters/hourly-rate-ranges.routes";

const router = Router();

router.use("/countries", countriesRouter);
router.use("/tech-stacks", techStacksRouter);
router.use("/employee-ranges", employeeRangesRouter);
// Path spelled "hour-rate-ranges" to match the PRD's literal API list.
router.use("/hour-rate-ranges", hourlyRateRangesRouter);

export default router;
