import "server-only";

import reportData from "../../manu_report.data.json";
import { manuReportSchema, type ManuReport } from "./manu-report.schema";

let validatedReport: ManuReport | undefined;

export function getManuReport(): ManuReport {
  validatedReport ??= manuReportSchema.parse(reportData);
  return validatedReport;
}